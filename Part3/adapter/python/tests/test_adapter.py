import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from snippet.video_adapter import VideoConsultationAdapter
from snippet.proprietary_provider import ProprietaryVideoProvider
from snippet.models import DomainValidationError

def main():
    passed = 0
    total = 6
    
    provider = ProprietaryVideoProvider()
    adapter = VideoConsultationAdapter(provider)
    
    try:
        session = adapter.create_session("pat_1", "doc_1", "2026-10-12T10:00:00Z", 30)
        if session.session_id and "room_pat_1_doc_1" in session.join_url and session.duration_minutes == 30:
            passed += 2
        else: print("TC1/2 Failed")
            
        token_doc = adapter.generate_participant_token(session.session_id, "doc_1", "doctor")
        if "LEVEL_HOST" in token_doc.token and token_doc.role == "doctor": passed += 1
        else: print("TC3 Failed")
        
        token_pat = adapter.generate_participant_token(session.session_id, "pat_1", "patient")
        if "LEVEL_GUEST" in token_pat.token and token_pat.role == "patient": passed += 1
        else: print("TC4 Failed")
        
        try:
            adapter.generate_participant_token(session.session_id, "usr", "admin")
            print("TC5 Failed")
        except DomainValidationError as e:
            if str(e) == "Unsupported participant role": passed += 1
            
        try:
            adapter.create_session("", "doc_1", "2026-10-12T10:00:00Z", 30)
            print("TC6 Failed")
        except DomainValidationError as e:
            if "VendorError" in str(e): passed += 1
            
    except Exception as e:
        print(f"Test failed with error: {e}")
        
    print(f"{passed}/{total} passed")

if __name__ == '__main__':
    main()
