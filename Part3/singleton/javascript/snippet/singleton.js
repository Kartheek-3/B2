class AppwriteClientManager {
    constructor() {
        if (AppwriteClientManager.instance) {
            return AppwriteClientManager.instance;
        }

        this.endpoint = process.env.APPWRITE_ENDPOINT;
        this.projectId = process.env.APPWRITE_PROJECT_ID;
        this.apiKey = process.env.APPWRITE_API_KEY;
        this.isInitialized = !!(this.endpoint && this.projectId && this.apiKey);

        AppwriteClientManager.instance = this;
        return this;
    }

    isConfigured() {
        return this.isInitialized;
    }

    static resetInstanceForTesting() {
        AppwriteClientManager.instance = null;
    }
}

// In Node, modules are cached, so exporting a new instance acts as a singleton as well,
// but we demonstrate class-level singleton here as requested.
module.exports = { AppwriteClientManager };
