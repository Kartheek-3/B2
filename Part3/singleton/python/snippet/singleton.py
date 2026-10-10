import os
import threading

class AppwriteClientManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super(AppwriteClientManager, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        # Prevent re-initialization
        if not hasattr(self, 'is_initialized'):
            self.endpoint = os.getenv("APPWRITE_ENDPOINT")
            self.project_id = os.getenv("APPWRITE_PROJECT_ID")
            self.api_key = os.getenv("APPWRITE_API_KEY")
            self.is_initialized = bool(self.endpoint and self.project_id and self.api_key)

    def is_configured(self) -> bool:
        return self.is_initialized

    @classmethod
    def reset_instance_for_testing(cls):
        cls._instance = None
