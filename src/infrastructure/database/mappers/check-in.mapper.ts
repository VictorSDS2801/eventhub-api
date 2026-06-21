import { CheckIn } from '../../../domain/entities/check-in';
import { CheckInDocument } from '../schemas/check-in.schema';

export class CheckInMapper {
  static toDomain(document: CheckInDocument): CheckIn {
    return CheckIn.restore({
      id: document.domainId,
      enrollmentId: document.enrollmentId,
      eventId: document.eventId,
      checkedInAt: document.checkedInAt,
    });
  }

  static toPersistence(checkIn: CheckIn): Partial<CheckInDocument> {
    return {
      domainId: checkIn.id,
      enrollmentId: checkIn.enrollmentId,
      eventId: checkIn.eventId,
      checkedInAt: checkIn.checkedInAt,
    };
  }
}
