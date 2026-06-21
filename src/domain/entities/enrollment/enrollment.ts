import { randomUUID } from 'crypto';
import { EnrollmentStatus } from './enrollment-status.vo';
import { DomainException } from '../../exceptions/domain.exception';
import { EnrollmentAlreadyCancelledException } from '../../exceptions/enrollment/enrollment-already-cancelled.exception';

export class InvalidWaitlistPositionException extends DomainException {
  constructor() {
    super(
      'Posição na lista de espera inválida para o status da inscrição.',
      'INVALID_WAITLIST_POSITION',
    );
  }
}

export interface IEnrollmentProps {
  id?: string;
  eventId: string;
  userId: string;
  status?: EnrollmentStatus;
  waitlistPosition?: number | null;
  createdAt?: Date;
}

export class Enrollment {
  readonly id: string;
  readonly eventId: string;
  readonly userId: string;
  private status: EnrollmentStatus;
  private waitlistPosition: number | null;
  readonly createdAt: Date;

  private constructor(props: Required<IEnrollmentProps>) {
    this.id = props.id;
    this.eventId = props.eventId;
    this.userId = props.userId;
    this.status = props.status;
    this.waitlistPosition = props.waitlistPosition;
    this.createdAt = props.createdAt;
  }

  static createConfirmed(props: {
    eventId: string;
    userId: string;
  }): Enrollment {
    return new Enrollment({
      id: randomUUID(),
      eventId: props.eventId,
      userId: props.userId,
      status: EnrollmentStatus.confirmed(),
      waitlistPosition: null,
      createdAt: new Date(),
    });
  }

  static createWaitlisted(props: {
    eventId: string;
    userId: string;
    waitlistPosition: number;
  }): Enrollment {
    if (props.waitlistPosition < 1) {
      throw new InvalidWaitlistPositionException();
    }
    return new Enrollment({
      id: randomUUID(),
      eventId: props.eventId,
      userId: props.userId,
      status: EnrollmentStatus.waitlisted(),
      waitlistPosition: props.waitlistPosition,
      createdAt: new Date(),
    });
  }

  static restore(props: Required<IEnrollmentProps>): Enrollment {
    return new Enrollment(props);
  }

  cancel(): void {
    if (this.status.isCancelled()) {
      throw new EnrollmentAlreadyCancelledException(this.id);
    }
    this.status = EnrollmentStatus.cancelled();
    this.waitlistPosition = null;
  }

  promoteFromWaitlist(): void {
    if (!this.status.isWaitlisted()) {
      throw new InvalidWaitlistPositionException();
    }
    this.status = EnrollmentStatus.confirmed();
    this.waitlistPosition = null;
  }

  getStatus(): EnrollmentStatus {
    return this.status;
  }

  getWaitlistPosition(): number | null {
    return this.waitlistPosition;
  }
}
