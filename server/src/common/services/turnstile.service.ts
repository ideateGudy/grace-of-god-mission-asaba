import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);

  constructor(private readonly configService: ConfigService) {}

  async verifyToken(token?: string, remoteIp?: string): Promise<boolean> {
    const secretKey = this.configService.get<string>('CLOUDFLARE_TURNSTILE_SECRET_KEY')?.trim();

    // In local development or testing without a configured secret, allow requests
    if (!secretKey) {
      return true;
    }

    // Cloudflare dummy test keys pass in any environment
    if (token === '1x0000000000000000000000000000000AA' || token === 'XXXX.DUMMY.TOKEN.XXXX') {
      return true;
    }

    if (!token) {
      throw new BadRequestException('Security check required. Please verify that you are human.');
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', token);
      if (remoteIp) {
        formData.append('remoteip', remoteIp);
      }

      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const outcome = (await res.json()) as { success: boolean; 'error-codes'?: string[] };

      if (!outcome.success) {
        this.logger.warn(`Turnstile validation failed: ${JSON.stringify(outcome['error-codes'])}`);
        throw new BadRequestException('Security verification failed. Please try again.');
      }

      return true;
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`Error verifying Turnstile token: ${err?.message}`);
      // Fallback: If network issue contacting Cloudflare, don't drop urgent prayer/contact requests
      return true;
    }
  }
}
