import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { MessagesController } from './messages.controller.js';
import { TurnstileService } from '../common/services/turnstile.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  providers: [MessagesService, TurnstileService],
  controllers: [MessagesController],
})
export class MessagesModule {}
