#include <iostream>
#include <string>
#include <cstdlib>
#include <mutex>

class AppwriteClientManager {
private:
    static AppwriteClientManager* instance;
    static std::mutex mtx;
    
    std::string endpoint;
    std::string projectId;
    std::string apiKey;
    bool isInitialized;

    AppwriteClientManager() {
        const char* ep = std::getenv("APPWRITE_ENDPOINT");
        const char* pid = std::getenv("APPWRITE_PROJECT_ID");
        const char* ak = std::getenv("APPWRITE_API_KEY");
        
        if (ep) endpoint = ep;
        if (pid) projectId = pid;
        if (ak) apiKey = ak;
        
        isInitialized = (ep != nullptr && pid != nullptr && ak != nullptr);
    }

public:
    AppwriteClientManager(const AppwriteClientManager&) = delete;
    AppwriteClientManager& operator=(const AppwriteClientManager&) = delete;

    static AppwriteClientManager* getInstance() {
        std::lock_guard<std::mutex> lock(mtx);
        if (instance == nullptr) {
            instance = new AppwriteClientManager();
        }
        return instance;
    }

    bool isConfigured() const {
        return isInitialized;
    }

    static void resetInstanceForTesting() {
        std::lock_guard<std::mutex> lock(mtx);
        delete instance;
        instance = nullptr;
    }
};

AppwriteClientManager* AppwriteClientManager::instance = nullptr;
std::mutex AppwriteClientManager::mtx;
