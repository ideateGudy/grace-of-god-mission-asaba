import { describe, expect, it } from 'vitest';
import { UploadsService } from './uploads.service.js';
import { ConfigService } from '@nestjs/config';

describe('UploadsService', () => {
  it('generates a valid Cloudinary signature and upload parameters', async () => {
    const configMap: Record<string, string> = {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
    };

    const configService = {
      get: (key: string) => configMap[key],
    } as unknown as ConfigService;

    const service = new UploadsService(configService);
    const result = await service.getSignature('gallery', 'test-image');

    expect(result.cloudName).toBe('test-cloud');
    expect(result.apiKey).toBe('test-key');
    expect(result.folder).toBe('grace-of-god-mission/gallery');
    expect(result.publicId).toBe('test-image');
    expect(typeof result.signature).toBe('string');
    expect(result.signature.length).toBe(40); // SHA-1 hex length is 40
  });

  it('throws an error if Cloudinary credentials are not configured', async () => {
    const configService = {
      get: () => undefined,
    } as unknown as ConfigService;

    const service = new UploadsService(configService);
    await expect(service.getSignature('gallery')).rejects.toThrow('Cloudinary upload credentials are not configured');
  });
});
