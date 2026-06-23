/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import {
  NOTIFICATION_QUEUE_NAME,
  NotificationJobType,
} from './queue.constants';
import { buildRedisConnection } from './redis-connection';
import type {
  IEnrollmentConfirmedPayload,
  IEnrollmentWaitlistedPayload,
  IWaitlistPromotedPayload,
} from '../../domain/ports/notification.port';

@Injectable()
export class NotificationProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationProcessor.name);
  private worker!: Worker;
  private transporter!: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    this.logger.log(`📧 Conta Ethereal criada: ${testAccount.user}`);

    this.worker = new Worker(
      NOTIFICATION_QUEUE_NAME,
      async (job: Job) => {
        await this.processJob(job);
      },
      {
        connection: buildRedisConnection(this.configService),
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`✅ Job ${job.id} (${job.name}) processado com sucesso`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `❌ Job ${job?.id} (${job?.name}) falhou: ${err.message}`,
      );
    });

    this.logger.log('🚀 NotificationProcessor iniciado e escutando a fila');
  }

  private async processJob(job: Job): Promise<void> {
    switch (job.name) {
      case NotificationJobType.ENROLLMENT_CONFIRMED: {
        await this.sendEnrollmentConfirmed(
          job.data as IEnrollmentConfirmedPayload,
        );
        break;
      }
      case NotificationJobType.ENROLLMENT_WAITLISTED: {
        await this.sendEnrollmentWaitlisted(
          job.data as IEnrollmentWaitlistedPayload,
        );
        break;
      }
      case NotificationJobType.WAITLIST_PROMOTED: {
        await this.sendWaitlistPromoted(job.data as IWaitlistPromotedPayload);
        break;
      }
      default:
        this.logger.warn(`Job desconhecido: ${job.name}`);
    }
  }

  private async sendEnrollmentConfirmed(
    payload: IEnrollmentConfirmedPayload,
  ): Promise<void> {
    const info = await this.transporter.sendMail({
      from: '"EventHub" <noreply@eventhub.com>',
      to: payload.userEmail,
      subject: `✅ Inscrição confirmada: ${payload.eventTitle}`,
      html: `
        <h2>Olá, ${payload.userName}!</h2>
        <p>Sua inscrição no evento <strong>${payload.eventTitle}</strong> foi <strong>confirmada</strong> com sucesso.</p>
        <p>Nos vemos lá!</p>
        <br/>
        <small>EventHub — ID da inscrição: ${payload.enrollmentId}</small>
      `,
    });

    this.logger.log(
      `📧 E-mail de confirmação enviado para ${payload.userEmail}`,
    );
    this.logger.log(
      `🔗 Visualize em: ${String(nodemailer.getTestMessageUrl(info))}`,
    );
  }

  private async sendEnrollmentWaitlisted(
    payload: IEnrollmentWaitlistedPayload,
  ): Promise<void> {
    const info = await this.transporter.sendMail({
      from: '"EventHub" <noreply@eventhub.com>',
      to: payload.userEmail,
      subject: `⏳ Lista de espera: ${payload.eventTitle}`,
      html: `
        <h2>Olá, ${payload.userName}!</h2>
        <p>O evento <strong>${payload.eventTitle}</strong> está lotado, mas você está na lista de espera.</p>
        <p>Sua posição atual: <strong>#${payload.waitlistPosition}</strong></p>
        <p>Você será notificado automaticamente se uma vaga abrir.</p>
        <br/>
        <small>EventHub — ID da inscrição: ${payload.enrollmentId}</small>
      `,
    });

    this.logger.log(
      `📧 E-mail de lista de espera enviado para ${payload.userEmail}`,
    );
    this.logger.log(
      `🔗 Visualize em: ${String(nodemailer.getTestMessageUrl(info))}`,
    );
  }

  private async sendWaitlistPromoted(
    payload: IWaitlistPromotedPayload,
  ): Promise<void> {
    const info = await this.transporter.sendMail({
      from: '"EventHub" <noreply@eventhub.com>',
      to: payload.userEmail,
      subject: `🎉 Você saiu da lista de espera: ${payload.eventTitle}`,
      html: `
        <h2>Olá, ${payload.userName}!</h2>
        <p>Uma vaga abriu e você foi <strong>promovido</strong> da lista de espera!</p>
        <p>Sua inscrição no evento <strong>${payload.eventTitle}</strong> está agora <strong>confirmada</strong>.</p>
        <br/>
        <small>EventHub — ID da inscrição: ${payload.enrollmentId}</small>
      `,
    });

    this.logger.log(`📧 E-mail de promoção enviado para ${payload.userEmail}`);
    this.logger.log(
      `🔗 Visualize em: ${String(nodemailer.getTestMessageUrl(info))}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker.close();
  }
}
