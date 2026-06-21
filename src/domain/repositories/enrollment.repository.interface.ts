import { Enrollment } from '../entities/enrollment';

export const I_ENROLLMENT_REPOSITORY = 'I_ENROLLMENT_REPOSITORY';

export interface IEnrollmentRepository {
  save(enrollment: Enrollment): Promise<Enrollment>;
  findById(id: string): Promise<Enrollment | null>;
  findByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<Enrollment | null>;
  findByEvent(eventId: string): Promise<Enrollment[]>;
  findNextWaitlisted(eventId: string): Promise<Enrollment | null>;
  countWaitlistedByEvent(eventId: string): Promise<number>;
}
