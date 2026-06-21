import { DomainException } from './domain.exception';

export class DuplicateEnrollmentException extends DomainException {
  constructor(userId: string, eventId: string) {
    super(
      `O usuário ${userId} já está inscrito no evento ${eventId}.`,
      'DUPLICATE_ENROLLMENT',
    );
  }
}
