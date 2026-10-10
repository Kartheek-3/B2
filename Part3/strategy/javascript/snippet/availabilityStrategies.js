
class StandardBusinessHoursStrategy {
    validateAvailability(request, existingBookings) {
        const startTime = new Date(request.startTimeIso);
        const endTime = new Date(startTime.getTime() + request.durationMinutes * 60000);
        
        const day = startTime.getUTCDay();
        if (day === 0 || day === 6) return { isValid: false, reason: 'Outside standard business hours', strategyName: 'StandardBusinessHoursStrategy' };
        
        const hours = startTime.getUTCHours();
        const endHours = endTime.getUTCHours();
        const endMins = endTime.getUTCMinutes();
        
        if (hours < 9 || endHours > 17 || (endHours === 17 && endMins > 0)) {
            return { isValid: false, reason: 'Outside standard business hours', strategyName: 'StandardBusinessHoursStrategy' };
        }
        
        const lunchStart = new Date(startTime); lunchStart.setUTCHours(12, 0, 0, 0);
        const lunchEnd = new Date(startTime); lunchEnd.setUTCHours(13, 0, 0, 0);
        
        if (startTime < lunchEnd && endTime > lunchStart) {
            return { isValid: false, reason: 'Overlaps with lunch break', strategyName: 'StandardBusinessHoursStrategy' };
        }
        
        for (const booking of existingBookings) {
            const bStart = new Date(booking.startTimeIso);
            const bEnd = new Date(booking.endTimeIso);
            if (startTime < bEnd && endTime > bStart) {
                return { isValid: false, reason: 'Time slot conflict', strategyName: 'StandardBusinessHoursStrategy' };
            }
        }
        
        return { isValid: true, reason: 'Valid', strategyName: 'StandardBusinessHoursStrategy' };
    }
}

class ShiftBasedAvailabilityStrategy {
    validateAvailability(request, existingBookings) {
        const startTime = new Date(request.startTimeIso);
        const endTime = new Date(startTime.getTime() + request.durationMinutes * 60000);
        
        const hours = startTime.getUTCHours();
        const endHours = endTime.getUTCHours();
        const endMins = endTime.getUTCMinutes();
        
        if (hours < 7 || endHours > 15 || (endHours === 15 && endMins > 0)) {
            return { isValid: false, reason: 'Outside scheduled shift', strategyName: 'ShiftBasedAvailabilityStrategy' };
        }
        
        for (const booking of existingBookings) {
            const bStart = new Date(booking.startTimeIso);
            const bEnd = new Date(booking.endTimeIso);
            if (startTime < bEnd && endTime > bStart) {
                return { isValid: false, reason: 'Time slot conflict', strategyName: 'ShiftBasedAvailabilityStrategy' };
            }
        }
        
        return { isValid: true, reason: 'Valid', strategyName: 'ShiftBasedAvailabilityStrategy' };
    }
}

class EmergencyOnCallAvailabilityStrategy {
    validateAvailability(request, existingBookings) {
        const startTime = new Date(request.startTimeIso);
        const endTime = new Date(startTime.getTime() + request.durationMinutes * 60000);
        
        for (const booking of existingBookings) {
            const bStart = new Date(booking.startTimeIso);
            const bEnd = new Date(booking.endTimeIso);
            if (startTime < bEnd && endTime > bStart) {
                return { isValid: false, reason: 'Time slot conflict', strategyName: 'EmergencyOnCallAvailabilityStrategy' };
            }
            if (startTime >= bEnd) {
                if ((startTime - bEnd) / 60000 < 15) {
                    return { isValid: false, reason: 'Requires at least 15 minutes recovery buffer', strategyName: 'EmergencyOnCallAvailabilityStrategy' };
                }
            }
            if (bStart >= endTime) {
                if ((bStart - endTime) / 60000 < 15) {
                    return { isValid: false, reason: 'Requires at least 15 minutes recovery buffer', strategyName: 'EmergencyOnCallAvailabilityStrategy' };
                }
            }
        }
        
        return { isValid: true, reason: 'Valid', strategyName: 'EmergencyOnCallAvailabilityStrategy' };
    }
}

module.exports = { StandardBusinessHoursStrategy, ShiftBasedAvailabilityStrategy, EmergencyOnCallAvailabilityStrategy };
