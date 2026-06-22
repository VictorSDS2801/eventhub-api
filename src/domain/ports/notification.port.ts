export const I_NOTIFICATION_PORT = 'I_NOTIFICATION_PORT';

export interface IEnrollmentConfirmedPayload {
  enrollmentId: string;
  userEmail: string;
  userName: string;
  eventTitle: string;
}

export interface IEnrollmentWaitlistedPayload {
  enrollmentId: string;
  userEmail: string;
  userName: string;
  eventTitle: string;
  waitlistPosition: number;
}

export interface IWaitlistPromotedPayload {
  enrollmentId: string;
  userEmail: string;
  userName: string;
  eventTitle: string;
}

export interface INotificationPort {
  enqueueEnrollmentConfirmed(
    payload: IEnrollmentConfirmedPayload,
  ): Promise<void>;
  enqueueEnrollmentWaitlisted(
    payload: IEnrollmentWaitlistedPayload,
  ): Promise<void>;
  enqueueWaitlistPromoted(payload: IWaitlistPromotedPayload): Promise<void>;
}
