export type ReminderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "FAILED"
  | "CANCELLED";

export type ReminderWindowType =
  | "24_HOURS_PRIOR"
  | "2_HOURS_PRIOR"
  | "IMMEDIATE_CONFIRMATION";

export interface DomainEvent {
  eventId: string;
  occurredAt: Date;
  eventType: string;
}

export interface AppointmentScheduledPayload {
  appointmentId: string;
  patientId: string;
  patientName: string;
  phone: string;
  email?: string;
  scheduleDate: Date;
  doctorName: string;
  timeZone: string;
  isTeleconsultation?: boolean;
  videoJoinUrl?: string;
}

export interface AppointmentCancelledPayload {
  appointmentId: string;
  patientId: string;
  cancellationReason: string;
  cancelledAt: Date;
}

export interface AppointmentRescheduledPayload {
  appointmentId: string;
  patientId: string;
  patientName: string;
  phone: string;
  email?: string;
  previousSchedule: Date;
  newSchedule: Date;
  doctorName: string;
  timeZone: string;
}

export interface ReminderTask {
  reminderId: string; // Idempotency key: `${appointmentId}_${windowType}_${scheduleEpoch}`
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  doctorName: string;
  scheduledFor: Date;
  triggerAt: Date;
  windowType: ReminderWindowType;
  status: ReminderStatus;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  processedAt?: Date;
  isTeleconsultation?: boolean;
  videoJoinUrl?: string;
}

export interface NotificationDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}
