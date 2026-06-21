import { DomainException } from './domain.exception';

export class EnrollmentNotConfirmedException extends DomainException {
  constructor() {
    super(
      'Check-in só pode ser realizado para inscrições confirmadas.',
      'ENROLLMENT_NOT_CONFIRMED',
    );
  }
}
