import { randomUUID } from 'crypto';
import { CheckInWindowClosedException } from '../exceptions/checkin-window-closed.exception';

export interface ICheckInProps {
  id?: string;
  enrollmentId: string;
  eventId: string;
  checkedInAt?: Date;
}

export class CheckIn {
  readonly id: string;
  readonly enrollmentId: string;
  readonly eventId: string;
  readonly checkedInAt: Date;

  private constructor(props: Required<ICheckInProps>) {
    this.id = props.id;
    this.enrollmentId = props.enrollmentId;
    this.eventId = props.eventId;
    this.checkedInAt = props.checkedInAt;
  }

  static create(props: {
    enrollmentId: string;
    eventId: string;
    eventStartDate: Date;
    eventEndDate: Date;
    now?: Date;
  }): CheckIn {
    const now = props.now ?? new Date();

    if (now < props.eventStartDate || now > props.eventEndDate) {
      throw new CheckInWindowClosedException();
    }

    return new CheckIn({
      id: randomUUID(),
      enrollmentId: props.enrollmentId,
      eventId: props.eventId,
      checkedInAt: now,
    });
  }

  static restore(props: Required<ICheckInProps>): CheckIn {
    return new CheckIn(props);
  }
}
