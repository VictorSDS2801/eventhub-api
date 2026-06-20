import { DomainException } from './domain.exception';

export class EventNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Evento com id ${id} não encontrado.`, 'EVENT_NOT_FOUND');
  }
}
