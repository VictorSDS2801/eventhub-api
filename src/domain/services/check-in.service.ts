import { Inject, Injectable } from '@nestjs/common';
import { CheckIn } from '../entities/check-in';
import { I_CHECKIN_REPOSITORY } from '../repositories/check-in.repository.interface';
import type { ICheckInRepository } from '../repositories/check-in.repository.interface';
import { I_ENROLLMENT_REPOSITORY } from '../repositories/enrollment.repository.interface';
import type { IEnrollmentRepository } from '../repositories/enrollment.repository.interface';
import { I_EVENT_REPOSITORY } from '../repositories/event.repository.interface';
import type { IEventRepository } from '../repositories/event.repository.interface';
import { EnrollmentNotFoundException } from '../exceptions/enrollment-not-found.exception';
import { EventNotFoundException } from '../exceptions/event/event-not-found.exception';
import { EnrollmentNotConfirmedException } from '../exceptions/enrollment-not-confirmed.exception';
import { DuplicateCheckInException } from '../exceptions/duplicate-checkin.exception';

@Injectable()
export class CheckInService {
  constructor(
    @Inject(I_CHECKIN_REPOSITORY)
    private readonly checkInRepository: ICheckInRepository,
    @Inject(I_ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(I_EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async checkIn(enrollmentId: string): Promise<CheckIn> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(enrollmentId);
    }

    if (!enrollment.getStatus().isConfirmed()) {
      throw new EnrollmentNotConfirmedException();
    }

    const existingCheckIn =
      await this.checkInRepository.findByEnrollmentId(enrollmentId);
    if (existingCheckIn) {
      throw new DuplicateCheckInException(enrollmentId);
    }

    const event = await this.eventRepository.findById(enrollment.eventId);
    if (!event) {
      throw new EventNotFoundException(enrollment.eventId);
    }

    const checkIn = CheckIn.create({
      enrollmentId: enrollment.id,
      eventId: event.id,
      eventStartDate: event.getStartDate(),
      eventEndDate: event.getEndDate(),
    });

    return this.checkInRepository.save(checkIn);
  }

  async findByEvent(eventId: string): Promise<CheckIn[]> {
    return this.checkInRepository.findByEvent(eventId);
  }
}
