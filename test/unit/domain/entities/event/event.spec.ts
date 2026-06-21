import { Event } from '../../../../../src/domain/entities/event/event';
import { Capacity } from '../../../../../src/domain/entities/event/capacity.vo';
import { CapacityExceededException } from '../../../../../src/domain/exceptions/event/capacity-exceeded.exception';
import { EventAlreadyFinishedException } from '../../../../../src/domain/exceptions/event/event-already-finished.exception';

describe('Event', () => {
  const futureStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const futureEndDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const buildValidEvent = (capacityTotal = 2) =>
    Event.create({
      title: 'Workshop de NestJS',
      description: 'Um workshop introdutório sobre NestJS e DDD.',
      organizerId: 'organizer-1',
      startDate: futureStartDate,
      endDate: futureEndDate,
      capacity: Capacity.create(capacityTotal),
    });

  describe('create', () => {
    it('deve criar um evento válido com status DRAFT por padrão', () => {
      const event = buildValidEvent();

      expect(event.id).toBeDefined();
      expect(event.getStatus().getValue()).toBe('DRAFT');
      expect(event.hasAvailableSpots()).toBe(true);
    });

    it('deve lançar erro se a data de início for depois da data de término', () => {
      expect(() =>
        Event.create({
          title: 'Evento inválido',
          description: 'desc',
          organizerId: 'organizer-1',
          startDate: futureEndDate,
          endDate: futureStartDate,
          capacity: Capacity.create(10),
        }),
      ).toThrow('a data de início deve ser anterior à data de término.');
    });

    it('deve lançar erro se a data de início estiver no passado', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      expect(() =>
        Event.create({
          title: 'Evento no passado',
          description: 'desc',
          organizerId: 'organizer-1',
          startDate: pastDate,
          endDate: futureEndDate,
          capacity: Capacity.create(10),
        }),
      ).toThrow('a data de início não pode estar no passado.');
    });
  });

  describe('publish', () => {
    it('deve publicar um evento em DRAFT', () => {
      const event = buildValidEvent();
      event.publish();
      expect(event.getStatus().isPublished()).toBe(true);
    });

    it('não deve permitir publicar um evento cancelado', () => {
      const event = buildValidEvent();
      event.cancel();
      expect(() => event.publish()).toThrow(EventAlreadyFinishedException);
    });
  });

  describe('cancel', () => {
    it('deve cancelar um evento publicado', () => {
      const event = buildValidEvent();
      event.publish();
      event.cancel();
      expect(event.getStatus().isCancelled()).toBe(true);
    });
  });

  describe('occupySpot', () => {
    it('deve ocupar uma vaga disponível', () => {
      const event = buildValidEvent(2);
      event.occupySpot();
      expect(event.getCapacity().getOccupied()).toBe(1);
      expect(event.getCapacity().getAvailable()).toBe(1);
    });

    it('deve lançar CapacityExceededException quando não há mais vagas', () => {
      const event = buildValidEvent(1);
      event.occupySpot();

      expect(() => event.occupySpot()).toThrow(CapacityExceededException);
    });

    it('não deve permitir ocupar vaga em evento cancelado', () => {
      const event = buildValidEvent(2);
      event.cancel();

      expect(() => event.occupySpot()).toThrow(EventAlreadyFinishedException);
    });
  });

  describe('releaseSpot', () => {
    it('deve liberar uma vaga ocupada', () => {
      const event = buildValidEvent(2);
      event.occupySpot();
      event.releaseSpot();

      expect(event.getCapacity().getOccupied()).toBe(0);
      expect(event.hasAvailableSpots()).toBe(true);
    });
  });
});
