
const DoctorAvailabilityContext = require('../snippet/DoctorAvailabilityContext');
const { StandardBusinessHoursStrategy, ShiftBasedAvailabilityStrategy, EmergencyOnCallAvailabilityStrategy } = require('../snippet/availabilityStrategies');

let passed = 0;
let total = 6;

try {
    const context = new DoctorAvailabilityContext(new StandardBusinessHoursStrategy());
    const emptyBookings = [];
    const someBookings = [{ startTimeIso: '2026-10-12T14:15:00Z', endTimeIso: '2026-10-12T14:45:00Z' }];

    const res1 = context.checkAvailability({ doctorName: 'Dr. A', startTimeIso: '2026-10-13T10:00:00Z', durationMinutes: 30, isEmergency: false }, emptyBookings);
    if (res1.isValid) passed++; else console.log("TC1 Failed");

    const res2 = context.checkAvailability({ doctorName: 'Dr. A', startTimeIso: '2026-10-17T10:00:00Z', durationMinutes: 30, isEmergency: false }, emptyBookings);
    if (!res2.isValid && res2.reason === 'Outside standard business hours') passed++; else console.log("TC2 Failed");

    const res3 = context.checkAvailability({ doctorName: 'Dr. A', startTimeIso: '2026-10-14T12:15:00Z', durationMinutes: 30, isEmergency: false }, emptyBookings);
    if (!res3.isValid && res3.reason === 'Overlaps with lunch break') passed++; else console.log("TC3 Failed");

    const res4 = context.checkAvailability({ doctorName: 'Dr. A', startTimeIso: '2026-10-12T14:00:00Z', durationMinutes: 30, isEmergency: false }, someBookings);
    if (!res4.isValid && res4.reason === 'Time slot conflict') passed++; else console.log("TC4 Failed");

    context.setStrategy(new ShiftBasedAvailabilityStrategy());
    const res5 = context.checkAvailability({ doctorName: 'Dr. A', startTimeIso: '2026-10-12T06:30:00Z', durationMinutes: 45, isEmergency: false }, emptyBookings);
    if (!res5.isValid && res5.reason === 'Outside scheduled shift') passed++; else console.log("TC5 Failed");

    context.setStrategy(new EmergencyOnCallAvailabilityStrategy());
    const emergencyBookings = [{ startTimeIso: '2026-10-11T23:00:00Z', endTimeIso: '2026-10-11T23:45:00Z' }];
    const res6 = context.checkAvailability({ doctorName: 'Dr. A', startTimeIso: '2026-10-11T23:50:00Z', durationMinutes: 30, isEmergency: true }, emergencyBookings);
    if (!res6.isValid && res6.reason === 'Requires at least 15 minutes recovery buffer') passed++; else console.log("TC6 Failed");
} catch (e) {
    console.error(e);
}
console.log(`${passed}/${total} passed`);
