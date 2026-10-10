#include "../snippet/state.hpp"

int main() {
    int passed = 0, total = 0;
    
    AppointmentContext app1("app1");
    app1.schedule();
    if (app1.getStatus() == "scheduled") passed++; total++;
    
    app1.cancel("Patient");
    if (app1.getStatus() == "cancelled") passed++; total++;
    
    try { app1.cancel("Again"); } 
    catch (...) { passed++; } total++;
    
    try { app1.schedule(); } 
    catch (...) { passed++; } total++;
    
    AppointmentContext app2("app2");
    app2.cancel("Doctor");
    if (app2.getStatus() == "cancelled" && app2.cancellationReason == "Doctor") passed++; total++;
    
    std::cout << passed << "/" << total << " passed\n";
    return passed == total ? 0 : 1;
}
