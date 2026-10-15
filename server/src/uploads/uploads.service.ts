import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'node:crypto';

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {}

  async getSignature(scope = 'gallery', customPublicId?: string) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Cloudinary upload credentials are not configured on the server.');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const safeScope = scope.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const folder = `grace-of-god-mission/${safeScope}`;
    const publicId = customPublicId || `${safeScope}_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const allowedFormats = 'jpg,jpeg,png,webp,avif';

    const paramsToSign: Record<string, string | number> = {
      folder,
      public_id: publicId,
      timestamp,
    };

    const sortedQuery = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&');

    const signature = createHash('sha1')
      .update(sortedQuery + apiSecret)
      .digest('hex');

    return {
      cloudName,
      apiKey,
      timestamp,
      folder,
      publicId,
      allowedFormats,
      signature,
    };
  }
}
