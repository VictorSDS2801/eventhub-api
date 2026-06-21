import { DomainException } from './domain.exception';

export class CheckInWindowClosedException extends DomainException {
  constructor() {
    super(
      'Check-in só pode ser realizado durante o período do evento.',
      'CHECKIN_WINDOW_CLOSED',
    );
  }
}
