import fs from "fs";
import path from "path";

import { Appointment, Patient } from "@/types/appwrite.types";

interface DemoUser {
  $id: string;
  name: string;
  email: string;
  phone: string;
  $createdAt: string;
}

interface DemoStoreData {
  users: Record<string, DemoUser>;
  patients: Record<string, Patient>;
  appointments: Record<string, Appointment>;
}

export class LocalDemonstrationStore {
  private static instance: LocalDemonstrationStore;
  private filePath: string;
  private data: DemoStoreData;

  private constructor() {
    this.filePath = path.resolve(process.cwd(), "data", "demo_store.json");
    this.data = this.loadOrSeed();
  }

  public static getInstance(): LocalDemonstrationStore {
    if (!LocalDemonstrationStore.instance) {
      LocalDemonstrationStore.instance = new LocalDemonstrationStore();
    }
    return LocalDemonstrationStore.instance;
  }

  private loadOrSeed(): DemoStoreData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && parsed.users && parsed.patients && parsed.appointments) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("[DEMO STORE] Error reading demo_store.json, re-seeding default demo records.", err);
    }

    const seeded = this.createDefaultSeed();
    this.persistSync(seeded);
    return seeded;
  }

  private persistSync(dataToPersist: DemoStoreData): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(dataToPersist, null, 2), "utf-8");
    } catch (err) {
      console.error("[DEMO STORE] Error persisting to demo_store.json:", err);
    }
  }

  private persist(): void {
    this.persistSync(this.data);
  }

  private createDefaultSeed(): DemoStoreData {
    const nowIso = new Date().toISOString();
    const tomorrowIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const dayAfterIso = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const yesterdayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const defaultUser: DemoUser = {
      $id: "user_demo_1",
      name: "John Doe",
      email: "johndoe@gmail.com",
      phone: "+15551234567",
      $createdAt: nowIso,
    };

    const defaultPatient: Patient = {
      $id: "patient_demo_1",
      $collectionId: "patients",
      $databaseId: "default",
      $createdAt: nowIso,
      $updatedAt: nowIso,
      $permissions: [],
      $sequence: 1,
      userId: defaultUser.$id,
      name: defaultUser.name,
      email: defaultUser.email,
      phone: defaultUser.phone,
      birthDate: new Date("1990-01-15"),
      gender: "male" as any,
      address: "123 Healthcare Ave, Boston, MA",
      occupation: "Software Engineer",
      emergencyContactName: "Jane Doe",
      emergencyContactNumber: "+15559876543",
      primaryPhysician: "Dr. John Green",
      insuranceProvider: "Blue Cross Blue Shield",
      insurancePolicyNumber: "BCBS-987654321",
      allergies: "Penicillin",
      currentMedication: "None",
      familyMedicalHistory: "Hypertension",
      pastMedicalHistory: "Appendectomy (2018)",
      identificationType: "State Driver's License",
      identificationNumber: "DL-12345678",
      identificationDocument: undefined,
      privacyConsent: true,
    };

    const apt1: Appointment = {
      $id: "apt_demo_sched_1",
      $collectionId: "appointments",
      $databaseId: "default",
      $createdAt: yesterdayIso,
      $updatedAt: nowIso,
      $permissions: [],
      $sequence: 1,
      patient: defaultPatient,
      userId: defaultUser.$id,
      primaryPhysician: "Dr. John Green",
      schedule: new Date(tomorrowIso),
      status: "scheduled",
      reason: "Annual Comprehensive Health Review",
      note: "Standard outpatient business-hours consultation",
      cancellationReason: null,
      isTeleconsultation: true,
      videoRoomId: "room_demo_sched_1",
      videoJoinUrl: "https://demo.telehealth.local/rooms/room_demo_sched_1?token=demo_jwt_token_doctor",
    };

    const apt2: Appointment = {
      $id: "apt_demo_pend_1",
      $collectionId: "appointments",
      $databaseId: "default",
      $createdAt: nowIso,
      $updatedAt: nowIso,
      $permissions: [],
      $sequence: 2,
      patient: defaultPatient,
      userId: defaultUser.$id,
      primaryPhysician: "Dr. Leila Cameron",
      schedule: new Date(dayAfterIso),
      status: "pending",
      reason: "Cardiology Follow-up during Assigned Shift",
      note: "Shift-based strategy roster slot",
      cancellationReason: null,
      isTeleconsultation: false,
      videoRoomId: null,
      videoJoinUrl: null,
    };

    const apt3: Appointment = {
      $id: "apt_demo_canc_1",
      $collectionId: "appointments",
      $databaseId: "default",
      $createdAt: yesterdayIso,
      $updatedAt: yesterdayIso,
      $permissions: [],
      $sequence: 3,
      patient: defaultPatient,
      userId: defaultUser.$id,
      primaryPhysician: "Dr. Evan Peter",
      schedule: new Date(yesterdayIso),
      status: "cancelled",
      reason: "Emergency Triage Consultation",
      note: "24/7 on-call triage buffer review",
      cancellationReason: "Patient conflict; rescheduled to later date.",
      isTeleconsultation: true,
      videoRoomId: "room_demo_canc_1",
      videoJoinUrl: "https://demo.telehealth.local/rooms/room_demo_canc_1?token=demo_jwt_cancelled",
    };

    return {
      users: { [defaultUser.$id]: defaultUser },
      patients: { [defaultPatient.$id]: defaultPatient },
      appointments: {
        [apt1.$id]: apt1,
        [apt2.$id]: apt2,
        [apt3.$id]: apt3,
      },
    };
  }

  // --- User Operations ---
  public createUser(params: { name: string; email: string; phone: string }): DemoUser {
    // Check if user with this email already exists
    const existing = Object.values(this.data.users).find((u) => u.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      console.log(`[LOCAL DEMO STORE] Existing demonstration user found for email: ${params.email} ($id: ${existing.$id})`);
      return existing;
    }

    const newId = `user_${Date.now()}`;
    const newUser: DemoUser = {
      $id: newId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      $createdAt: new Date().toISOString(),
    };

    this.data.users[newId] = newUser;
    this.persist();
    console.log(`[LOCAL DEMO STORE] Created new demonstration user: ${newUser.name} ($id: ${newUser.$id})`);
    return newUser;
  }

  public getUser(userId: string): DemoUser | null {
    return this.data.users[userId] || null;
  }

  public getUserByEmail(email: string): DemoUser | null {
    return Object.values(this.data.users).find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // --- Patient Operations ---
  public registerPatient(patientParams: any): Patient {
    const existing = Object.values(this.data.patients).find((p) => p.userId === patientParams.userId);
    const newId = existing ? existing.$id : `patient_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newPatient: Patient = {
      $id: newId,
      $collectionId: "patients",
      $databaseId: "default",
      $createdAt: existing ? existing.$createdAt : nowIso,
      $updatedAt: nowIso,
      $permissions: [],
      $sequence: 1,
      userId: patientParams.userId,
      name: patientParams.name,
      email: patientParams.email,
      phone: patientParams.phone,
      birthDate: new Date(patientParams.birthDate),
      gender: patientParams.gender,
      address: patientParams.address,
      occupation: patientParams.occupation,
      emergencyContactName: patientParams.emergencyContactName,
      emergencyContactNumber: patientParams.emergencyContactNumber,
      primaryPhysician: patientParams.primaryPhysician,
      insuranceProvider: patientParams.insuranceProvider,
      insurancePolicyNumber: patientParams.insurancePolicyNumber,
      allergies: patientParams.allergies,
      currentMedication: patientParams.currentMedication,
      familyMedicalHistory: patientParams.familyMedicalHistory,
      pastMedicalHistory: patientParams.pastMedicalHistory,
      identificationType: patientParams.identificationType,
      identificationNumber: patientParams.identificationNumber,
      identificationDocument: undefined,
      privacyConsent: !!patientParams.privacyConsent,
    };

    this.data.patients[newId] = newPatient;
    this.persist();
    console.log(`[LOCAL DEMO STORE] Registered demonstration patient: ${newPatient.name} ($id: ${newPatient.$id})`);
    return newPatient;
  }

  public getPatient(userId: string): Patient | null {
    return Object.values(this.data.patients).find((p) => p.userId === userId) || null;
  }

  public getPatientByEmail(email: string): Patient | null {
    return Object.values(this.data.patients).find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public getPatientByPhone(phone: string): Patient | null {
    return Object.values(this.data.patients).find((p) => p.phone === phone) || null;
  }

  // --- Appointment Operations ---
  public createAppointment(params: any): Appointment {
    const newId = `apt_${Date.now()}`;
    const nowIso = new Date().toISOString();

    // Resolve patient record
    let patientRecord: Patient = this.data.patients[params.patient];
    if (!patientRecord) {
      patientRecord = (Object.values(this.data.patients).find((p) => p.userId === params.userId) || {
        $id: `patient_synthetic_${Date.now()}`,
        $collectionId: "patients",
        $databaseId: "default",
        $createdAt: nowIso,
        $updatedAt: nowIso,
        $permissions: [],
        $sequence: 1,
        userId: params.userId || "demo_user",
        name: params.patient || "Demonstration Patient",
        email: "demo.patient@example.com",
        phone: "+15550000000",
        birthDate: new Date("1995-05-05"),
        gender: "other" as any,
        address: "Healthcare Blvd",
        occupation: "Demo Patient",
        emergencyContactName: "Support",
        emergencyContactNumber: "+15550000001",
        primaryPhysician: params.primaryPhysician,
        insuranceProvider: "Demo Care",
        insurancePolicyNumber: "DC-001",
        allergies: undefined,
        currentMedication: undefined,
        familyMedicalHistory: undefined,
        pastMedicalHistory: undefined,
        identificationType: "Demo ID",
        identificationNumber: "DEMO-001",
        identificationDocument: undefined,
        privacyConsent: true,
      }) as Patient;
    }

    const newAppointment: Appointment = {
      $id: newId,
      $collectionId: "appointments",
      $databaseId: "default",
      $createdAt: nowIso,
      $updatedAt: nowIso,
      $permissions: [],
      $sequence: 1,
      patient: patientRecord,
      userId: params.userId || patientRecord.userId,
      primaryPhysician: params.primaryPhysician,
      schedule: new Date(params.schedule),
      status: (params.status as any) || "pending",
      reason: params.reason || "General Consultation",
      note: params.note || "",
      cancellationReason: null,
      isTeleconsultation: !!params.isTeleconsultation,
      videoRoomId: params.videoRoomId || null,
      videoJoinUrl: params.videoJoinUrl || null,
    };

    this.data.appointments[newId] = newAppointment;
    this.persist();
    console.log(`[LOCAL DEMO STORE] Created demonstration appointment: ${newAppointment.$id} (Doctor: ${newAppointment.primaryPhysician}, Status: ${newAppointment.status}, Teleconsult: ${newAppointment.isTeleconsultation})`);
    return newAppointment;
  }

  public getAppointment(appointmentId: string): Appointment | null {
    return this.data.appointments[appointmentId] || null;
  }

  public getRecentAppointmentList(): {
    totalCount: number;
    scheduledCount: number;
    pendingCount: number;
    cancelledCount: number;
    documents: Appointment[];
  } {
    const documents = Object.values(this.data.appointments).sort(
      (a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );

    let scheduledCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    for (const apt of documents) {
      if (apt.status === "scheduled") scheduledCount++;
      else if (apt.status === "pending") pendingCount++;
      else if (apt.status === "cancelled") cancelledCount++;
    }

    return {
      totalCount: documents.length,
      scheduledCount,
      pendingCount,
      cancelledCount,
      documents,
    };
  }

  public updateAppointment(params: {
    appointmentId: string;
    appointment: {
      primaryPhysician: string;
      schedule: Date;
      status: string;
      cancellationReason?: string;
    };
    type: "schedule" | "create" | "cancel";
  }): Appointment | null {
    const existing = this.data.appointments[params.appointmentId];
    if (!existing) {
      console.warn(`[LOCAL DEMO STORE] Appointment ${params.appointmentId} not found to update.`);
      return null;
    }

    existing.status = params.appointment.status as any;
    existing.schedule = new Date(params.appointment.schedule);
    existing.primaryPhysician = params.appointment.primaryPhysician || existing.primaryPhysician;
    if (params.appointment.cancellationReason !== undefined) {
      existing.cancellationReason = params.appointment.cancellationReason;
    }
    existing.$updatedAt = new Date().toISOString();

    this.data.appointments[params.appointmentId] = existing;
    this.persist();
    console.log(`[LOCAL DEMO STORE] Updated demonstration appointment ${params.appointmentId} to status '${existing.status}'`);
    return existing;
  }
}

export const localDemoStore = LocalDemonstrationStore.getInstance();
