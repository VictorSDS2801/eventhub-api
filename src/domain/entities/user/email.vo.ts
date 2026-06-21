import { DomainException } from '../../exceptions/domain.exception';

export class InvalidEmailException extends DomainException {
  constructor(value: string) {
    super(`E-mail inválido: ${value}`, 'INVALID_EMAIL');
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalized)) {
      throw new InvalidEmailException(value);
    }

    return new Email(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
