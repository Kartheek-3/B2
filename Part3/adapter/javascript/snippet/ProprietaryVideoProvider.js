
const crypto = require('crypto');

class ProprietaryVideoProvider {
    init_meeting(room_name, organizer_id, unix_timestamp_sec, duration_sec) {
        if (!room_name) throw new Error("VendorError: room_name is required");
        return {
            meeting_uuid: crypto.randomUUID(),
            web_link: `https://vendor.video.com/${room_name}`,
            start_epoch: unix_timestamp_sec,
            duration_s: duration_sec,
            host_id: organizer_id
        };
    }
    
    mint_access_key(meeting_uuid, user_id, vendor_access_level) {
        if (vendor_access_level !== "LEVEL_HOST" && vendor_access_level !== "LEVEL_GUEST") {
            throw new Error(`VendorError: unauthorized role ${vendor_access_level}`);
        }
        return {
            raw_jwt_token: `token_${user_id}_${vendor_access_level}`,
            room: meeting_uuid,
            user: user_id,
            access_tier: vendor_access_level,
            exp_timestamp: Math.floor(Date.now() / 1000) + 3600
        };
    }
}
module.exports = ProprietaryVideoProvider;
