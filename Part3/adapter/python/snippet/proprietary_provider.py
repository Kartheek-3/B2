import uuid
import time

class ProprietaryVideoProvider:
    def init_meeting(self, room_name: str, organizer_id: str, unix_timestamp_sec: int, duration_sec: int) -> dict:
        if not room_name: raise Exception("VendorError: room_name is required")
        return {
            "meeting_uuid": str(uuid.uuid4()),
            "web_link": f"https://vendor.video.com/{room_name}",
            "start_epoch": unix_timestamp_sec,
            "duration_s": duration_sec,
            "host_id": organizer_id
        }
        
    def mint_access_key(self, meeting_uuid: str, user_id: str, vendor_access_level: str) -> dict:
        if vendor_access_level not in ["LEVEL_HOST", "LEVEL_GUEST"]:
            raise Exception(f"VendorError: unauthorized role {vendor_access_level}")
        return {
            "raw_jwt_token": f"token_{user_id}_{vendor_access_level}",
            "room": meeting_uuid,
            "user": user_id,
            "access_tier": vendor_access_level,
            "exp_timestamp": int(time.time()) + 3600
        }
