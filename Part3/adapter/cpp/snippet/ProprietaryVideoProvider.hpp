#ifndef PROPRIETARYVIDEOPROVIDER_HPP
#define PROPRIETARYVIDEOPROVIDER_HPP

#include <string>
#include <map>
#include <stdexcept>
#include <ctime>

struct InitMeetingResponse {
    std::string meeting_uuid;
    std::string web_link;
    long start_epoch;
    int duration_s;
    std::string host_id;
};

struct MintAccessKeyResponse {
    std::string raw_jwt_token;
    std::string room;
    std::string user;
    std::string access_tier;
    long exp_timestamp;
};

class ProprietaryVideoProvider {
public:
    InitMeetingResponse init_meeting(const std::string& room_name, const std::string& organizer_id, long unix_timestamp_sec, int duration_sec) {
        if (room_name.empty()) throw std::runtime_error("VendorError: room_name is required");
        return {
            "uuid-random-1234",
            "https://vendor.video.com/" + room_name,
            unix_timestamp_sec,
            duration_sec,
            organizer_id
        };
    }
    
    MintAccessKeyResponse mint_access_key(const std::string& meeting_uuid, const std::string& user_id, const std::string& vendor_access_level) {
        if (vendor_access_level != "LEVEL_HOST" && vendor_access_level != "LEVEL_GUEST") {
            throw std::runtime_error("VendorError: unauthorized role " + vendor_access_level);
        }
        return {
            "token_" + user_id + "_" + vendor_access_level,
            meeting_uuid,
            user_id,
            vendor_access_level,
            static_cast<long>(time(nullptr)) + 3600
        };
    }
};

#endif
