import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import os
from snippet.singleton import AppwriteClientManager
import sys

def run_tests():
    passed = 0
    total = 0
    
    AppwriteClientManager.reset_instance_for_testing()
    
    inst1 = AppwriteClientManager()
    inst2 = AppwriteClientManager()
    
    if inst1 is inst2: passed += 1
    total += 1
    
    if not inst1.is_configured(): passed += 1
    total += 1
    
    print(f"{passed}/{total} passed")
    sys.exit(0 if passed == total else 1)

if __name__ == '__main__':
    run_tests()
