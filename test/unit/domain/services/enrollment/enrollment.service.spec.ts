import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService } from '../../../../../src/domain/services/enrollment/enrollment.service';
import { I_ENROLLMENT_REPOSITORY } from '../../../../../src/domain/repositories/enrollment.repository.interface';
import type { IEnrollmentRepository } from '../../../../../src/domain/repositories/enrollment.repository.interface';
import { I_EVENT_REPOSITORY } from '../../../../../src/domain/repositories/event.repository.interface';
import type { IEventRepository } from '../../../../../src/domain/repositories/event.repository.interface';
import { Event } from '../../../../../src/domain/entities/event/event';
import { Capacity } from '../../../../../src/domain/entities/event/capacity.vo';
import { Enrollment } from '../../../../../src/domain/entities/enrollment/enrollment';
import { DuplicateEnrollmentException } from '../../../../../src/domain/exceptions/enrollment/duplicate-enrollment.exception';
import { EventNotFoundException } from '../../../../../src/domain/exceptions/event/event-not-found.exception';
import { EnrollmentNotFoundException } from '../../../../../src/domain/exceptions/enrollment/enrollment-not-found.exception';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let enrollmentRepository: jest.Mocked<IEnrollmentRepository>;
  let eventRepository: jest.Mocked<IEventRepository>;

  const futureStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const futureEndDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const buildEvent = (capacityTotal: number) =>
    Event.create({
      title: 'Workshop',
      description: 'desc',
      organizerId: 'organizer-1',
      startDate: futureStartDate,
      endDate: futureEndDate,
      capacity: Capacity.create(capacityTotal),
    });

  beforeEach(async () => {
    const mockEnrollmentRepository: jest.Mocked<IEnrollmentRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEventAndUser: jest.fn(),
      findByEvent: jest.fn(),
      findNextWaitlisted: jest.fn(),
      countWaitlistedByEvent: jest.fn(),
    };
    const mockEventRepository: jest.Mocked<IEventRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        {
          provide: I_ENROLLMENT_REPOSITORY,
          useValue: mockEnrollmentRepository,
        },
        { provide: I_EVENT_REPOSITORY, useValue: mockEventRepository },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
    enrollmentRepository = module.get(I_ENROLLMENT_REPOSITORY);
    eventRepository = module.get(I_EVENT_REPOSITORY);
  });

  describe('enroll', () => {
    it('deve confirmar a inscrição quando há vagas disponíveis', async () => {
      const event = buildEvent(10);
      eventRepository.findById.mockResolvedValue(event);
      enrollmentRepository.findByEventAndUser.mockResolvedValue(null);
      eventRepository.save.mockImplementation((e) => Promise.resolve(e));
      enrollmentRepository.save.mockImplementation((e) => Promise.resolve(e));

      const result = await service.enroll({
        eventId: event.id,
        userId: 'user-1',
      });

      expect(result.getStatus().isConfirmed()).toBe(true);
      expect(event.getCapacity().getOccupied()).toBe(1); // vaga foi ocupada de verdade
    });

    it('deve colocar em lista de espera quando não há vagas disponíveis', async () => {
      const event = buildEvent(1);
      event.occupySpot(); // lota o evento propositalmente
      eventRepository.findById.mockResolvedValue(event);
      enrollmentRepository.findByEventAndUser.mockResolvedValue(null);
      enrollmentRepository.countWaitlistedByEvent.mockResolvedValue(0);
      enrollmentRepository.save.mockImplementation((e) => Promise.resolve(e));

      const result = await service.enroll({
        eventId: event.id,
        userId: 'user-2',
      });

      expect(result.getStatus().isWaitlisted()).toBe(true);
      expect(result.getWaitlistPosition()).toBe(1);
    });

    it('deve atribuir a posição correta na lista de espera quando já existem outros suplentes', async () => {
      const event = buildEvent(1);
      event.occupySpot();
      eventRepository.findById.mockResolvedValue(event);
      enrollmentRepository.findByEventAndUser.mockResolvedValue(null);
      enrollmentRepository.countWaitlistedByEvent.mockResolvedValue(3); // já tem 3 na fila
      enrollmentRepository.save.mockImplementation((e) => Promise.resolve(e));

      const result = await service.enroll({
        eventId: event.id,
        userId: 'user-5',
      });

      expect(result.getWaitlistPosition()).toBe(4);
    });

    it('deve lançar erro se o usuário já estiver inscrito no evento', async () => {
      const event = buildEvent(10);
      eventRepository.findById.mockResolvedValue(event);
      enrollmentRepository.findByEventAndUser.mockResolvedValue(
        Enrollment.createConfirmed({ eventId: event.id, userId: 'user-1' }),
      );

      await expect(
        service.enroll({ eventId: event.id, userId: 'user-1' }),
      ).rejects.toThrow(DuplicateEnrollmentException);
    });

    it('deve lançar erro se o evento não existir', async () => {
      eventRepository.findById.mockResolvedValue(null);

      await expect(
        service.enroll({ eventId: 'evento-inexistente', userId: 'user-1' }),
      ).rejects.toThrow(EventNotFoundException);
    });
  });

  describe('cancel', () => {
    it('deve cancelar uma inscrição confirmada e promover o próximo da lista de espera', async () => {
      const event = buildEvent(1);
      event.occupySpot(); // única vaga ocupada por quem vai cancelar

      const cancellingEnrollment = Enrollment.createConfirmed({
        eventId: event.id,
        userId: 'user-1',
      });
      const nextInLine = Enrollment.createWaitlisted({
        eventId: event.id,
        userId: 'user-2',
        waitlistPosition: 1,
      });

      enrollmentRepository.findById.mockResolvedValue(cancellingEnrollment);
      eventRepository.findById.mockResolvedValue(event);
      enrollmentRepository.findNextWaitlisted.mockResolvedValue(nextInLine);
      eventRepository.save.mockImplementation((e) => Promise.resolve(e));
      enrollmentRepository.save.mockImplementation((e) => Promise.resolve(e));

      const result = await service.cancel(cancellingEnrollment.id);

      expect(result.cancelled.getStatus().isCancelled()).toBe(true);
      expect(result.promoted).not.toBeNull();
      expect(result.promoted?.getStatus().isConfirmed()).toBe(true);
      expect(event.getCapacity().getOccupied()).toBe(1); // vaga liberada e reocupada pelo suplente
    });

    it('deve cancelar sem promover ninguém se não houver lista de espera', async () => {
      const event = buildEvent(5);
      event.occupySpot();

      const cancellingEnrollment = Enrollment.createConfirmed({
        eventId: event.id,
        userId: 'user-1',
      });

      enrollmentRepository.findById.mockResolvedValue(cancellingEnrollment);
      eventRepository.findById.mockResolvedValue(event);
      enrollmentRepository.findNextWaitlisted.mockResolvedValue(null);
      eventRepository.save.mockImplementation((e) => Promise.resolve(e));
      enrollmentRepository.save.mockImplementation((e) => Promise.resolve(e));

      const result = await service.cancel(cancellingEnrollment.id);

      expect(result.cancelled.getStatus().isCancelled()).toBe(true);
      expect(result.promoted).toBeNull();
      expect(event.getCapacity().getOccupied()).toBe(0); // vaga liberada, ninguém ocupou
    });

    it('não deve mexer na capacidade ao cancelar uma inscrição que já estava em lista de espera', async () => {
      const event = buildEvent(1);
      event.occupySpot();

      const waitlistedEnrollment = Enrollment.createWaitlisted({
        eventId: event.id,
        userId: 'user-2',
        waitlistPosition: 1,
      });

      enrollmentRepository.findById.mockResolvedValue(waitlistedEnrollment);
      enrollmentRepository.save.mockImplementation((e) => Promise.resolve(e));

      const result = await service.cancel(waitlistedEnrollment.id);

      expect(result.cancelled.getStatus().isCancelled()).toBe(true);
      expect(result.promoted).toBeNull();
      expect(eventRepository.findById).not.toHaveBeenCalled(); // nem precisou buscar o evento
    });

    it('deve lançar erro se a inscrição não existir', async () => {
      enrollmentRepository.findById.mockResolvedValue(null);

      await expect(service.cancel('id-inexistente')).rejects.toThrow(
        EnrollmentNotFoundException,
      );
    });
  });
});
