
const ProprietaryVideoProvider = require('../snippet/ProprietaryVideoProvider');
const { VideoConsultationAdapter, DomainValidationError } = require('../snippet/VideoConsultationAdapter');

let passed = 0;
let total = 6;

try {
    const provider = new ProprietaryVideoProvider();
    const adapter = new VideoConsultationAdapter(provider);
    
    const session = adapter.createSession('pat_1', 'doc_1', '2026-10-12T10:00:00Z', 30);
    if (session.sessionId && session.joinUrl.includes('room_pat_1_doc_1') && session.durationMinutes === 30) passed += 2;
    else console.log('TC1/2 Failed');
    
    const tokenDoc = adapter.generateParticipantToken(session.sessionId, 'doc_1', 'doctor');
    if (tokenDoc.token.includes('LEVEL_HOST') && tokenDoc.role === 'doctor') passed++;
    else console.log('TC3 Failed');
    
    const tokenPat = adapter.generateParticipantToken(session.sessionId, 'pat_1', 'patient');
    if (tokenPat.token.includes('LEVEL_GUEST') && tokenPat.role === 'patient') passed++;
    else console.log('TC4 Failed');
    
    try {
        adapter.generateParticipantToken(session.sessionId, 'usr', 'admin');
        console.log('TC5 Failed');
    } catch (e) {
        if (e.message === 'Unsupported participant role') passed++;
    }
    
    try {
        adapter.createSession('', 'doc_1', '2026-10-12T10:00:00Z', 30);
        console.log('TC6 Failed');
    } catch (e) {
        if (e.message.includes('VendorError')) passed++;
    }
} catch (e) {
    console.error(e);
}
console.log(`${passed}/${total} passed`);
