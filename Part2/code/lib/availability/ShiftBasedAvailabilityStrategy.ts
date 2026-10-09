import { IAvailabilityStrategy } from "./IAvailabilityStrategy";
import {
  SlotValidationRequest,
  DoctorAvailabilityConfig,
  ExistingBooking,
  AvailabilityValidationResult,
  TimeSlot,
  StrategyType,
} from "./types";

/**
 * Concrete Strategy 2 (GoF Strategy Pattern)
 * Shift-Based Availability Strategy:
 * Enforces dynamic roster and shift assignments:
 * - Doctors work designated shifts (Morning, Evening, or Night).
 * - Only days with explicitly assigned shifts permit bookings.
 * - Requested slot must fall strictly within the active shift window for that day.
 */
export class ShiftBasedAvailabilityStrategy implements IAvailabilityStrategy {
  public validateSlot(
    request: SlotValidationRequest,
    config: DoctorAvailabilityConfig,
    existingBookings: ExistingBooking[]
  ): AvailabilityValidationResult {
    const requested = new Date(request.requestedTime);
    const dayOfWeek = requested.getDay();

    const assignedShifts = config.assignedShifts || [];
    const activeShift = assignedShifts.find((s) => s.dayOfWeek === dayOfWeek);

    if (!activeShift) {
      return {
        isValid: false,
        reason: `Doctor ${config.doctorName} has no assigned roster shift on day of week ${dayOfWeek}.`,
      };
    }

    const duration = request.durationMinutes || config.slotDurationMinutes || 45;
    const requestedEnd = new Date(requested.getTime() + duration * 60 * 1000);

    const shiftStart = new Date(requested);
    shiftStart.setHours(activeShift.shiftStartHour, 0, 0, 0);

    const shiftEnd = new Date(requested);
    if (activeShift.shiftEndHour < activeShift.shiftStartHour) {
      // Overnight shift spanning midnight
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }
    shiftEnd.setHours(activeShift.shiftEndHour, 0, 0, 0);

    if (requested < shiftStart || requestedEnd > shiftEnd) {
      return {
        isValid: false,
        reason: `Requested time is outside Doctor ${config.doctorName}'s assigned shift (${activeShift.shiftStartHour}:00 - ${activeShift.shiftEndHour}:00).`,
      };
    }

    // Existing booking collision check
    for (const booking of existingBookings) {
      if (booking.doctorName.toLowerCase() !== request.doctorName.toLowerCase()) continue;
      if (booking.status === "pending" || booking.status === "scheduled") {
        const bStart = new Date(booking.schedule);
        const bEnd = new Date(bStart.getTime() + booking.durationMinutes * 60 * 1000);

        if (requested < bEnd && requestedEnd > bStart) {
          return {
            isValid: false,
            reason: `Doctor ${request.doctorName} has a scheduled appointment from ${bStart.toISOString()} to ${bEnd.toISOString()}.`,
          };
        }
      }
    }

    return { isValid: true };
  }

  public generateAvailableSlots(
    date: Date,
    config: DoctorAvailabilityConfig,
    existingBookings: ExistingBooking[]
  ): TimeSlot[] {
    const dayOfWeek = date.getDay();
    const assignedShifts = config.assignedShifts || [];
    const activeShift = assignedShifts.find((s) => s.dayOfWeek === dayOfWeek);

    if (!activeShift) return [];

    const slotDuration = config.slotDurationMinutes || 45;
    const slots: TimeSlot[] = [];

    const shiftStart = new Date(date);
    shiftStart.setHours(activeShift.shiftStartHour, 0, 0, 0);

    const shiftEnd = new Date(date);
    shiftEnd.setHours(activeShift.shiftEndHour, 0, 0, 0);

    const current = new Date(shiftStart);

    while (current.getTime() + slotDuration * 60 * 1000 <= shiftEnd.getTime()) {
      const slotEnd = new Date(current.getTime() + slotDuration * 60 * 1000);
      const validation = this.validateSlot(
        {
          doctorName: config.doctorName,
          requestedTime: new Date(current),
          durationMinutes: slotDuration,
        },
        config,
        existingBookings
      );

      slots.push({
        startTime: new Date(current),
        endTime: slotEnd,
        available: validation.isValid,
        reason: validation.reason,
      });

      current.setTime(current.getTime() + slotDuration * 60 * 1000);
    }

    return slots;
  }

  public getStrategyType(): StrategyType {
    return "SHIFT_BASED";
  }
}
