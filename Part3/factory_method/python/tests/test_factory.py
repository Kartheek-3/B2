import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import sys
from snippet.factory import StandardValidatorFactory, EmergencyValidatorFactory

def run_tests():
    passed = 0
    total = 0
    
    std_factory = StandardValidatorFactory()
    emg_factory = EmergencyValidatorFactory()
    
    # Test 1
    if std_factory.validate_appointment("pat_1", "Regular checkup"): passed += 1
    total += 1
    
    # Test 2
    if not std_factory.validate_appointment("pat_1", "Short"): passed += 1
    total += 1
    
    # Test 3
    if not std_factory.validate_appointment("", "Regular checkup"): passed += 1
    total += 1
    
    # Test 4
    if emg_factory.validate_appointment("pat_2", "Short"): passed += 1
    total += 1
    
    # Test 5
    if not emg_factory.validate_appointment(None, "Heart attack"): passed += 1
    total += 1
    
    print(f"{passed}/{total} passed")
    sys.exit(0 if passed == total else 1)

if __name__ == '__main__':
    run_tests()
