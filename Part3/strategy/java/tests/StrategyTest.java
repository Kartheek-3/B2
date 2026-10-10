package test;
import strategy.*;
import strategy.models.*;
import java.util.ArrayList;
import java.util.List;
public class StrategyTest {
    public static void main(String[] args) {
        int passed = 0;
        int total = 6;
        try {
            DoctorAvailabilityContext context = new DoctorAvailabilityContext(new StandardBusinessHoursStrategy());
            List<ExistingBooking> emptyBookings = new ArrayList<>();
            List<ExistingBooking> someBookings = new ArrayList<>();
            someBookings.add(new ExistingBooking("2026-10-12T14:15:00Z", "2026-10-12T14:45:00Z"));
            ValidationResult res1 = context.checkAvailability(new SlotRequest("Dr. A", "2026-10-13T10:00:00Z", 30, false), emptyBookings);
            if (res1.isValid) passed++; else System.out.println("TC1 Failed: " + res1.reason);
            ValidationResult res2 = context.checkAvailability(new SlotRequest("Dr. A", "2026-10-17T10:00:00Z", 30, false), emptyBookings);
            if (!res2.isValid && res2.reason.equals("Outside standard business hours")) passed++; else System.out.println("TC2 Failed");
            ValidationResult res3 = context.checkAvailability(new SlotRequest("Dr. A", "2026-10-14T12:15:00Z", 30, false), emptyBookings);
            if (!res3.isValid && res3.reason.equals("Overlaps with lunch break")) passed++; else System.out.println("TC3 Failed");
            ValidationResult res4 = context.checkAvailability(new SlotRequest("Dr. A", "2026-10-12T14:00:00Z", 30, false), someBookings);
            if (!res4.isValid && res4.reason.equals("Time slot conflict")) passed++; else System.out.println("TC4 Failed");
            context.setStrategy(new ShiftBasedAvailabilityStrategy());
            ValidationResult res5 = context.checkAvailability(new SlotRequest("Dr. A", "2026-10-12T06:30:00Z", 45, false), emptyBookings);
            if (!res5.isValid && res5.reason.equals("Outside scheduled shift")) passed++; else System.out.println("TC5 Failed");
            context.setStrategy(new EmergencyOnCallAvailabilityStrategy());
            List<ExistingBooking> emergencyBookings = new ArrayList<>();
            emergencyBookings.add(new ExistingBooking("2026-10-11T23:00:00Z", "2026-10-11T23:45:00Z"));
            ValidationResult res6 = context.checkAvailability(new SlotRequest("Dr. A", "2026-10-11T23:50:00Z", 30, true), emergencyBookings); 
            if (!res6.isValid && res6.reason.equals("Requires at least 15 minutes recovery buffer")) passed++; else System.out.println("TC6 Failed");
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println(passed + "/" + total + " passed");
    }
}
