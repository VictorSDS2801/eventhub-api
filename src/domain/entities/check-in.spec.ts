import { CheckIn } from './check-in';
import { CheckInWindowClosedException } from '../exceptions/checkin-window-closed.exception';

describe('CheckIn', () => {
  const eventStartDate = new Date('2026-09-01T10:00:00.000Z');
  const eventEndDate = new Date('2026-09-01T18:00:00.000Z');

  it('deve criar um check-in dentro da janela do evento', () => {
    const now = new Date('2026-09-01T12:00:00.000Z');

    const checkIn = CheckIn.create({
      enrollmentId: 'enrollment-1',
      eventId: 'event-1',
      eventStartDate,
      eventEndDate,
      now,
    });

    expect(checkIn.id).toBeDefined();
    expect(checkIn.checkedInAt).toEqual(now);
  });

  it('deve lançar erro se o check-in for tentado antes do evento começar', () => {
    const now = new Date('2026-09-01T09:00:00.000Z'); // antes de começar

    expect(() =>
      CheckIn.create({
        enrollmentId: 'enrollment-1',
        eventId: 'event-1',
        eventStartDate,
        eventEndDate,
        now,
      }),
    ).toThrow(CheckInWindowClosedException);
  });

  it('deve lançar erro se o check-in for tentado depois do evento terminar', () => {
    const now = new Date('2026-09-01T19:00:00.000Z'); // depois de terminar

    expect(() =>
      CheckIn.create({
        enrollmentId: 'enrollment-1',
        eventId: 'event-1',
        eventStartDate,
        eventEndDate,
        now,
      }),
    ).toThrow(CheckInWindowClosedException);
  });

  it('deve permitir check-in exatamente no início da janela', () => {
    const checkIn = CheckIn.create({
      enrollmentId: 'enrollment-1',
      eventId: 'event-1',
      eventStartDate,
      eventEndDate,
      now: eventStartDate,
    });

    expect(checkIn.checkedInAt).toEqual(eventStartDate);
  });
});
