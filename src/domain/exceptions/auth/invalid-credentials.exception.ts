import { DomainException } from '../domain.exception';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('E-mail ou senha inválidos.', 'INVALID_CREDENTIALS');
  }
}
