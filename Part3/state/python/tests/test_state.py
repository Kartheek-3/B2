import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import sys
from snippet.state import AppointmentContext

def run_tests():
    passed = 0
    total = 0
    
    # Test 1
    app1 = AppointmentContext("app1")
    app1.schedule()
    if app1.get_status() == "scheduled": passed += 1
    total += 1
    
    # Test 2
    app1.cancel("Patient requested")
    if app1.get_status() == "cancelled": passed += 1
    total += 1
    
    # Test 3
    try:
        app1.cancel("Again")
    except ValueError:
        passed += 1
    total += 1
    
    # Test 4
    try:
        app1.schedule()
    except ValueError:
        passed += 1
    total += 1
    
    # Test 5
    app2 = AppointmentContext("app2")
    app2.cancel("Doctor unavailable")
    if app2.get_status() == "cancelled" and app2.cancellation_reason == "Doctor unavailable": passed += 1
    total += 1
    
    print(f"{passed}/{total} passed")
    sys.exit(0 if passed == total else 1)

if __name__ == '__main__':
    run_tests()
