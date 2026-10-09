export const GenderOptions = ["Male", "Female", "Other"];

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "Male" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Birth Certificate",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};

export const IdentificationTypes = [
  "Birth Certificate",
  "Driver's License",
  "Medical Insurance Card/Policy",
  "Military ID Card",
  "National Identity Card",
  "Passport",
  "Resident Alien Card (Green Card)",
  "Social Security Card",
  "State ID Card",
  "Student ID Card",
  "Voter ID Card",
];

export const Doctors = [
  {
    image: "/assets/images/dr-green.png",
    name: "John Green",
  },
  {
    image: "/assets/images/dr-cameron.png",
    name: "Leila Cameron",
  },
  {
    image: "/assets/images/dr-livingston.png",
    name: "David Livingston",
  },
  {
    image: "/assets/images/dr-peter.png",
    name: "Evan Peter",
  },
  {
    image: "/assets/images/dr-powell.png",
    name: "Jane Powell",
  },
  {
    image: "/assets/images/dr-remirez.png",
    name: "Alex Ramirez",
  },
  {
    image: "/assets/images/dr-lee.png",
    name: "Jasmine Lee",
  },
  {
    image: "/assets/images/dr-cruz.png",
    name: "Alyana Cruz",
  },
  {
    image: "/assets/images/dr-sharma.png",
    name: "Hardik Sharma",
  },
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};

export const DoctorAvailabilityConfigs = {
  "John Green": {
    doctorName: "John Green",
    strategyType: "STANDARD_BUSINESS_HOURS" as const,
    slotDurationMinutes: 30,
  },
  "Leila Cameron": {
    doctorName: "Leila Cameron",
    strategyType: "SHIFT_BASED" as const,
    assignedShifts: [
      { dayOfWeek: 1, shiftStartHour: 7, shiftEndHour: 15 }, // Mon
      { dayOfWeek: 3, shiftStartHour: 7, shiftEndHour: 15 }, // Wed
      { dayOfWeek: 5, shiftStartHour: 15, shiftEndHour: 23 }, // Fri
    ],
    slotDurationMinutes: 45,
  },
  "David Livingston": {
    doctorName: "David Livingston",
    strategyType: "STANDARD_BUSINESS_HOURS" as const,
    slotDurationMinutes: 30,
  },
  "Evan Peter": {
    doctorName: "Evan Peter",
    strategyType: "EMERGENCY_ON_CALL" as const,
    emergencyBufferMinutes: 15,
    slotDurationMinutes: 20,
  },
  "Jane Powell": {
    doctorName: "Jane Powell",
    strategyType: "STANDARD_BUSINESS_HOURS" as const,
    slotDurationMinutes: 30,
  },
  "Alex Ramirez": {
    doctorName: "Alex Ramirez",
    strategyType: "SHIFT_BASED" as const,
    assignedShifts: [
      { dayOfWeek: 2, shiftStartHour: 8, shiftEndHour: 16 }, // Tue
      { dayOfWeek: 4, shiftStartHour: 8, shiftEndHour: 16 }, // Thu
    ],
    slotDurationMinutes: 30,
  },
  "Jasmine Lee": {
    doctorName: "Jasmine Lee",
    strategyType: "STANDARD_BUSINESS_HOURS" as const,
    slotDurationMinutes: 30,
  },
  "Alyana Cruz": {
    doctorName: "Alyana Cruz",
    strategyType: "EMERGENCY_ON_CALL" as const,
    emergencyBufferMinutes: 20,
    slotDurationMinutes: 30,
  },
  "Hardik Sharma": {
    doctorName: "Hardik Sharma",
    strategyType: "STANDARD_BUSINESS_HOURS" as const,
    slotDurationMinutes: 30,
  },
};
