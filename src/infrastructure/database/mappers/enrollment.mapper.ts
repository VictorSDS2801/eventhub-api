import { Enrollment } from '../../../domain/entities/enrollment';
import {
  EnrollmentStatus,
  EnrollmentStatusEnum,
} from '../../../domain/entities/enrollment-status.vo';
import { EnrollmentDocument } from '../schemas/enrollment.schema';

export class EnrollmentMapper {
  static toDomain(document: EnrollmentDocument): Enrollment {
    return Enrollment.restore({
      id: document.domainId,
      eventId: document.eventId,
      userId: document.userId,
      status: EnrollmentStatus.fromValue(
        document.status as EnrollmentStatusEnum,
      ),
      waitlistPosition: document.waitlistPosition,
      createdAt: document.createdAt,
    });
  }

  static toPersistence(enrollment: Enrollment): Partial<EnrollmentDocument> {
    return {
      domainId: enrollment.id,
      eventId: enrollment.eventId,
      userId: enrollment.userId,
      status: enrollment.getStatus().getValue(),
      waitlistPosition: enrollment.getWaitlistPosition(),
      createdAt: enrollment.createdAt,
    };
  }
}
