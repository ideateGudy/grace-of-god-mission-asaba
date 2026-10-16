import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessagesService } from './messages.service.js';

describe('MessagesService', () => {
  const contactMessage = { create: vi.fn(), count: vi.fn(), findMany: vi.fn() };
  const prayerRequest = { create: vi.fn() };
  const audit = { log: vi.fn().mockResolvedValue(undefined) };
  const turnstile = { verifyToken: vi.fn().mockResolvedValue(true) };
  const notifications = {
    sendContactAlert: vi.fn().mockResolvedValue(undefined),
    sendPrayerAlert: vi.fn().mockResolvedValue(undefined),
  };
  const service = new MessagesService(
    { contactMessage, prayerRequest } as never,
    audit as never,
    turnstile as never,
    notifications as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('silently accepts a honeypot contact submission without storing it', async () => {
    await expect(service.createContact({ honeypot: 'bot-filled' })).resolves.toEqual({ success: true });
    expect(contactMessage.create).not.toHaveBeenCalled();
  });

  it('stores only the public contact fields and excludes consent metadata', async () => {
    contactMessage.create.mockResolvedValue({ id: 'message-1' });

    await expect(service.createContact({
      name: 'Ada', email: 'ada@example.test', phone: '123', message: 'Please call me', consent: true,
    })).resolves.toEqual({ success: true });
    expect(contactMessage.create).toHaveBeenCalledWith({
      data: { name: 'Ada', email: 'ada@example.test', phone: '123', message: 'Please call me' },
    });
  });

  it('silently accepts a honeypot prayer request without storing it', async () => {
    await expect(service.createPrayer({ honeypot: 'bot-filled' })).resolves.toEqual({ success: true });
    expect(prayerRequest.create).not.toHaveBeenCalled();
  });

  it('lists new contact messages first and fills the page with older statuses', async () => {
    const newest = [{ id: 'new-1' }, { id: 'new-2' }];
    const older = [{ id: 'read-1' }];
    contactMessage.count
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(2);
    contactMessage.findMany
      .mockResolvedValueOnce(newest)
      .mockResolvedValueOnce(older);

    const result = await service.listContact(undefined, 1, 3);

    expect(result).toEqual({ data: [...newest, ...older], meta: { page: 1, limit: 3, total: 8 } });
    expect(contactMessage.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: { status: 'NEW' }, skip: 0, take: 2,
    }));
    expect(contactMessage.findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: { status: { not: 'NEW' } }, skip: 0, take: 1,
    }));
  });
});
