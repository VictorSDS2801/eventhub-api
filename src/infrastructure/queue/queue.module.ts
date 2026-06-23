import { Module } from '@nestjs/common';
import { ConfigModule } from '../shared/config/config.module';
import { I_NOTIFICATION_PORT } from '../../domain/ports/notification.port';
import { BullMQNotificationAdapter } from '../adapters/bullmq-notification.adapter';
import { NotificationProcessor } from './notification.processor';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: I_NOTIFICATION_PORT,
      useClass: BullMQNotificationAdapter,
    },
    NotificationProcessor,
  ],
  exports: [I_NOTIFICATION_PORT],
})
export class QueueModule {}
