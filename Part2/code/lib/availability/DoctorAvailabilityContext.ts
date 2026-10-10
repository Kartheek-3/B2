import { EmergencyOnCallAvailabilityStrategy } from "./EmergencyOnCallAvailabilityStrategy";
import { IAvailabilityStrategy } from "./IAvailabilityStrategy";
import { ShiftBasedAvailabilityStrategy } from "./ShiftBasedAvailabilityStrategy";
import { StandardBusinessHoursStrategy } from "./StandardBusinessHoursStrategy";
import {
  SlotValidationRequest,
  DoctorAvailabilityConfig,
  ExistingBooking,
  AvailabilityValidationResult,
  TimeSlot,
  StrategyType,
} from "./types";

/**
 * Context (GoF Strategy Pattern)
 * Maintains a reference to an IAvailabilityStrategy object and delegates
 * schedule validation and slot calculation algorithms to the configured strategy.
 *
 * Demonstrates genuine runtime interchangeability: the application can swap
 * strategies per doctor, per operational mode, or dynamically based on shift rosters.
 *
 * ARCHITECTURAL CONCURRENCY NOTE:
 * When validating availability at the application layer, two simultaneous
 * requests for the same physician and time slot can both evaluate as valid
 * before either transaction commits to the database (Time-of-Check to Time-of-Use / TOCTOU race).
 * Because Appwrite document mutations do not support distributed two-phase commit
 * transactions or pessimistic row locks across concurrent requests, database-level
 * idempotency or unique reservation constraints are required in high-concurrency production deployments.
 */
export class DoctorAvailabilityContext {
  private strategy: IAvailabilityStrategy;

  constructor(initialStrategy?: IAvailabilityStrategy) {
    this.strategy = initialStrategy || new StandardBusinessHoursStrategy();
  }

  /**
   * Runtime strategy interchangeability.
   */
  public setStrategy(strategy: IAvailabilityStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Return the currently active strategy.
   */
  public getStrategy(): IAvailabilityStrategy {
    return this.strategy;
  }

  /**
   * Dynamically resolves and configures the appropriate strategy for a doctor.
   */
  public static resolveStrategy(config: DoctorAvailabilityConfig): IAvailabilityStrategy {
    switch (config.strategyType) {
      case "SHIFT_BASED":
        return new ShiftBasedAvailabilityStrategy();
      case "EMERGENCY_ON_CALL":
        return new EmergencyOnCallAvailabilityStrategy();
      case "STANDARD_BUSINESS_HOURS":
      default:
        return new StandardBusinessHoursStrategy();
    }
  }

  /**
   * Executes slot validation through the configured strategy.
   */
  public validateSlot(
    request: SlotValidationRequest,
    config: DoctorAvailabilityConfig,
    existingBookings: ExistingBooking[]
  ): AvailabilityValidationResult {
    return this.strategy.validateSlot(request, config, existingBookings);
  }

  /**
   * Generates available calendar slots through the configured strategy.
   */
  public generateAvailableSlots(
    date: Date,
    config: DoctorAvailabilityConfig,
    existingBookings: ExistingBooking[]
  ): TimeSlot[] {
    return this.strategy.generateAvailableSlots(date, config, existingBookings);
  }
}
