package tests;
import snippet.AppwriteClientManager;

public class SingletonTest {
    public static void main(String[] args) {
        int passed = 0;
        int total = 0;
        
        try {
            AppwriteClientManager.resetInstanceForTesting();
            AppwriteClientManager instance1 = AppwriteClientManager.getInstance();
            AppwriteClientManager instance2 = AppwriteClientManager.getInstance();
            
            // Should be exactly the same instance
            if (instance1 == instance2) passed++;
            total++;
            
            // Environment variables are not set in this test
            if (!instance1.isConfigured()) passed++;
            total++;
            
            System.out.println(passed + "/" + total + " passed");
            System.exit(passed == total ? 0 : 1);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
