#include "../snippet/singleton.hpp"

int main() {
    int passed = 0, total = 0;
    
    AppwriteClientManager::resetInstanceForTesting();
    
    AppwriteClientManager* inst1 = AppwriteClientManager::getInstance();
    AppwriteClientManager* inst2 = AppwriteClientManager::getInstance();
    
    if (inst1 == inst2) passed++;
    total++;
    
    if (!inst1->isConfigured()) passed++;
    total++;
    
    std::cout << passed << "/" << total << " passed\n";
    return passed == total ? 0 : 1;
}
