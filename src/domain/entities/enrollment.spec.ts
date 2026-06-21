import { Enrollment, InvalidWaitlistPositionException } from './enrollment';
import { EnrollmentAlreadyCancelledException } from '../exceptions/enrollment-already-cancelled.exception';

describe('Enrollment', () => {
  describe('createConfirmed', () => {
    it('deve criar uma inscrição confirmada sem posição na lista de espera', () => {
      const enrollment = Enrollment.createConfirmed({
        eventId: 'event-1',
        userId: 'user-1',
      });

      expect(enrollment.id).toBeDefined();
      expect(enrollment.getStatus().isConfirmed()).toBe(true);
      expect(enrollment.getWaitlistPosition()).toBeNull();
    });
  });

  describe('createWaitlisted', () => {
    it('deve criar uma inscrição em lista de espera com posição definida', () => {
      const enrollment = Enrollment.createWaitlisted({
        eventId: 'event-1',
        userId: 'user-1',
        waitlistPosition: 3,
      });

      expect(enrollment.getStatus().isWaitlisted()).toBe(true);
      expect(enrollment.getWaitlistPosition()).toBe(3);
    });

    it('deve lançar erro se a posição for menor que 1', () => {
      expect(() =>
        Enrollment.createWaitlisted({
          eventId: 'event-1',
          userId: 'user-1',
          waitlistPosition: 0,
        }),
      ).toThrow(InvalidWaitlistPositionException);
    });
  });

  describe('cancel', () => {
    it('deve cancelar uma inscrição confirmada', () => {
      const enrollment = Enrollment.createConfirmed({ eventId: 'event-1', userId: 'user-1' });
      enrollment.cancel();

      expect(enrollment.getStatus().isCancelled()).toBe(true);
      expect(enrollment.getWaitlistPosition()).toBeNull();
    });

    it('deve cancelar uma inscrição em lista de espera, limpando a posição', () => {
      const enrollment = Enrollment.createWaitlisted({
        eventId: 'event-1',
        userId: 'user-1',
        waitlistPosition: 2,
      });
      enrollment.cancel();

      expect(enrollment.getStatus().isCancelled()).toBe(true);
      expect(enrollment.getWaitlistPosition()).toBeNull();
    });

    it('não deve permitir cancelar uma inscrição já cancelada', () => {
      const enrollment = Enrollment.createConfirmed({ eventId: 'event-1', userId: 'user-1' });
      enrollment.cancel();

      expect(() => enrollment.cancel()).toThrow(EnrollmentAlreadyCancelledException);
    });
  });

  describe('promoteFromWaitlist', () => {
    it('deve promover uma inscrição da lista de espera para confirmada', () => {
      const enrollment = Enrollment.createWaitlisted({
        eventId: 'event-1',
        userId: 'user-1',
        waitlistPosition: 1,
      });
      enrollment.promoteFromWaitlist();

      expect(enrollment.getStatus().isConfirmed()).toBe(true);
      expect(enrollment.getWaitlistPosition()).toBeNull();
    });

    it('não deve permitir promover uma inscrição que já está confirmada', () => {
      const enrollment = Enrollment.createConfirmed({ eventId: 'event-1', userId: 'user-1' });

      expect(() => enrollment.promoteFromWaitlist()).toThrow(InvalidWaitlistPositionException);
    });
  });
});
