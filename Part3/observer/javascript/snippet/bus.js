class DomainEventBus {
    constructor() {
        this.subscribers = new Map();
    }
    subscribe(eventType, subscriber) {
        if (!this.subscribers.has(eventType)) this.subscribers.set(eventType, new Set());
        this.subscribers.get(eventType).add(subscriber);
    }
    unsubscribe(eventType, subscriber) {
        if (this.subscribers.has(eventType)) this.subscribers.get(eventType).delete(subscriber);
    }
    async publish(event) {
        const subs = this.subscribers.get(event.eventType);
        if (!subs || subs.size === 0) return;
        for (const sub of subs) {
            try { await sub.onEvent(event); } 
            catch (err) { console.error(err); }
        }
    }
}

class ReminderStore {
    constructor() { this.tasks = []; }
    add(task) { this.tasks.push(task); }
    getTasks() { return this.tasks; }
    cancelForAppointment(appointmentId) {
        this.tasks = this.tasks.filter(t => t.appointmentId !== appointmentId);
    }
}
module.exports = { DomainEventBus, ReminderStore };
