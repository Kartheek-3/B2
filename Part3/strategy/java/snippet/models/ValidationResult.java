package strategy.models;
public class ValidationResult {
    public boolean isValid;
    public String reason;
    public String strategyName;
    public ValidationResult(boolean isValid, String reason, String strategyName) {
        this.isValid = isValid;
        this.reason = reason;
        this.strategyName = strategyName;
    }
}
