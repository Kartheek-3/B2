import { IAvailabilityStrategy } from "./IAvailabilityStrategy";
import {
  SlotValidationRequest,
  DoctorAvailabilityConfig,
  ExistingBooking,
  AvailabilityValidationResult,
  TimeSlot,
  StrategyType,
} from "../types/availability.types";

/**
 * Concrete Strategy 1 (GoF Strategy Pattern)
 * Standard Business Hours Strategy:
 * Enforces conventional outpatient clinic hours:
 * - Days: Monday through Friday (1 to 5)
 * - Operating Hours: 09:00 to 17:00
 * - Mandatory Break: 12:00 to 13:00 (Lunch)
 * - Default slot length: 30 minutes
 */
export class StandardBusinessHoursStrategy implements IAvailabilityStrategy {
  private readonly defaultStartHour = 9;
  private readonly defaultEndHour = 17;

  public validateSlot(
    request: SlotValidationRequest,
    config: DoctorAvailabilityConfig,
    existingBookings: ExistingBooking[]
  ): AvailabilityValidationResult {
    const requested = new Date(request.requestedTime);
    const dayOfWeek = requested.getDay(); // 0 is Sunday, 6 is Saturday

    // 1. Weekend check
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        isValid: false,
        reason: "Standard business hours apply Monday to Friday only. Weekend bookings are not accepted.",
      };
    }

    const hours = requested.getHours();
    const minutes = requested.getMinutes();
    const duration = request.durationMinutes || config.slotDurationMinutes || 30;
    const requestedEnd = new Date(requested.getTime() + duration * 60 * 1000);

    // 2. Business hour boundaries
    if (hours < this.defaultStartHour || requestedEnd.getHours() > this.defaultEndHour || (requestedEnd.getHours() === this.defaultEndHour && requestedEnd.getMinutes() > 0)) {
      return {
        isValid: false,
        reason: `Appointment must fall strictly within clinic operating hours (${this.defaultStartHour}:00 - ${this.defaultEndHour}:00).`,
      };
    }

    // 3. Lunch break conflict (12:00 - 13:00 default)
    const breakWindows = config.breakWindows || [
      { startHour: 12, startMinute: 0, endHour: 13, endMinute: 0 },
    ];

    for (const bw of breakWindows) {
      const breakStart = new Date(requested);
      breakStart.setHours(bw.startHour, bw.startMinute, 0, 0);
      const breakEnd = new Date(requested);
      breakEnd.setHours(bw.endHour, bw.endMinute, 0, 0);

      if (requested < breakEnd && requestedEnd > breakStart) {
        return {
          isValid: false,
          reason: `Requested time overlaps with clinic scheduled break window (${bw.startHour}:00 - ${bw.endHour}:00).`,
        };
      }
    }

    // 4. Existing booking collision check
    for (const booking of existingBookings) {
      if (booking.doctorName.toLowerCase() !== request.doctorName.toLowerCase()) continue;
      if (booking.status === "pending" || booking.status === "scheduled") {
        const bStart = new Date(booking.schedule);
        const bEnd = new Date(bStart.getTime() + booking.durationMinutes * 60 * 1000);

        if (requested < bEnd && requestedEnd > bStart) {
          return {
            isValid: false,
            reason: `Doctor ${request.doctorName} is already booked from ${bStart.toISOString()} to ${bEnd.toISOString()}.`,
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
    if (dayOfWeek === 0 || dayOfWeek === 6) return [];

    const slotDuration = config.slotDurationMinutes || 30;
    const slots: TimeSlot[] = [];

    const current = new Date(date);
    current.setHours(this.defaultStartHour, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(this.defaultEndHour, 0, 0, 0);

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

      current.setTime(current.getTime() + slotDuration * 60 * 1000);
    }

    return slots;
  }

  public getStrategyType(): StrategyType {
    return "STANDARD_BUSINESS_HOURS";
  }
}
