package adapter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
public class ProprietaryVideoProvider {
    public Map<String, Object> init_meeting(String room_name, String organizer_id, long unix_timestamp_sec, int duration_sec) {
        if (room_name == null || room_name.isEmpty()) throw new RuntimeException("VendorError: room_name is required");
        Map<String, Object> res = new HashMap<>();
        res.put("meeting_uuid", UUID.randomUUID().toString());
        res.put("web_link", "https://vendor.video.com/" + room_name);
        res.put("start_epoch", unix_timestamp_sec);
        res.put("duration_s", duration_sec);
        res.put("host_id", organizer_id);
        return res;
    }
    public Map<String, Object> mint_access_key(String meeting_uuid, String user_id, String vendor_access_level) {
        if (!vendor_access_level.equals("LEVEL_HOST") && !vendor_access_level.equals("LEVEL_GUEST")) {
            throw new RuntimeException("VendorError: unauthorized role " + vendor_access_level);
        }
        Map<String, Object> res = new HashMap<>();
        res.put("raw_jwt_token", "token_" + user_id + "_" + vendor_access_level);
        res.put("room", meeting_uuid);
        res.put("user", user_id);
        res.put("access_tier", vendor_access_level);
        res.put("exp_timestamp", System.currentTimeMillis() / 1000 + 3600);
        return res;
    }
}
