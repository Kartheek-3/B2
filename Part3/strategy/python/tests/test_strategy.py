import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from snippet.context import DoctorAvailabilityContext
from snippet.availability_strategy import StandardBusinessHoursStrategy, ShiftBasedAvailabilityStrategy, EmergencyOnCallAvailabilityStrategy
from snippet.models import SlotRequest, ExistingBooking

def main():
    passed = 0
    total = 6
    
    context = DoctorAvailabilityContext(StandardBusinessHoursStrategy())
    empty_bookings = []
    some_bookings = [ExistingBooking("2026-10-12T14:15:00Z", "2026-10-12T14:45:00Z")]

    res1 = context.check_availability(SlotRequest("Dr. A", "2026-10-13T10:00:00Z", 30, False), empty_bookings)
    if res1.is_valid: passed += 1
    else: print("TC1 Failed")

    res2 = context.check_availability(SlotRequest("Dr. A", "2026-10-17T10:00:00Z", 30, False), empty_bookings)
    if not res2.is_valid and res2.reason == "Outside standard business hours": passed += 1
    else: print("TC2 Failed")

    res3 = context.check_availability(SlotRequest("Dr. A", "2026-10-14T12:15:00Z", 30, False), empty_bookings)
    if not res3.is_valid and res3.reason == "Overlaps with lunch break": passed += 1
    else: print("TC3 Failed")

    res4 = context.check_availability(SlotRequest("Dr. A", "2026-10-12T14:00:00Z", 30, False), some_bookings)
    if not res4.is_valid and res4.reason == "Time slot conflict": passed += 1
    else: print("TC4 Failed")

    context.set_strategy(ShiftBasedAvailabilityStrategy())
    res5 = context.check_availability(SlotRequest("Dr. A", "2026-10-12T06:30:00Z", 45, False), empty_bookings)
    if not res5.is_valid and res5.reason == "Outside scheduled shift": passed += 1
    else: print("TC5 Failed")

    context.set_strategy(EmergencyOnCallAvailabilityStrategy())
    emergency_bookings = [ExistingBooking("2026-10-11T23:00:00Z", "2026-10-11T23:45:00Z")]
    res6 = context.check_availability(SlotRequest("Dr. A", "2026-10-11T23:50:00Z", 30, True), emergency_bookings)
    if not res6.is_valid and res6.reason == "Requires at least 15 minutes recovery buffer": passed += 1
    else: print("TC6 Failed")

    print(f"{passed}/{total} passed")

if __name__ == '__main__':
    main()
