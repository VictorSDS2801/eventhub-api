export enum RoleEnum {
  PARTICIPANT = 'PARTICIPANT',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN',
}

export class Role {
  private constructor(private readonly value: RoleEnum) {}

  static participant(): Role {
    return new Role(RoleEnum.PARTICIPANT);
  }

  static organizer(): Role {
    return new Role(RoleEnum.ORGANIZER);
  }

  static admin(): Role {
    return new Role(RoleEnum.ADMIN);
  }

  static fromValue(value: RoleEnum): Role {
    return new Role(value);
  }

  isAdmin(): boolean {
    return this.value === RoleEnum.ADMIN;
  }

  isOrganizer(): boolean {
    return this.value === RoleEnum.ORGANIZER;
  }

  getValue(): RoleEnum {
    return this.value;
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }
}
