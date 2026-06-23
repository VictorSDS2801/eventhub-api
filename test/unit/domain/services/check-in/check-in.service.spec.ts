import { Test, TestingModule } from '@nestjs/testing';
import { CheckInService } from '../../../../../src/domain/services/check-in/check-in.service';
import { I_CHECKIN_REPOSITORY } from '../../../../../src/domain/repositories/check-in.repository.interface';
import type { ICheckInRepository } from '../../../../../src/domain/repositories/check-in.repository.interface';
import { I_ENROLLMENT_REPOSITORY } from '../../../../../src/domain/repositories/enrollment.repository.interface';
import type { IEnrollmentRepository } from '../../../../../src/domain/repositories/enrollment.repository.interface';
import { I_EVENT_REPOSITORY } from '../../../../../src/domain/repositories/event.repository.interface';
import type { IEventRepository } from '../../../../../src/domain/repositories/event.repository.interface';
import { Event } from '../../../../../src/domain/entities/event/event';
import { Capacity } from '../../../../../src/domain/entities/event/capacity.vo';
import { Enrollment } from '../../../../../src/domain/entities/enrollment/enrollment';
import { EnrollmentNotConfirmedException } from '../../../../../src/domain/exceptions/check-in/enrollment-not-confirmed.exception';
import { DuplicateCheckInException } from '../../../../../src/domain/exceptions/check-in/duplicate-checkin.exception';
import { EnrollmentNotFoundException } from '../../../../../src/domain/exceptions/enrollment/enrollment-not-found.exception';
import { CheckInWindowClosedException } from '../../../../../src/domain/exceptions/check-in/checkin-window-closed.exception';
import { EventStatus } from '../../../../../src/domain/entities/event/event-status.vo';
import { CheckIn } from '../../../../../src/domain/entities/check-in/check-in';

describe('CheckInService', () => {
  let service: CheckInService;
  let checkInRepository: jest.Mocked<ICheckInRepository>;
  let enrollmentRepository: jest.Mocked<IEnrollmentRepository>;
  let eventRepository: jest.Mocked<IEventRepository>;

  beforeEach(async () => {
    const mockCheckInRepository: jest.Mocked<ICheckInRepository> = {
      save: jest.fn(),
      findByEnrollmentId: jest.fn(),
      findByEvent: jest.fn(),
    };
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
        CheckInService,
        { provide: I_CHECKIN_REPOSITORY, useValue: mockCheckInRepository },
        {
          provide: I_ENROLLMENT_REPOSITORY,
          useValue: mockEnrollmentRepository,
        },
        { provide: I_EVENT_REPOSITORY, useValue: mockEventRepository },
      ],
    }).compile();

    service = module.get<CheckInService>(CheckInService);
    checkInRepository = module.get(I_CHECKIN_REPOSITORY);
    enrollmentRepository = module.get(I_ENROLLMENT_REPOSITORY);
    eventRepository = module.get(I_EVENT_REPOSITORY);
  });

  // evento "acontecendo agora" para os testes de sucesso
  const buildOngoingEvent = () =>
    Event.restore({
      id: 'event-ongoing-1',
      title: 'Evento em andamento',
      description: 'desc',
      organizerId: 'organizer-1',
      startDate: new Date(Date.now() - 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 60 * 1000),
      capacity: Capacity.create(10),
      status: EventStatus.published(),
      createdAt: new Date(),
    });

  it('deve realizar check-in de uma inscrição confirmada dentro da janela do evento', async () => {
    const enrollment = Enrollment.createConfirmed({
      eventId: 'event-1',
      userId: 'user-1',
    });
    const event = buildOngoingEvent();

    enrollmentRepository.findById.mockResolvedValue(enrollment);
    checkInRepository.findByEnrollmentId.mockResolvedValue(null);
    eventRepository.findById.mockResolvedValue(event);
    checkInRepository.save.mockImplementation((c) => Promise.resolve(c));

    const result = await service.checkIn(enrollment.id);

    expect(result.enrollmentId).toBe(enrollment.id);
    expect(result.eventId).toBe(event.id);
  });

  it('deve lançar erro se a inscrição não existir', async () => {
    enrollmentRepository.findById.mockResolvedValue(null);

    await expect(service.checkIn('id-inexistente')).rejects.toThrow(
      EnrollmentNotFoundException,
    );
  });

  it('deve lançar erro se a inscrição não estiver confirmada (ex: em lista de espera)', async () => {
    const enrollment = Enrollment.createWaitlisted({
      eventId: 'event-1',
      userId: 'user-1',
      waitlistPosition: 1,
    });
    enrollmentRepository.findById.mockResolvedValue(enrollment);

    await expect(service.checkIn(enrollment.id)).rejects.toThrow(
      EnrollmentNotConfirmedException,
    );
  });

  it('deve lançar erro se já existir check-in para essa inscrição', async () => {
    const enrollment = Enrollment.createConfirmed({
      eventId: 'event-1',
      userId: 'user-1',
    });
    enrollmentRepository.findById.mockResolvedValue(enrollment);
    const fakeCheckIn = CheckIn.restore({
      id: 'fake-checkin-id',
      enrollmentId: 'enrollment-1',
      eventId: 'event-1',
      checkedInAt: new Date(),
    });
    checkInRepository.findByEnrollmentId.mockResolvedValue(fakeCheckIn);

    await expect(service.checkIn(enrollment.id)).rejects.toThrow(
      DuplicateCheckInException,
    );
  });

  it('deve lançar erro se o check-in for tentado fora da janela do evento', async () => {
    const enrollment = Enrollment.createConfirmed({
      eventId: 'event-1',
      userId: 'user-1',
    });
    const futureEvent = Event.create({
      title: 'Evento futuro',
      description: 'desc',
      organizerId: 'organizer-1',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // só começa amanhã
      endDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      capacity: Capacity.create(10),
    });

    enrollmentRepository.findById.mockResolvedValue(enrollment);
    checkInRepository.findByEnrollmentId.mockResolvedValue(null);
    eventRepository.findById.mockResolvedValue(futureEvent);

    await expect(service.checkIn(enrollment.id)).rejects.toThrow(
      CheckInWindowClosedException,
    );
  });
});
