import { Inject, Injectable } from '@nestjs/common';
import { Enrollment } from '../../entities/enrollment/enrollment';
import { I_ENROLLMENT_REPOSITORY } from '../../repositories/enrollment.repository.interface';
import type { IEnrollmentRepository } from '../../repositories/enrollment.repository.interface';
import { I_EVENT_REPOSITORY } from '../../repositories/event.repository.interface';
import type { IEventRepository } from '../../repositories/event.repository.interface';
import { I_USER_REPOSITORY } from '../../repositories/user.repository.interface';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { I_NOTIFICATION_PORT } from '../../ports/notification.port';
import type { INotificationPort } from '../../ports/notification.port';
import { EventNotFoundException } from '../../exceptions/event/event-not-found.exception';
import { EnrollmentNotFoundException } from '../../exceptions/enrollment/enrollment-not-found.exception';
import { DuplicateEnrollmentException } from '../../exceptions/enrollment/duplicate-enrollment.exception';

export interface IEnrollParams {
  eventId: string;
  userId: string;
}

export interface IEnrollmentCancellationResult {
  cancelled: Enrollment;
  promoted: Enrollment | null;
}

const LATE_CANCELLATION_WINDOW_HOURS = 12;

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(I_ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(I_EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(I_USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(I_NOTIFICATION_PORT)
    private readonly notificationPort: INotificationPort,
  ) {}

  async enroll(params: IEnrollParams): Promise<Enrollment> {
    const event = await this.eventRepository.findById(params.eventId);
    if (!event) {
      throw new EventNotFoundException(params.eventId);
    }

    const existing = await this.enrollmentRepository.findByEventAndUser(
      params.eventId,
      params.userId,
    );
    if (existing) {
      throw new DuplicateEnrollmentException(params.userId, params.eventId);
    }

    const user = await this.userRepository.findById(params.userId);

    if (event.hasAvailableSpots()) {
      event.occupySpot();
      await this.eventRepository.save(event);

      const enrollment = Enrollment.createConfirmed({
        eventId: params.eventId,
        userId: params.userId,
      });
      const saved = await this.enrollmentRepository.save(enrollment);

      if (user) {
        await this.notificationPort.enqueueEnrollmentConfirmed({
          enrollmentId: saved.id,
          userEmail: user.getEmail().getValue(),
          userName: user.getName(),
          eventTitle: event.getTitle(),
        });
      }

      return saved;
    }

    const waitlistedCount =
      await this.enrollmentRepository.countWaitlistedByEvent(params.eventId);
    const enrollment = Enrollment.createWaitlisted({
      eventId: params.eventId,
      userId: params.userId,
      waitlistPosition: waitlistedCount + 1,
    });
    const saved = await this.enrollmentRepository.save(enrollment);

    if (user) {
      await this.notificationPort.enqueueEnrollmentWaitlisted({
        enrollmentId: saved.id,
        userEmail: user.getEmail().getValue(),
        userName: user.getName(),
        eventTitle: event.getTitle(),
        waitlistPosition: saved.getWaitlistPosition() ?? 1,
      });
    }

    return saved;
  }

  async cancel(enrollmentId: string): Promise<IEnrollmentCancellationResult> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(enrollmentId);
    }

    const wasConfirmed = enrollment.getStatus().isConfirmed();

    enrollment.cancel();
    const cancelled = await this.enrollmentRepository.save(enrollment);

    if (!wasConfirmed) {
      return { cancelled, promoted: null };
    }

    const event = await this.eventRepository.findById(enrollment.eventId);
    if (!event) {
      throw new EventNotFoundException(enrollment.eventId);
    }
    event.releaseSpot();
    await this.eventRepository.save(event);

    const isLateCancellation = this.isWithinLateCancellationWindow(
      event.getStartDate(),
    );
    if (isLateCancellation) {
      return { cancelled, promoted: null };
    }

    const nextInLine = await this.enrollmentRepository.findNextWaitlisted(
      enrollment.eventId,
    );
    if (!nextInLine) {
      return { cancelled, promoted: null };
    }

    nextInLine.promoteFromWaitlist();
    event.occupySpot();
    await this.eventRepository.save(event);
    const promoted = await this.enrollmentRepository.save(nextInLine);

    const promotedUser = await this.userRepository.findById(promoted.userId);
    if (promotedUser) {
      await this.notificationPort.enqueueWaitlistPromoted({
        enrollmentId: promoted.id,
        userEmail: promotedUser.getEmail().getValue(),
        userName: promotedUser.getName(),
        eventTitle: event.getTitle(),
      });
    }

    return { cancelled, promoted };
  }

  async findByEvent(eventId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.findByEvent(eventId);
  }

  private isWithinLateCancellationWindow(
    eventStartDate: Date,
    now: Date = new Date(),
  ): boolean {
    const hoursUntilEvent =
      (eventStartDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilEvent < LATE_CANCELLATION_WINDOW_HOURS;
  }
}
