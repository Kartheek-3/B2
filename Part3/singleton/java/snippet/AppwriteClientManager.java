package snippet;

public class AppwriteClientManager {
    private static volatile AppwriteClientManager instance;
    private final String endpoint;
    private final String projectId;
    private final String apiKey;
    private boolean isInitialized = false;

    private AppwriteClientManager() {
        this.endpoint = System.getenv("APPWRITE_ENDPOINT");
        this.projectId = System.getenv("APPWRITE_PROJECT_ID");
        this.apiKey = System.getenv("APPWRITE_API_KEY");
        if (this.endpoint != null && this.projectId != null && this.apiKey != null) {
            this.isInitialized = true;
        }
    }

    public static AppwriteClientManager getInstance() {
        if (instance == null) {
            synchronized (AppwriteClientManager.class) {
                if (instance == null) {
                    instance = new AppwriteClientManager();
                }
            }
        }
        return instance;
    }

    public boolean isConfigured() {
        return isInitialized;
    }

    public static void resetInstanceForTesting() {
        instance = null;
    }
}
