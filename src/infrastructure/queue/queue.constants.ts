export const NOTIFICATION_QUEUE_NAME = 'notifications';

export enum NotificationJobType {
  ENROLLMENT_CONFIRMED = 'enrollment-confirmed',
  ENROLLMENT_WAITLISTED = 'enrollment-waitlisted',
  WAITLIST_PROMOTED = 'waitlist-promoted',
}
