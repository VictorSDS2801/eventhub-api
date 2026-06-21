import { Inject, Injectable } from '@nestjs/common';
import { Enrollment } from '../../entities/enrollment/enrollment';
import { I_ENROLLMENT_REPOSITORY } from '../../repositories/enrollment.repository.interface';
import type { IEnrollmentRepository } from '../../repositories/enrollment.repository.interface';
import { I_EVENT_REPOSITORY } from '../../repositories/event.repository.interface';
import type { IEventRepository } from '../../repositories/event.repository.interface';
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

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(I_ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(I_EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
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

    if (event.hasAvailableSpots()) {
      event.occupySpot();
      await this.eventRepository.save(event);

      const enrollment = Enrollment.createConfirmed({
        eventId: params.eventId,
        userId: params.userId,
      });
      return this.enrollmentRepository.save(enrollment);
    }

    const waitlistedCount =
      await this.enrollmentRepository.countWaitlistedByEvent(params.eventId);
    const enrollment = Enrollment.createWaitlisted({
      eventId: params.eventId,
      userId: params.userId,
      waitlistPosition: waitlistedCount + 1,
    });
    return this.enrollmentRepository.save(enrollment);
  }

  async cancel(enrollmentId: string): Promise<IEnrollmentCancellationResult> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(enrollmentId);
    }

    const wasConfirmed = enrollment.getStatus().isConfirmed();

    enrollment.cancel();
    const cancelled = await this.enrollmentRepository.save(enrollment);

    // só libera vaga e tenta promover suplente se quem cancelou tinha vaga confirmada
    if (!wasConfirmed) {
      return { cancelled, promoted: null };
    }

    const event = await this.eventRepository.findById(enrollment.eventId);
    if (!event) {
      throw new EventNotFoundException(enrollment.eventId);
    }
    event.releaseSpot();

    const nextInLine = await this.enrollmentRepository.findNextWaitlisted(
      enrollment.eventId,
    );
    if (!nextInLine) {
      await this.eventRepository.save(event);
      return { cancelled, promoted: null };
    }

    nextInLine.promoteFromWaitlist();
    event.occupySpot();

    await this.eventRepository.save(event);
    const promoted = await this.enrollmentRepository.save(nextInLine);

    return { cancelled, promoted };
  }

  async findByEvent(eventId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.findByEvent(eventId);
  }
}
