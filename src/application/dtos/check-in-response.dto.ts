import { CheckIn } from '../../domain/entities/check-in';

export class CheckInResponseDto {
  id!: string;
  enrollmentId!: string;
  eventId!: string;
  checkedInAt!: Date;

  static fromDomain(checkIn: CheckIn): CheckInResponseDto {
    const dto = new CheckInResponseDto();
    dto.id = checkIn.id;
    dto.enrollmentId = checkIn.enrollmentId;
    dto.eventId = checkIn.eventId;
    dto.checkedInAt = checkIn.checkedInAt;
    return dto;
  }
}
