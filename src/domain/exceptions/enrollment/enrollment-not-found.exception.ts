import { DomainException } from '../domain.exception';

export class EnrollmentNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Inscrição com id ${id} não encontrada.`, 'ENROLLMENT_NOT_FOUND');
  }
}
