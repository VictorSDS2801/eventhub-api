import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { I_EVENT_REPOSITORY } from '../../repositories/event.repository.interface';
import type { IEventRepository } from '../../repositories/event.repository.interface';
import { Event } from '../../entities/event/event';
import { Capacity } from '../../entities/event/capacity.vo';
import { EventNotFoundException } from '../../exceptions/event/event-not-found.exception';

describe('EventService', () => {
  let service: EventService;
  let repository: jest.Mocked<IEventRepository>;

  const futureStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const futureEndDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IEventRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: I_EVENT_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    repository = module.get(I_EVENT_REPOSITORY);
  });

  describe('createEvent', () => {
    it('deve criar um evento e salvá-lo no repositório', async () => {
      repository.save.mockImplementation((event) => Promise.resolve(event));

      const result = await service.createEvent({
        title: 'Meetup de TypeScript',
        description: 'Encontro mensal sobre TS.',
        organizerId: 'organizer-1',
        startDate: futureStartDate,
        endDate: futureEndDate,
        capacityTotal: 30,
      });

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result.getTitle()).toBe('Meetup de TypeScript');
      expect(result.getCapacity().getTotal()).toBe(30);
    });
  });

  describe('publishEvent', () => {
    it('deve publicar um evento existente', async () => {
      const existingEvent = Event.create({
        title: 'Evento existente',
        description: 'desc',
        organizerId: 'organizer-1',
        startDate: futureStartDate,
        endDate: futureEndDate,
        capacity: Capacity.create(10),
      });

      repository.findById.mockResolvedValue(existingEvent);
      repository.save.mockImplementation((event) => Promise.resolve(event));

      const result = await service.publishEvent(existingEvent.id);

      expect(result.getStatus().isPublished()).toBe(true);
      expect(repository.save).toHaveBeenCalledWith(existingEvent);
    });

    it('deve lançar EventNotFoundException se o evento não existir', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.publishEvent('id-inexistente')).rejects.toThrow(
        EventNotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de eventos filtrados', async () => {
      const events = [
        Event.create({
          title: 'Evento 1',
          description: 'desc',
          organizerId: 'organizer-1',
          startDate: futureStartDate,
          endDate: futureEndDate,
          capacity: Capacity.create(10),
        }),
      ];
      repository.findAll.mockResolvedValue(events);

      const result = await service.findAll({ organizerId: 'organizer-1' });

      expect(result).toHaveLength(1);
      expect(repository.findAll).toHaveBeenCalledWith({
        organizerId: 'organizer-1',
      });
    });
  });
});
