import { DomainException } from './domain.exception';

export class EnrollmentAlreadyCancelledException extends DomainException {
  constructor(id: string) {
    super(`Inscrição ${id} já está cancelada.`, 'ENROLLMENT_ALREADY_CANCELLED');
  }
}
