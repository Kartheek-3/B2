export type StrategyType =
  | "STANDARD_BUSINESS_HOURS"
  | "SHIFT_BASED"
  | "EMERGENCY_ON_CALL";

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  reason?: string;
}

export interface SlotValidationRequest {
  doctorName: string;
  requestedTime: Date;
  durationMinutes: number;
  timeZone?: string;
}

export interface AvailabilityValidationResult {
  isValid: boolean;
  reason?: string;
  suggestedSlots?: Date[];
}

export interface DoctorShift {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  shiftStartHour: number;
  shiftEndHour: number;
}

export interface BreakWindow {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface DoctorAvailabilityConfig {
  doctorName: string;
  strategyType: StrategyType;
  assignedShifts?: DoctorShift[];
  slotDurationMinutes?: number;
  breakWindows?: BreakWindow[];
  emergencyBufferMinutes?: number;
}

export interface ExistingBooking {
  appointmentId: string;
  doctorName: string;
  schedule: Date;
  durationMinutes: number;
  status: "pending" | "scheduled";
}
