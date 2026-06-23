import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import type {
  INotificationPort,
  IEnrollmentConfirmedPayload,
  IEnrollmentWaitlistedPayload,
  IWaitlistPromotedPayload,
} from '../../domain/ports/notification.port';
import {
  NOTIFICATION_QUEUE_NAME,
  NotificationJobType,
} from '../queue/queue.constants';
import { buildRedisConnection } from '../queue/redis-connection';

@Injectable()
export class BullMQNotificationAdapter
  implements INotificationPort, OnModuleDestroy
{
  private readonly queue: Queue;

  constructor(private readonly configService: ConfigService) {
    this.queue = new Queue(NOTIFICATION_QUEUE_NAME, {
      connection: buildRedisConnection(configService),
    });
  }

  async enqueueEnrollmentConfirmed(
    payload: IEnrollmentConfirmedPayload,
  ): Promise<void> {
    await this.queue.add(NotificationJobType.ENROLLMENT_CONFIRMED, payload);
  }

  async enqueueEnrollmentWaitlisted(
    payload: IEnrollmentWaitlistedPayload,
  ): Promise<void> {
    await this.queue.add(NotificationJobType.ENROLLMENT_WAITLISTED, payload);
  }

  async enqueueWaitlistPromoted(
    payload: IWaitlistPromotedPayload,
  ): Promise<void> {
    await this.queue.add(NotificationJobType.WAITLIST_PROMOTED, payload);
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
