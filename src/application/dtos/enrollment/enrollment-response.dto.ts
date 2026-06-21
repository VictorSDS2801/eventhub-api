import { Enrollment } from '../../../domain/entities/enrollment/enrollment';

export class EnrollmentResponseDto {
  id!: string;
  eventId!: string;
  userId!: string;
  status!: string;
  waitlistPosition!: number | null;
  createdAt!: Date;

  static fromDomain(enrollment: Enrollment): EnrollmentResponseDto {
    const dto = new EnrollmentResponseDto();
    dto.id = enrollment.id;
    dto.eventId = enrollment.eventId;
    dto.userId = enrollment.userId;
    dto.status = enrollment.getStatus().getValue();
    dto.waitlistPosition = enrollment.getWaitlistPosition();
    dto.createdAt = enrollment.createdAt;
    return dto;
  }
}
