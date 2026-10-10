from typing import Dict, Set

class DomainEventBus:
    def __init__(self):
        self.subscribers: Dict[str, Set] = {}

    def subscribe(self, event_type: str, subscriber):
        if event_type not in self.subscribers:
            self.subscribers[event_type] = set()
        self.subscribers[event_type].add(subscriber)

    def unsubscribe(self, event_type: str, subscriber):
        if event_type in self.subscribers:
            self.subscribers[event_type].discard(subscriber)

    def publish(self, event):
        subs = self.subscribers.get(event.event_type, set())
        for sub in list(subs):
            sub.on_event(event)
