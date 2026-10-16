import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { Prisma, Contribution } from '@prisma/client';
import type { AuthenticatedActor } from '../common/types.js';
import type { InitializeGivingDto, ContributionAdminItem } from '@ggm/types';
import * as crypto from 'node:crypto';

@Injectable()
export class GivingService {
  private readonly logger = new Logger(GivingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly audit: AuditService,
  ) {}

  private getPaystackSecretKey(): string | undefined {
    return this.configService.get<string>('PAYSTACK_SECRET_KEY')?.trim();
  }

  private getSiteUrl(explicitCallbackUrl?: string | null, requestOrigin?: string): string {
    if (explicitCallbackUrl) {
      try {
        const u = new URL(explicitCallbackUrl);
        return u.origin;
      } catch {}
    }
    if (requestOrigin) {
      try {
        const u = new URL(requestOrigin);
        return u.origin;
      } catch {}
    }
    const configured = this.configService.get<string>('FRONTEND_URL') || this.configService.get<string>('CORS_ORIGIN');
    if (configured && configured.startsWith('http')) {
      return configured.split(',')[0].trim().replace(/\/$/, '');
    }
    return 'https://ggmasaba.vercel.app';
  }

  async initialize(dto: InitializeGivingDto, clientIp?: string, requestOrigin?: string) {
    let projectTitle: string | null = null;
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) throw new NotFoundException('Selected project does not exist');
      if (project.status !== 'ACTIVE') throw new BadRequestException('Selected project is not currently accepting donations');
      projectTitle = project.title;
    }

    const reference = `ggm_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const amountKobo = BigInt(dto.amountKobo);

    // Create pending contribution in DB
    const contribution = await this.prisma.contribution.create({
      data: {
        projectId: dto.projectId ?? null,
        amountKobo,
        donorEmail: dto.donorEmail.toLowerCase().trim(),
        donorName: dto.donorName?.trim() || null,
        donorPhone: dto.donorPhone?.trim() || null,
        displayName: dto.displayName?.trim() || null,
        isAnonymous: dto.isAnonymous ?? true,
        message: dto.message?.trim() || null,
        source: 'ONLINE',
        status: 'PENDING',
        paystackRef: reference,
      },
    });

    const secretKey = this.getPaystackSecretKey();
    const siteUrl = this.getSiteUrl(dto.callbackUrl, requestOrigin);
    const callbackUrl = `${siteUrl}/give/thanks`;

    // If no live Paystack secret key is configured yet, provide a mock authorization url for local development
    if (!secretKey) {
      this.logger.warn('PAYSTACK_SECRET_KEY is not set. Using local development fallback redirect.');
      return {
        authorization_url: `${callbackUrl}?reference=${reference}&mock=true`,
        access_code: `mock_access_${reference}`,
        reference,
      };
    }

    // Call Paystack Initialize API
    try {
      const res = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: dto.donorEmail,
          amount: dto.amountKobo, // Paystack expects integer amount in kobo
          reference,
          callback_url: callbackUrl,
          metadata: {
            contributionId: contribution.id,
            projectId: dto.projectId,
            projectTitle,
            isAnonymous: dto.isAnonymous,
            clientIp,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) {
        this.logger.error(`Paystack initialize error: ${JSON.stringify(data)}`);
        throw new BadRequestException(data.message || 'Unable to initialize transaction with Paystack');
      }

      return {
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference,
      };
    } catch (err: any) {
      this.logger.error(`Error initiating Paystack payment: ${err.message}`);
      throw new BadRequestException(err.message || 'Payment provider communication error');
    }
  }

  async verifyPayment(reference: string) {
    const cleanRef = (reference.includes(',') ? reference.split(',')[0] : reference).trim();
    const contribution = await this.prisma.contribution.findUnique({
      where: { paystackRef: cleanRef },
      include: { project: true },
    });

    if (!contribution) {
      throw new NotFoundException('Contribution reference not found');
    }

    // If already marked SUCCESS, return immediately
    if (contribution.status === 'SUCCESS') {
      return {
        status: 'SUCCESS',
        reference: contribution.paystackRef,
        amountKobo: contribution.amountKobo.toString(),
        projectTitle: contribution.project?.title || 'General Church Giving',
        displayName: contribution.isAnonymous ? 'Anonymous' : (contribution.displayName || 'Friend of Grace of God Mission'),
        createdAt: contribution.createdAt.toISOString(),
      };
    }

    const secretKey = this.getPaystackSecretKey();

    // If in dev mock mode without secret key, mark success
    if (!secretKey) {
      const updated = await this.prisma.contribution.update({
        where: { id: contribution.id },
        data: { status: 'SUCCESS' },
        include: { project: true },
      });
      return {
        status: 'SUCCESS',
        reference: updated.paystackRef,
        amountKobo: updated.amountKobo.toString(),
        projectTitle: updated.project?.title || 'General Church Giving',
        displayName: updated.isAnonymous ? 'Anonymous' : (updated.displayName || 'Friend of Grace of God Mission'),
        createdAt: updated.createdAt.toISOString(),
      };
    }

    // Verify directly with Paystack API
    try {
      const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(cleanRef)}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      const data = await res.json();

      if (res.ok && data.status && data.data?.status === 'success') {
        const paystackAmount = BigInt(data.data.amount);
        if (paystackAmount >= contribution.amountKobo && data.data.currency === 'NGN') {
          const updated = await this.prisma.contribution.update({
            where: { id: contribution.id },
            data: { status: 'SUCCESS' },
            include: { project: true },
          });

          await this.audit.log({
            actorId: 'paystack_webhook',
            actorName: 'Paystack Automated Verification',
            action: 'giving.verified',
            entity: 'Contribution',
            entityId: updated.id,
            meta: {
              reference,
              amountKobo: updated.amountKobo.toString(),
              projectId: updated.projectId,
            },
          });

          return {
            status: 'SUCCESS',
            reference: updated.paystackRef,
            amountKobo: updated.amountKobo.toString(),
            projectTitle: updated.project?.title || 'General Church Giving',
            displayName: updated.isAnonymous ? 'Anonymous' : (updated.displayName || 'Friend of Grace of God Mission'),
            createdAt: updated.createdAt.toISOString(),
          };
        }
      }

      if (data.data?.status === 'failed') {
        await this.prisma.contribution.update({
          where: { id: contribution.id },
          data: { status: 'FAILED' },
        });
        return {
          status: 'FAILED',
          reference: contribution.paystackRef,
          amountKobo: contribution.amountKobo.toString(),
          projectTitle: contribution.project?.title || 'General Church Giving',
          displayName: 'Anonymous',
          createdAt: contribution.createdAt.toISOString(),
        };
      }

      return {
        status: contribution.status,
        reference: contribution.paystackRef,
        amountKobo: contribution.amountKobo.toString(),
        projectTitle: contribution.project?.title || 'General Church Giving',
        displayName: 'Anonymous',
        createdAt: contribution.createdAt.toISOString(),
      };
    } catch (err: any) {
      this.logger.error(`Error verifying transaction ${reference}: ${err.message}`);
      return {
        status: contribution.status,
        reference: contribution.paystackRef,
        amountKobo: contribution.amountKobo.toString(),
        projectTitle: contribution.project?.title || 'General Church Giving',
        displayName: 'Anonymous',
        createdAt: contribution.createdAt.toISOString(),
      };
    }
  }

  async handlePaystackWebhook(rawBody: string | Buffer, signature: string | undefined) {
    const secretKey = this.getPaystackSecretKey();
    if (!secretKey) {
      this.logger.warn('Received Paystack webhook but PAYSTACK_SECRET_KEY is not configured');
      return { received: true };
    }

    if (!signature) {
      throw new UnauthorizedException('Missing x-paystack-signature header');
    }

    const payloadBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
    const hash = crypto.createHmac('sha512', secretKey).update(payloadBuffer).digest('hex');

    if (hash !== signature) {
      this.logger.error('Invalid Paystack webhook signature');
      throw new UnauthorizedException('Invalid signature');
    }

    let payload: any;
    try {
      payload = JSON.parse(payloadBuffer.toString('utf8'));
    } catch {
      throw new BadRequestException('Malformed JSON webhook payload');
    }

    const event = payload.event;
    const data = payload.data;
    const reference = data?.reference;

    if (!reference) {
      return { received: true };
    }

    if (event === 'charge.success' && data.status === 'success') {
      const contribution = await this.prisma.contribution.findUnique({
        where: { paystackRef: reference },
      });

      if (contribution && contribution.status !== 'SUCCESS') {
        await this.prisma.contribution.update({
          where: { id: contribution.id },
          data: { status: 'SUCCESS' },
        });

        await this.audit.log({
          actorId: 'paystack_webhook',
          actorName: 'Paystack Webhook',
          action: 'giving.webhook_success',
          entity: 'Contribution',
          entityId: contribution.id,
          meta: { reference, amountKobo: contribution.amountKobo.toString() },
        });
      }
    } else if (event === 'charge.failed' || data.status === 'failed') {
      const contribution = await this.prisma.contribution.findUnique({
        where: { paystackRef: reference },
      });
      if (contribution && contribution.status === 'PENDING') {
        await this.prisma.contribution.update({
          where: { id: contribution.id },
          data: { status: 'FAILED' },
        });
      }
    }

    return { received: true };
  }

  async listAdminContributions(page: number = 1, limit: number = 20, projectId?: string, status?: string) {
    const where: Prisma.ContributionWhereInput = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status as any;

    const [items, total, totalRaisedResult] = await Promise.all([
      this.prisma.contribution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { project: { select: { title: true } } },
      }),
      this.prisma.contribution.count({ where }),
      this.prisma.contribution.aggregate({
        where: { ...where, status: 'SUCCESS' },
        _sum: { amountKobo: true },
      }),
    ]);

    const formatted: ContributionAdminItem[] = items.map((c) => ({
      id: c.id,
      projectId: c.projectId,
      projectTitle: c.project?.title || 'General Church Giving',
      amountKobo: c.amountKobo.toString(),
      donorName: c.donorName,
      donorEmail: c.donorEmail,
      donorPhone: c.donorPhone,
      displayName: c.displayName,
      isAnonymous: c.isAnonymous,
      message: c.message,
      source: c.source as any,
      status: c.status as any,
      paystackRef: c.paystackRef,
      recordedById: c.recordedById,
      createdAt: c.createdAt.toISOString(),
    }));

    const totalRaisedKobo = totalRaisedResult._sum.amountKobo?.toString() || '0';

    return {
      data: formatted,
      meta: { page, limit, total, totalRaisedKobo },
    };
  }

  async exportContributionsCsv(projectId?: string): Promise<string> {
    const where: Prisma.ContributionWhereInput = {};
    if (projectId) where.projectId = projectId;

    const items = await this.prisma.contribution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { title: true } } },
    });

    const header = [
      'Date (UTC)',
      'Transaction Ref',
      'Project',
      'Amount (NGN)',
      'Source',
      'Status',
      'Donor Name',
      'Donor Email',
      'Donor Phone',
      'Display Preference',
      'Message',
    ].join(',');

    const rows = items.map((c) => {
      const amountNaira = (Number(c.amountKobo) / 100).toFixed(2);
      const project = c.project?.title ? `"${c.project.title.replace(/"/g, '""')}"` : '"General Giving"';
      const name = c.donorName ? `"${c.donorName.replace(/"/g, '""')}"` : '""';
      const email = c.donorEmail || '';
      const phone = c.donorPhone || '';
      const display = c.isAnonymous ? 'Anonymous' : (c.displayName ? `"${c.displayName.replace(/"/g, '""')}"` : 'Public');
      const message = c.message ? `"${c.message.replace(/"/g, '""')}"` : '""';

      return [
        c.createdAt.toISOString(),
        c.paystackRef || c.id,
        project,
        amountNaira,
        c.source,
        c.status,
        name,
        email,
        phone,
        display,
        message,
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }
}
