#include "../snippet/factory.hpp"

int main() {
    int passed = 0, total = 0;
    
    StandardValidatorFactory stdFactory;
    EmergencyValidatorFactory emgFactory;
    
    if (stdFactory.validateAppointment("pat_1", "Regular checkup")) passed++;
    total++;
    
    if (!stdFactory.validateAppointment("pat_1", "Short")) passed++;
    total++;
    
    if (!stdFactory.validateAppointment("", "Regular checkup")) passed++;
    total++;
    
    if (emgFactory.validateAppointment("pat_2", "Short")) passed++;
    total++;
    
    if (!emgFactory.validateAppointment("", "Heart attack")) passed++;
    total++;
    
    std::cout << passed << "/" << total << " passed\n";
    return passed == total ? 0 : 1;
}
