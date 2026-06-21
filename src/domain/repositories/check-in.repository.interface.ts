import { CheckIn } from '../entities/check-in/check-in';

export const I_CHECKIN_REPOSITORY = 'I_CHECKIN_REPOSITORY';

export interface ICheckInRepository {
  save(checkIn: CheckIn): Promise<CheckIn>;
  findByEnrollmentId(enrollmentId: string): Promise<CheckIn | null>;
  findByEvent(eventId: string): Promise<CheckIn[]>;
}
