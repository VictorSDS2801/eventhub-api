// src/infrastructure/database/mappers/event.mapper.spec.ts
import { EventMapper } from './event.mapper';
import { Event } from '../../../domain/entities/event';
import { Capacity } from '../../../domain/entities/capacity.vo';
import { EventDocument } from '../schemas/event.schema';

describe('EventMapper', () => {
  const futureStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const futureEndDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

  describe('toPersistence', () => {
    it('deve converter uma entidade Event para o formato de persistência', () => {
      const event = Event.create({
        title: 'Workshop de DDD',
        description: 'Aprendendo Domain-Driven Design na prática.',
        organizerId: 'organizer-1',
        startDate: futureStartDate,
        endDate: futureEndDate,
        capacity: Capacity.create(50),
      });

      const persistence = EventMapper.toPersistence(event);

      expect(persistence.domainId).toBe(event.id);
      expect(persistence.title).toBe('Workshop de DDD');
      expect(persistence.capacityTotal).toBe(50);
      expect(persistence.capacityOccupied).toBe(0);
      expect(persistence.status).toBe('DRAFT');
    });
  });

  describe('toDomain', () => {
    it('deve reconstruir uma entidade Event a partir de um documento persistido', () => {
      const fakeDocument = {
        domainId: 'fake-uuid-123',
        title: 'Workshop de DDD',
        description: 'Aprendendo Domain-Driven Design na prática.',
        organizerId: 'organizer-1',
        startDate: futureStartDate,
        endDate: futureEndDate,
        capacityTotal: 50,
        capacityOccupied: 10,
        status: 'PUBLISHED',
        createdAt: new Date(),
      } as EventDocument;

      const event = EventMapper.toDomain(fakeDocument);

      expect(event.id).toBe('fake-uuid-123');
      expect(event.getTitle()).toBe('Workshop de DDD');
      expect(event.getCapacity().getTotal()).toBe(50);
      expect(event.getCapacity().getOccupied()).toBe(10);
      expect(event.getCapacity().getAvailable()).toBe(40);
      expect(event.getStatus().isPublished()).toBe(true);
    });

    it('deve preservar o estado de capacidade ao ir e voltar (round-trip)', () => {
      const event = Event.create({
        title: 'Evento round-trip',
        description: 'Teste de ida e volta.',
        organizerId: 'organizer-2',
        startDate: futureStartDate,
        endDate: futureEndDate,
        capacity: Capacity.create(10),
      });
      event.occupySpot();
      event.occupySpot();

      const persisted = EventMapper.toPersistence(event) as EventDocument;
      const restored = EventMapper.toDomain(persisted);

      expect(restored.getCapacity().getOccupied()).toBe(2);
      expect(restored.getCapacity().getAvailable()).toBe(8);
    });
  });
});
