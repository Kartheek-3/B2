#include "../snippet/DoctorAvailabilityContext.hpp"
#include "../snippet/AvailabilityStrategies.hpp"
#include <iostream>
#include <vector>

int main() {
    int passed = 0;
    int total = 6;
    
    try {
        DoctorAvailabilityContext context(std::make_unique<StandardBusinessHoursStrategy>());
        std::vector<ExistingBooking> emptyBookings;
        std::vector<ExistingBooking> someBookings = { {"2026-10-12T14:15:00Z", "2026-10-12T14:45:00Z"} };
        
        ValidationResult res1 = context.checkAvailability({"Dr. A", "2026-10-13T10:00:00Z", 30, false}, emptyBookings);
        if (res1.isValid) passed++; else std::cout << "TC1 Failed" << std::endl;
        
        ValidationResult res2 = context.checkAvailability({"Dr. A", "2026-10-17T10:00:00Z", 30, false}, emptyBookings);
        if (!res2.isValid && res2.reason == "Outside standard business hours") passed++; else std::cout << "TC2 Failed" << std::endl;
        
        ValidationResult res3 = context.checkAvailability({"Dr. A", "2026-10-14T12:15:00Z", 30, false}, emptyBookings);
        if (!res3.isValid && res3.reason == "Overlaps with lunch break") passed++; else std::cout << "TC3 Failed" << std::endl;
        
        ValidationResult res4 = context.checkAvailability({"Dr. A", "2026-10-12T14:00:00Z", 30, false}, someBookings);
        if (!res4.isValid && res4.reason == "Time slot conflict") passed++; else std::cout << "TC4 Failed" << std::endl;
        
        context.setStrategy(std::make_unique<ShiftBasedAvailabilityStrategy>());
        ValidationResult res5 = context.checkAvailability({"Dr. A", "2026-10-12T06:30:00Z", 45, false}, emptyBookings);
        if (!res5.isValid && res5.reason == "Outside scheduled shift") passed++; else std::cout << "TC5 Failed" << std::endl;
        
        context.setStrategy(std::make_unique<EmergencyOnCallAvailabilityStrategy>());
        std::vector<ExistingBooking> emergencyBookings = { {"2026-10-11T23:00:00Z", "2026-10-11T23:45:00Z"} };
        ValidationResult res6 = context.checkAvailability({"Dr. A", "2026-10-11T23:50:00Z", 30, true}, emergencyBookings);
        if (!res6.isValid && res6.reason == "Requires at least 15 minutes recovery buffer") passed++; else std::cout << "TC6 Failed" << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
    }
    
    std::cout << passed << "/" << total << " passed" << std::endl;
    return 0;
}
