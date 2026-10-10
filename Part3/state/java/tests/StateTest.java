package snippet;

public class StateTest {
    public static void main(String[] args) {
        int passed = 0;
        int total = 0;
        
        try {
            // Test 1: Valid transition Pending -> Scheduled
            AppointmentContext app1 = new AppointmentContext("app1");
            app1.schedule();
            if ("scheduled".equals(app1.getStatus())) passed++;
            total++;
            
            // Test 2: Valid transition Scheduled -> Cancelled
            app1.cancel("Patient requested");
            if ("cancelled".equals(app1.getStatus())) passed++;
            total++;
            
            // Test 3: Invalid transition Cancelled -> Cancelled
            try {
                app1.cancel("Again");
            } catch (IllegalStateException e) {
                passed++;
            }
            total++;
            
            // Test 4: Invalid transition Cancelled -> Scheduled
            try {
                app1.schedule();
            } catch (IllegalStateException e) {
                passed++;
            }
            total++;
            
            // Test 5: Valid transition Pending -> Cancelled
            AppointmentContext app2 = new AppointmentContext("app2");
            app2.cancel("Doctor unavailable");
            if ("cancelled".equals(app2.getStatus()) && "Doctor unavailable".equals(app2.getCancellationReason())) passed++;
            total++;
            
            System.out.println(passed + "/" + total + " passed");
            System.exit(passed == total ? 0 : 1);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
