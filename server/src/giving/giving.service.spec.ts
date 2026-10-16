import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GivingService } from './giving.service.js';
import * as crypto from 'node:crypto';

describe('GivingService', () => {
  const contribution = {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  };
  const project = {
    findUnique: vi.fn(),
  };
  const configService = {
    get: vi.fn((key: string) => {
      if (key === 'PAYSTACK_SECRET_KEY') return 'sk_test_fake_secret_key_123';
      if (key === 'CORS_ORIGIN') return 'http://localhost:3000';
      return null;
    }),
  };
  const audit = { log: vi.fn().mockResolvedValue(undefined) };

  const service = new GivingService(
    { contribution, project } as never,
    configService as never,
    audit as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects webhook with invalid signature', async () => {
    const rawPayload = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_123' } });
    await expect(
      service.handlePaystackWebhook(rawPayload, 'invalid_signature_hash'),
    ).rejects.toThrow('Invalid signature');
  });

  it('accepts and verifies valid webhook signature, updating status to SUCCESS', async () => {
    const payload = {
      event: 'charge.success',
      data: {
        reference: 'ggm_test_ref_456',
        status: 'success',
        amount: 250000,
      },
    };
    const rawPayload = JSON.stringify(payload);
    const validSignature = crypto
      .createHmac('sha512', 'sk_test_fake_secret_key_123')
      .update(Buffer.from(rawPayload))
      .digest('hex');

    contribution.findUnique.mockResolvedValue({
      id: 'c-456',
      paystackRef: 'ggm_test_ref_456',
      amountKobo: BigInt(250000),
      status: 'PENDING',
    });
    contribution.update.mockResolvedValue({
      id: 'c-456',
      status: 'SUCCESS',
      amountKobo: BigInt(250000),
    });

    const result = await service.handlePaystackWebhook(rawPayload, validSignature);
    expect(result).toEqual({ received: true });
    expect(contribution.update).toHaveBeenCalledWith({
      where: { id: 'c-456' },
      data: { status: 'SUCCESS' },
    });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'giving.webhook_success',
      entityId: 'c-456',
    }));
  });

  it('exports CSV formatted report of contributions', async () => {
    contribution.findMany.mockResolvedValue([
      {
        id: 'c-1',
        paystackRef: 'ref_abc',
        amountKobo: BigInt(1000000),
        donorName: 'Chukwuma Obi',
        donorEmail: 'chukwuma@example.test',
        donorPhone: '08031234567',
        displayName: 'Chukwuma O.',
        isAnonymous: false,
        message: 'God bless',
        source: 'ONLINE',
        status: 'SUCCESS',
        createdAt: new Date('2026-06-15T09:00:00Z'),
        project: { title: 'Youth Center Building' },
      },
    ]);

    const csv = await service.exportContributionsCsv();
    expect(csv).toContain('Transaction Ref,Project,Amount (NGN)');
    expect(csv).toContain('ref_abc,"Youth Center Building",10000.00,ONLINE,SUCCESS,"Chukwuma Obi",chukwuma@example.test');
  });
});
