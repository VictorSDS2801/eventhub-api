import { randomUUID } from 'crypto';
import { Email } from './email.vo';
import { Role } from './role.vo';
import { DomainException } from '../../exceptions/domain.exception';

export class InvalidUserNameException extends DomainException {
  constructor() {
    super('O nome do usuário não pode estar vazio.', 'INVALID_USER_NAME');
  }
}

export interface IUserProps {
  id?: string;
  name: string;
  email: Email;
  passwordHash: string;
  role: Role;
  createdAt?: Date;
}

export class User {
  readonly id: string;
  private name: string;
  private email: Email;
  private passwordHash: string;
  private role: Role;
  readonly createdAt: Date;

  private constructor(props: Required<IUserProps>) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.createdAt = props.createdAt;
  }

  static create(props: IUserProps): User {
    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidUserNameException();
    }

    return new User({
      id: props.id ?? randomUUID(),
      name: props.name.trim(),
      email: props.email,
      passwordHash: props.passwordHash,
      role: props.role,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  static restore(props: Required<IUserProps>): User {
    return new User(props);
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getRole(): Role {
    return this.role;
  }
}
