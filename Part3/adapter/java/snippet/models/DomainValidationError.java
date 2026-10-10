package adapter.models;
public class DomainValidationError extends RuntimeException {
    public DomainValidationError(String message) {
        super(message);
    }
}
