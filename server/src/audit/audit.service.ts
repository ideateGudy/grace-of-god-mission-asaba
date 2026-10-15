import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AuditLogEntry {
  actorId?: string;
  actorName?: string;
  action: string;
  entity: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const sanitizedMeta = this.sanitizeMeta(entry.meta);

      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId,
          actorName: entry.actorName,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          meta: sanitizedMeta ? JSON.parse(JSON.stringify(sanitizedMeta)) : undefined,
        },
      });
    } catch (error) {
      // Never throw, just log internally
      this.logger.error('Failed to write audit log entry', error);
    }
  }

  private sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!meta) return undefined;
    const sanitized = { ...meta };
    
    // Never store secrets or message bodies
    const sensitiveKeys = ['password', 'token', 'secret', 'body', 'message', 'request', 'cookie'];
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}
