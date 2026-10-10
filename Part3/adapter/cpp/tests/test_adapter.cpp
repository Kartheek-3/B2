#include "../snippet/ProprietaryVideoProvider.hpp"
#include "../snippet/VideoConsultationAdapter.hpp"
#include <iostream>

int main() {
    int passed = 0;
    int total = 6;
    
    try {
        ProprietaryVideoProvider provider;
        VideoConsultationAdapter adapter(&provider);
        
        ConsultationSession session = adapter.createSession("pat_1", "doc_1", "2026-10-12T10:00:00Z", 30);
        if (!session.sessionId.empty() && session.joinUrl.find("room_pat_1_doc_1") != std::string::npos && session.durationMinutes == 30) {
            passed += 2;
        } else {
            std::cout << "TC1/2 Failed" << std::endl;
        }
        
        ConsultationToken tokenDoc = adapter.generateParticipantToken(session.sessionId, "doc_1", "doctor");
        if (tokenDoc.token.find("LEVEL_HOST") != std::string::npos && tokenDoc.role == "doctor") passed++;
        else std::cout << "TC3 Failed" << std::endl;
        
        ConsultationToken tokenPat = adapter.generateParticipantToken(session.sessionId, "pat_1", "patient");
        if (tokenPat.token.find("LEVEL_GUEST") != std::string::npos && tokenPat.role == "patient") passed++;
        else std::cout << "TC4 Failed" << std::endl;
        
        try {
            adapter.generateParticipantToken(session.sessionId, "usr", "admin");
            std::cout << "TC5 Failed" << std::endl;
        } catch (const DomainValidationError& e) {
            if (std::string(e.what()) == "Unsupported participant role") passed++;
        }
        
        try {
            adapter.createSession("", "doc_1", "2026-10-12T10:00:00Z", 30);
            std::cout << "TC6 Failed" << std::endl;
        } catch (const DomainValidationError& e) {
            if (std::string(e.what()).find("VendorError") != std::string::npos) passed++;
        }
        
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
    }
    
    std::cout << passed << "/" << total << " passed" << std::endl;
    return 0;
}
