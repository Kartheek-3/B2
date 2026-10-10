package test;
import adapter.*;
import adapter.models.*;
public class AdapterTest {
    public static void main(String[] args) {
        int passed = 0;
        int total = 6;
        try {
            ProprietaryVideoProvider provider = new ProprietaryVideoProvider();
            VideoConsultationAdapter adapter = new VideoConsultationAdapter(provider);
            // TC_ADAPT_01 & TC_ADAPT_02
            ConsultationSession session = adapter.createSession("pat_1", "doc_1", "2026-10-12T10:00:00Z", 30);
            if (session.sessionId != null && session.joinUrl.contains("room_pat_1_doc_1") && session.durationMinutes == 30) passed += 2;
            else System.out.println("TC1/2 Failed");
            // TC_ADAPT_03
            ConsultationToken tokenDoc = adapter.generateParticipantToken(session.sessionId, "doc_1", "doctor");
            if (tokenDoc.token.contains("LEVEL_HOST") && tokenDoc.role.equals("doctor")) passed++;
            else System.out.println("TC3 Failed");
            // TC_ADAPT_04
            ConsultationToken tokenPat = adapter.generateParticipantToken(session.sessionId, "pat_1", "patient");
            if (tokenPat.token.contains("LEVEL_GUEST") && tokenPat.role.equals("patient")) passed++;
            else System.out.println("TC4 Failed");
            // TC_ADAPT_05
            try {
                adapter.generateParticipantToken(session.sessionId, "usr", "admin");
                System.out.println("TC5 Failed");
            } catch (DomainValidationError e) {
                if (e.getMessage().equals("Unsupported participant role")) passed++;
            }
            // TC_ADAPT_06
            try {
                adapter.createSession("", "doc_1", "2026-10-12T10:00:00Z", 30);
            } catch (DomainValidationError e) {
                if (e.getMessage().contains("VendorError")) passed++;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println(passed + "/" + total + " passed");
    }
}
