import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService', () => {
  const project = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const contribution = {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  };
  const audit = { log: vi.fn().mockResolvedValue(undefined) };
  const service = new ProjectsService({ project, contribution } as never, audit as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates raised amount and percentage properly for public projects', async () => {
    const mockProject = {
      id: 'proj-1',
      slug: 'church-roof-repair',
      title: 'Church Roof Repair',
      description: 'Replacing damaged roof sheets',
      imageUrl: null,
      goalKobo: BigInt(10000000), // ₦100,000
      status: 'ACTIVE',
      deadline: new Date('2026-12-31T00:00:00Z'),
      createdAt: new Date('2026-01-01T00:00:00Z'),
      contributions: [
        { amountKobo: BigInt(2500000) }, // ₦25,000
        { amountKobo: BigInt(2500000) }, // ₦25,000
      ],
    };

    project.findMany.mockResolvedValue([mockProject]);
    project.count.mockResolvedValue(1);

    const result = await service.listPublic(1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].goalKobo).toBe('10000000');
    expect(result.data[0].raisedKobo).toBe('5000000');
    expect(result.data[0].percent).toBe(50);
    expect(result.data[0].contributionsCount).toBe(2);
  });

  it('anonymizes donors who opt out of public display', async () => {
    project.findUnique.mockResolvedValue({ id: 'proj-1', slug: 'church-roof' });
    contribution.findMany.mockResolvedValue([
      {
        id: 'c-1',
        projectId: 'proj-1',
        amountKobo: BigInt(500000),
        displayName: 'Secret Giver',
        isAnonymous: true,
        message: 'May God bless the church',
        createdAt: new Date('2026-05-01T12:00:00Z'),
      },
      {
        id: 'c-2',
        projectId: 'proj-1',
        amountKobo: BigInt(1000000),
        displayName: 'Bro Chukwuma',
        isAnonymous: false,
        message: 'Proud to support',
        createdAt: new Date('2026-05-02T12:00:00Z'),
      },
    ]);
    contribution.count.mockResolvedValue(2);

    const result = await service.getPublicContributions('church-roof', 1, 10);
    expect(result.data[0].displayName).toBe('Anonymous Supporter');
    expect(result.data[0].message).toBeNull();
    expect(result.data[1].displayName).toBe('Bro Chukwuma');
    expect(result.data[1].message).toBe('Proud to support');
  });

  it('records offline contribution and writes audit trail', async () => {
    const actor = { id: 'admin-1', email: 'admin@ggm.org', name: 'Admin Goodnews', role: 'SUPER_ADMIN' as const, permissions: [] };
    project.findUnique.mockResolvedValue({ id: 'proj-1', title: 'New Bus Fund' });
    contribution.create.mockResolvedValue({
      id: 'c-offline-1',
      projectId: 'proj-1',
      amountKobo: BigInt(5000000),
      displayName: 'Cash Donor',
      isAnonymous: false,
      createdAt: new Date('2026-06-01T10:00:00Z'),
    });

    const result = await service.recordOfflineContribution(actor as never, 'proj-1', {
      amountKobo: 5000000,
      displayName: 'Cash Donor',
      isAnonymous: false,
    });

    expect(result.id).toBe('c-offline-1');
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'contribution.offline_record',
      entityId: 'c-offline-1',
    }));
  });
});
