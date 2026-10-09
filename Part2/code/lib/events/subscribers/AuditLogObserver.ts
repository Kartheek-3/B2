import { IDomainEventSubscriber } from "../DomainEventBus";
import { DomainEvent } from "../types";

export interface AuditLogEntry {
  auditId: string;
  eventType: string;
  occurredAt: Date;
  details: unknown;
}

/**
 * Concrete Observer 3 (GoF Observer Pattern)
 * Listens for all appointment lifecycle events and appends them
 * to an audit trail for compliance, traceability, and debugging.
 */
export class AuditLogObserver implements IDomainEventSubscriber {
  private auditEntries: AuditLogEntry[] = [];

  public async onEvent(event: DomainEvent): Promise<void> {
    const entry: AuditLogEntry = {
      auditId: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
      details: (event as unknown as { payload: unknown }).payload || event,
    };
    this.auditEntries.push(entry);
  }

  public getAuditTrail(): AuditLogEntry[] {
    return [...this.auditEntries];
  }

  public getSubscriberName(): string {
    return "AuditLogObserver";
  }

  public clear(): void {
    this.auditEntries = [];
  }
}
