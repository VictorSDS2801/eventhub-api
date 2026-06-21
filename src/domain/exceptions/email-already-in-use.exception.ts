import { DomainException } from './domain.exception';

export class EmailAlreadyInUseException extends DomainException {
  constructor(email: string) {
    super(`O e-mail ${email} já está em uso.`, 'EMAIL_ALREADY_IN_USE');
  }
}
