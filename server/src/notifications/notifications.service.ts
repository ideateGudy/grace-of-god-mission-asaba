import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ContactAlertPayload {
  name: string;
  email?: string | null;
  phone?: string | null;
  message: string;
}

export interface PrayerAlertPayload {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  request: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly configService: ConfigService) {}

  private getNotificationEmail(): string {
    return (
      this.configService.get<string>('NOTIFICATION_EMAIL') ||
      this.configService.get<string>('SUPER_ADMIN_SEED_EMAIL') ||
      'pastor@ggmasaba.org'
    );
  }

  async sendContactAlert(payload: ContactAlertPayload): Promise<void> {
    const to = this.getNotificationEmail();
    const subject = `[GGM Asaba] New Contact Message from ${payload.name}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #141633; margin-top: 0;">New Contact Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Email:</strong> ${payload.email ? escapeHtml(payload.email) : 'None provided'}</p>
        <p><strong>Phone:</strong> ${payload.phone ? escapeHtml(payload.phone) : 'None provided'}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Message:</strong></p>
        <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; white-space: pre-wrap;">
          ${escapeHtml(payload.message)}
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
          Submitted on ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} · Grace of God Mission Asaba
        </p>
      </div>
    `;

    await this.dispatchEmail(to, subject, html);
  }

  async sendPrayerAlert(payload: PrayerAlertPayload): Promise<void> {
    const to = this.getNotificationEmail();
    const sender = payload.name ? payload.name : 'Anonymous Member';
    const subject = `[GGM Asaba] Confidential Prayer Request from ${sender}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #141633; margin-top: 0;">New Prayer Request 🙏</h2>
        <p><strong>From:</strong> ${escapeHtml(sender)}</p>
        <p><strong>Email:</strong> ${payload.email ? escapeHtml(payload.email) : 'Not provided'}</p>
        <p><strong>Phone:</strong> ${payload.phone ? escapeHtml(payload.phone) : 'Not provided'}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Prayer Petition:</strong></p>
        <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; white-space: pre-wrap;">
          ${escapeHtml(payload.request)}
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
          Submitted on ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} · Confidential pastoral prayer inbox
        </p>
      </div>
    `;

    await this.dispatchEmail(to, subject, html);
  }

  private async dispatchEmail(to: string, subject: string, html: string): Promise<void> {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY')?.trim();

    if (!resendApiKey) {
      this.logger.log(`[EMAIL NOTIFICATION DISPATCHED (Mock/Log mode)] To: ${to} | Subject: "${subject}"`);
      return;
    }

    try {
      const fromEmail = this.configService.get<string>('SENDER_EMAIL') || 'notifications@ggmasaba.org';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Grace of God Mission <${fromEmail}>`,
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.warn(`Failed to dispatch email via Resend: ${errText}`);
      }
    } catch (err: any) {
      this.logger.error(`Error sending email notification: ${err?.message}`);
    }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
