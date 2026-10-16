import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationsService } from './notifications.service.js';
import type { ConfigService } from '@nestjs/config';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let configMock: any;
  const originalFetch = global.fetch;

  beforeEach(() => {
    configMock = {
      get: vi.fn(),
    };
    service = new NotificationsService(configMock as unknown as ConfigService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('falls back to mock/log mode when RESEND_API_KEY is not configured', async () => {
    configMock.get.mockImplementation((key: string) => {
      if (key === 'RESEND_API_KEY') return undefined;
      if (key === 'SUPER_ADMIN_SEED_EMAIL') return 'admin@ggmasaba.org';
      return undefined;
    });

    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    await service.sendContactAlert({
      name: 'Brother Chidi',
      email: 'chidi@example.com',
      phone: '+2348012345678',
      message: 'Inquiring about Sunday service times.',
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('dispatches contact alert via Resend API when RESEND_API_KEY is present', async () => {
    configMock.get.mockImplementation((key: string) => {
      if (key === 'RESEND_API_KEY') return 're_test_key_123';
      if (key === 'RESEND_FROM_EMAIL') return 'notifications@ggmasaba.org';
      if (key === 'NOTIFICATION_EMAIL') return 'churchoffice@ggmasaba.org';
      return undefined;
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: 'msg_resend_456' }),
    });
    global.fetch = fetchMock;

    await service.sendContactAlert({
      name: 'Sister Amaka',
      email: 'amaka@example.com',
      message: 'Greetings in Jesus name!',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer re_test_key_123',
      'Content-Type': 'application/json',
    });

    const parsedBody = JSON.parse(options.body);
    expect(parsedBody.to).toEqual(['churchoffice@ggmasaba.org']);
    expect(parsedBody.from).toBe('Grace of God Mission <notifications@ggmasaba.org>');
    expect(parsedBody.subject).toContain('Sister Amaka');
    expect(parsedBody.html).toContain('Sister Amaka');
    expect(parsedBody.html).toContain('Greetings in Jesus name!');
  });

  it('dispatches prayer request alert and respects custom formatted from-header', async () => {
    configMock.get.mockImplementation((key: string) => {
      if (key === 'RESEND_API_KEY') return 're_live_test_789';
      if (key === 'RESEND_FROM_EMAIL') return 'GGM Pastoral Team <pastor@ggmasaba.org>';
      if (key === 'SUPER_ADMIN_SEED_EMAIL') return 'pastor@ggmasaba.org';
      return undefined;
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: 'msg_prayer_101' }),
    });
    global.fetch = fetchMock;

    await service.sendPrayerAlert({
      request: 'Praying for healing and strength in my family.',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    const parsedBody = JSON.parse(options.body);

    expect(parsedBody.to).toEqual(['pastor@ggmasaba.org']);
    expect(parsedBody.from).toBe('GGM Pastoral Team <pastor@ggmasaba.org>');
    expect(parsedBody.subject).toContain('Anonymous Member');
    expect(parsedBody.html).toContain('Praying for healing and strength');
  });

  it('handles Resend API failure gracefully without throwing unhandled exceptions', async () => {
    configMock.get.mockImplementation((key: string) => {
      if (key === 'RESEND_API_KEY') return 're_invalid_key';
      return undefined;
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: vi.fn().mockResolvedValue('API key is restricted or domain unverified'),
    });
    global.fetch = fetchMock;

    await expect(
      service.sendContactAlert({
        name: 'Test Visitor',
        message: 'Hello',
      }),
    ).resolves.not.toThrow();
  });
});
