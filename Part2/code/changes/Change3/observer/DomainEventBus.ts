import { DomainEvent } from "../types/events.types";

/**
 * Observer Interface (GoF Observer Pattern)
 * Defines the update contract for subscribers responding to domain events.
 */
export interface IDomainEventSubscriber<T extends DomainEvent = DomainEvent> {
  onEvent(event: T): Promise<void>;
  getSubscriberName(): string;
}

/**
 * Subject / Event Bus (GoF Observer Pattern)
 * Manages event-to-subscriber bindings and broadcasts domain events
 * to all registered observers asynchronously.
 */
export class DomainEventBus {
  private subscribers: Map<string, Set<IDomainEventSubscriber>> = new Map();

  /**
   * Register an observer for a specific event type.
   */
  public subscribe<T extends DomainEvent>(
    eventType: string,
    subscriber: IDomainEventSubscriber<T>
  ): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(subscriber as IDomainEventSubscriber);
  }

  /**
   * Unregister an observer.
   */
  public unsubscribe<T extends DomainEvent>(
    eventType: string,
    subscriber: IDomainEventSubscriber<T>
  ): void {
    const subs = this.subscribers.get(eventType);
    if (subs) {
      subs.delete(subscriber as IDomainEventSubscriber);
    }
  }

  /**
   * Broadcast an event to all registered observers.
   */
  public async publish<T extends DomainEvent>(event: T): Promise<void> {
    const subs = this.subscribers.get(event.eventType);
    if (!subs || subs.size === 0) return;

    const executions = Array.from(subs).map(async (subscriber) => {
      try {
        await subscriber.onEvent(event);
      } catch (err) {
        console.error(
          `DomainEventBus: Error in subscriber ${subscriber.getSubscriberName()} handling ${event.eventType}:`,
          err
        );
      }
    });

    await Promise.all(executions);
  }

  /**
   * Helper to count registered subscribers for testing and verification.
   */
  public getSubscriberCount(eventType: string): number {
    return this.subscribers.get(eventType)?.size || 0;
  }

  public clear(): void {
    this.subscribers.clear();
  }
}
