import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { generateSlug } from '../common/utils/url.util.js';
import type { Prisma, Project } from '@prisma/client';
import type { AuthenticatedActor } from '../common/types.js';
import type {
  CreateProjectDto,
  UpdateProjectDto,
  RecordOfflineContributionDto,
  ProjectPublicSummary,
} from '@ggm/types';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private mapToPublicSummary(project: any): ProjectPublicSummary {
    const successContributions = project.contributions || [];
    const raisedBigInt = successContributions.reduce(
      (acc: bigint, curr: { amountKobo: bigint }) => acc + curr.amountKobo,
      BigInt(0),
    );
    const goalBigInt = project.goalKobo;
    const percent = goalBigInt > BigInt(0)
      ? Math.min(100, Math.round(Number((raisedBigInt * BigInt(100)) / goalBigInt)))
      : 0;

    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      goalKobo: project.goalKobo.toString(),
      raisedKobo: raisedBigInt.toString(),
      percent,
      status: project.status,
      deadline: project.deadline ? project.deadline.toISOString() : null,
      contributionsCount: successContributions.length,
      createdAt: project.createdAt.toISOString(),
    };
  }

  async listPublic(page: number = 1, limit: number = 12) {
    const where: Prisma.ProjectWhereInput = { status: 'ACTIVE' };
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          contributions: {
            where: { status: 'SUCCESS' },
            select: { amountKobo: true },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: data.map((p) => this.mapToPublicSummary(p)),
      meta: { page, limit, total },
    };
  }

  async getPublicBySlug(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: {
        contributions: {
          where: { status: 'SUCCESS' },
          select: { amountKobo: true },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return this.mapToPublicSummary(project);
  }

  async getPublicContributions(slug: string, page: number = 1, limit: number = 20) {
    const project = await this.prisma.project.findUnique({ where: { slug } });
    if (!project) throw new NotFoundException('Project not found');

    const where: Prisma.ContributionWhereInput = {
      projectId: project.id,
      status: 'SUCCESS',
    };

    const [contributions, total] = await Promise.all([
      this.prisma.contribution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          projectId: true,
          amountKobo: true,
          displayName: true,
          isAnonymous: true,
          message: true,
          createdAt: true,
        },
      }),
      this.prisma.contribution.count({ where }),
    ]);

    const formatted = contributions.map((c) => ({
      id: c.id,
      projectId: c.projectId,
      amountKobo: c.amountKobo.toString(),
      displayName: c.isAnonymous ? 'Anonymous Supporter' : (c.displayName || 'Generous Giver'),
      isAnonymous: c.isAnonymous,
      message: c.isAnonymous ? null : c.message,
      createdAt: c.createdAt.toISOString(),
    }));

    return { data: formatted, meta: { page, limit, total } };
  }

  async listAdmin(page: number = 1, limit: number = 20) {
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          contributions: {
            where: { status: 'SUCCESS' },
            select: { amountKobo: true },
          },
        },
      }),
      this.prisma.project.count(),
    ]);

    return {
      data: data.map((p) => this.mapToPublicSummary(p)),
      meta: { page, limit, total },
    };
  }

  async getAdmin(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    return {
      ...this.mapToPublicSummary(project),
      contributions: project.contributions.map((c) => ({
        id: c.id,
        amountKobo: c.amountKobo.toString(),
        donorName: c.donorName,
        donorEmail: c.donorEmail,
        donorPhone: c.donorPhone,
        displayName: c.displayName,
        isAnonymous: c.isAnonymous,
        message: c.message,
        source: c.source,
        status: c.status,
        paystackRef: c.paystackRef,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  }

  async create(actor: AuthenticatedActor, dto: CreateProjectDto) {
    let slug = dto.slug ? generateSlug(dto.slug) : generateSlug(dto.title);
    const existing = await this.prisma.project.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const created = await this.prisma.project.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl ?? null,
        goalKobo: BigInt(dto.goalKobo.toString()),
        status: dto.status ?? 'DRAFT',
        deadline: dto.deadline ? new Date(dto.deadline) : null,
      },
      include: {
        contributions: {
          where: { status: 'SUCCESS' },
          select: { amountKobo: true },
        },
      },
    });

    await this.audit.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'project.create',
      entity: 'Project',
      entityId: created.id,
      meta: { title: created.title, slug: created.slug },
    });

    return this.mapToPublicSummary(created);
  }

  async update(actor: AuthenticatedActor, id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    let slug = project.slug;
    if (dto.slug && dto.slug !== project.slug) {
      slug = generateSlug(dto.slug);
      const existing = await this.prisma.project.findUnique({ where: { slug } });
      if (existing && existing.id !== id) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        slug,
        ...(dto.description && { description: dto.description }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.goalKobo !== undefined && { goalKobo: BigInt(dto.goalKobo.toString()) }),
        ...(dto.status && { status: dto.status }),
        ...(dto.deadline !== undefined && { deadline: dto.deadline ? new Date(dto.deadline) : null }),
      },
      include: {
        contributions: {
          where: { status: 'SUCCESS' },
          select: { amountKobo: true },
        },
      },
    });

    await this.audit.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'project.update',
      entity: 'Project',
      entityId: updated.id,
      meta: { title: updated.title, status: updated.status },
    });

    return this.mapToPublicSummary(updated);
  }

  async delete(actor: AuthenticatedActor, id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    await this.prisma.project.delete({ where: { id } });

    await this.audit.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'project.delete',
      entity: 'Project',
      entityId: id,
      meta: { title: project.title },
    });

    return { success: true };
  }

  async recordOfflineContribution(actor: AuthenticatedActor, projectId: string, dto: RecordOfflineContributionDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const contribution = await this.prisma.contribution.create({
      data: {
        projectId,
        amountKobo: BigInt(dto.amountKobo.toString()),
        donorName: dto.donorName ?? null,
        donorPhone: dto.donorPhone ?? null,
        displayName: dto.displayName ?? null,
        isAnonymous: dto.isAnonymous ?? true,
        message: dto.message ?? null,
        source: 'OFFLINE',
        status: 'SUCCESS',
        recordedById: actor.id,
      },
    });

    await this.audit.log({
      actorId: actor.id,
      actorName: actor.name,
      action: 'contribution.offline_record',
      entity: 'Contribution',
      entityId: contribution.id,
      meta: {
        projectId,
        projectTitle: project.title,
        amountKobo: contribution.amountKobo.toString(),
      },
    });

    return {
      id: contribution.id,
      projectId: contribution.projectId,
      amountKobo: contribution.amountKobo.toString(),
      displayName: contribution.displayName,
      isAnonymous: contribution.isAnonymous,
      createdAt: contribution.createdAt.toISOString(),
    };
  }
}
