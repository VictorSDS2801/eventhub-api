export enum EnrollmentStatusEnum {
  CONFIRMED = 'CONFIRMED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
}

export class EnrollmentStatus {
  private constructor(private readonly value: EnrollmentStatusEnum) {}

  static confirmed(): EnrollmentStatus {
    return new EnrollmentStatus(EnrollmentStatusEnum.CONFIRMED);
  }

  static waitlisted(): EnrollmentStatus {
    return new EnrollmentStatus(EnrollmentStatusEnum.WAITLISTED);
  }

  static cancelled(): EnrollmentStatus {
    return new EnrollmentStatus(EnrollmentStatusEnum.CANCELLED);
  }

  static fromValue(value: EnrollmentStatusEnum): EnrollmentStatus {
    return new EnrollmentStatus(value);
  }

  isConfirmed(): boolean {
    return this.value === EnrollmentStatusEnum.CONFIRMED;
  }

  isWaitlisted(): boolean {
    return this.value === EnrollmentStatusEnum.WAITLISTED;
  }

  isCancelled(): boolean {
    return this.value === EnrollmentStatusEnum.CANCELLED;
  }

  getValue(): EnrollmentStatusEnum {
    return this.value;
  }
}
