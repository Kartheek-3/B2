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
 * Concrete Strategy 3 (GoF Strategy Pattern)
 * Emergency On-Call Availability Strategy:
 * Enforces urgent care and triage availability rules:
 * - Operating Window: 24/7 continuous on-call availability.
 * - Enforces mandatory rest/sanitization/triage buffer spacing
 *   (e.g., default 15 minutes before and after any consultation).
 * - Slots encroaching within the buffer of an existing booking are strictly rejected.
 */
export class EmergencyOnCallAvailabilityStrategy implements IAvailabilityStrategy {
  private readonly defaultBufferMinutes = 15;

  public validateSlot(
    request: SlotValidationRequest,
    config: DoctorAvailabilityConfig,
    existingBookings: ExistingBooking[]
  ): AvailabilityValidationResult {
    const requested = new Date(request.requestedTime);
    const duration = request.durationMinutes || config.slotDurationMinutes || 20;
    const requestedEnd = new Date(requested.getTime() + duration * 60 * 1000);
    const bufferMs = (config.emergencyBufferMinutes || this.defaultBufferMinutes) * 60 * 1000;

    // Emergency On-Call is available 24/7, so no business hour or weekend restriction.
    // However, enforce strict buffer isolation against existing bookings.
    for (const booking of existingBookings) {
      if (booking.doctorName.toLowerCase() !== request.doctorName.toLowerCase()) continue;
      if (booking.status === "pending" || booking.status === "scheduled") {
        const bStart = new Date(booking.schedule);
        const bEnd = new Date(bStart.getTime() + booking.durationMinutes * 60 * 1000);

        // Expanded interval with emergency buffer protection
        const protectedStart = new Date(bStart.getTime() - bufferMs);
        const protectedEnd = new Date(bEnd.getTime() + bufferMs);

        if (requested < protectedEnd && requestedEnd > protectedStart) {
          return {
            isValid: false,
            reason: `Slot violates the ${config.emergencyBufferMinutes || this.defaultBufferMinutes}-minute mandatory emergency buffer surrounding booking from ${bStart.toISOString()} to ${bEnd.toISOString()}.`,
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
    const slotDuration = config.slotDurationMinutes || 20;
    const slots: TimeSlot[] = [];

    // Sample representative 24-hour window
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const current = new Date(dayStart);

    while (current.getTime() + slotDuration * 60 * 1000 <= dayEnd.getTime()) {
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

      // Step forward by slot duration + buffer
      const buffer = (config.emergencyBufferMinutes || this.defaultBufferMinutes);
      current.setTime(current.getTime() + (slotDuration + buffer) * 60 * 1000);
    }

    return slots;
  }

  public getStrategyType(): StrategyType {
    return "EMERGENCY_ON_CALL";
  }
}
