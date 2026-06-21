import { DomainException } from './domain.exception';

export class DuplicateCheckInException extends DomainException {
  constructor(enrollmentId: string) {
    super(
      `Já existe check-in registrado para a inscrição ${enrollmentId}.`,
      'DUPLICATE_CHECKIN',
    );
  }
}
