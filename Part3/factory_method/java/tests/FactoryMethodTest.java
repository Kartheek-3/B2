package snippet;

public class FactoryMethodTest {
    public static void main(String[] args) {
        int passed = 0;
        int total = 0;
        
        try {
            ValidatorFactory standardFactory = new StandardValidatorFactory();
            ValidatorFactory emergencyFactory = new EmergencyValidatorFactory();
            
            // Test 1: Standard valid
            if (standardFactory.validateAppointment("pat_1", "Regular checkup")) passed++;
            total++;
            
            // Test 2: Standard invalid (reason too short)
            if (!standardFactory.validateAppointment("pat_1", "Short")) passed++;
            total++;
            
            // Test 3: Standard invalid (missing ID)
            if (!standardFactory.validateAppointment("", "Regular checkup")) passed++;
            total++;
            
            // Test 4: Emergency valid (reason short is okay)
            if (emergencyFactory.validateAppointment("pat_2", "Short")) passed++;
            total++;
            
            // Test 5: Emergency invalid (missing ID)
            if (!emergencyFactory.validateAppointment(null, "Heart attack")) passed++;
            total++;
            
            System.out.println(passed + "/" + total + " passed");
            System.exit(passed == total ? 0 : 1);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
