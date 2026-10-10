package adapter.models;
public class ConsultationToken {
    public String token;
    public String sessionId;
    public String userId;
    public String role;
    public String expiresAtIso;
    public ConsultationToken(String token, String sessionId, String userId, String role, String expiresAtIso) {
        this.token = token;
        this.sessionId = sessionId;
        this.userId = userId;
        this.role = role;
        this.expiresAtIso = expiresAtIso;
    }
}
