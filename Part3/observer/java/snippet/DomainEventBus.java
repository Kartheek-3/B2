package snippet;
import java.util.*;

interface IDomainEventSubscriber {
    void onEvent(DomainEvent event) throws Exception;
    String getSubscriberName();
}

public class DomainEventBus {
    private final Map<String, Set<IDomainEventSubscriber>> subscribers = new HashMap<>();

    public void subscribe(String eventType, IDomainEventSubscriber subscriber) {
        subscribers.computeIfAbsent(eventType, k -> new HashSet<>()).add(subscriber);
    }
    public void unsubscribe(String eventType, IDomainEventSubscriber subscriber) {
        Set<IDomainEventSubscriber> subs = subscribers.get(eventType);
        if (subs != null) subs.remove(subscriber);
    }
    public void publish(DomainEvent event) {
        Set<IDomainEventSubscriber> subs = subscribers.get(event.eventType);
        if (subs == null || subs.isEmpty()) return;
        for (IDomainEventSubscriber sub : subs) {
            try { sub.onEvent(event); } 
            catch (Exception e) { System.err.println("Error: " + e.getMessage()); }
        }
    }
}
