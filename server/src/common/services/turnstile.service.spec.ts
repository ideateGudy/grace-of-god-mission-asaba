import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TurnstileService } from './turnstile.service';
import { BadRequestException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

describe('TurnstileService', () => {
  let service: TurnstileService;
  let configMock: any;

  beforeEach(() => {
    configMock = {
      get: vi.fn(),
    };
    service = new TurnstileService(configMock as unknown as ConfigService);
  });

  it('allows requests when no secret key is configured (local dev/test)', async () => {
    configMock.get.mockReturnValue('');
    const result = await service.verifyToken('any-token');
    expect(result).toBe(true);
  });

  it('allows Cloudflare dummy test tokens automatically', async () => {
    configMock.get.mockReturnValue('0x4AAAAAAtestsecret');
    const result = await service.verifyToken('1x0000000000000000000000000000000AA');
    expect(result).toBe(true);
  });

  it('throws BadRequestException when token is missing and secret is set', async () => {
    configMock.get.mockReturnValue('0x4AAAAAAtestsecret');
    await expect(service.verifyToken('')).rejects.toThrow(BadRequestException);
  });
});
