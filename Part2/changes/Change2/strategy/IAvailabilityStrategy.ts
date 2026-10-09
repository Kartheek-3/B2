import {
  SlotValidationRequest,
  DoctorAvailabilityConfig,
  ExistingBooking,
  AvailabilityValidationResult,
  TimeSlot,
  StrategyType,
} from "../types/availability.types";

/**
 * Strategy Interface (GoF Strategy Pattern)
 * Defines the algorithmic family for evaluating doctor schedule availability
 * and slot generation across varying clinical practice operational models.
 */
export interface IAvailabilityStrategy {
  /**
   * Validate whether a specific requested time slot is eligible for booking.
   */
  validateSlot(
    request: SlotValidationRequest,
    config: DoctorAvailabilityConfig,
    existingBookings: ExistingBooking[]
  ): AvailabilityValidationResult;

  /**
   * Generate all open availability slots for a doctor on a given calendar day.
   */
  generateAvailableSlots(
    date: Date,
    config: DoctorAvailabilityConfig,
    existingBookings: ExistingBooking[]
  ): TimeSlot[];

  /**
   * Returns strategy classification identifier.
   */
  getStrategyType(): StrategyType;
}
