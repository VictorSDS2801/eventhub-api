import { DomainException } from './domain.exception';

export class EventAlreadyFinishedException extends DomainException {
  constructor(eventId: string) {
    super(
      `Evento ${eventId} já foi finalizado e não pode ser alterado.`,
      'EVENT_ALREADY_FINISHED',
    );
  }
}
