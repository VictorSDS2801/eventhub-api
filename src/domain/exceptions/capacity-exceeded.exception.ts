import { DomainException } from './domain.exception';

export class CapacityExceededException extends DomainException {
  constructor(eventId: string) {
    super(
      `Evento ${eventId} atingiu a capacidade máxima de vagas.`,
      'CAPACITY_EXCEEDED',
    );
  }
}
