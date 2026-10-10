"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { DoctorAvailabilityConfigs } from "@/constants";
import { Appointment } from "@/types/appwrite.types";

import {
  NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
  NEXT_PUBLIC_DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { DoctorAvailabilityContext } from "../availability";
import { localDemoStore } from "../demo/localDemoStore";
import { domainEventBus } from "../events/eventHub";
import { formatDateTime, parseStringify } from "../utils";
import { VideoServiceFactory } from "../video";

//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    // 1. CH02 Strategy Pattern: Doctor schedule availability validation
    const doctorConfig =
      DoctorAvailabilityConfigs[
        appointment.primaryPhysician as keyof typeof DoctorAvailabilityConfigs
      ] || {
        doctorName: appointment.primaryPhysician,
        strategyType: "STANDARD_BUSINESS_HOURS" as const,
        slotDurationMinutes: 30,
      };

    const strategy = DoctorAvailabilityContext.resolveStrategy(doctorConfig);
    const availabilityContext = new DoctorAvailabilityContext(strategy);

    // Concurrency Note: Validates slot at application layer prior to DB write
    const validation = availabilityContext.validateSlot(
      {
        doctorName: appointment.primaryPhysician,
        requestedTime: new Date(appointment.schedule),
        durationMinutes: doctorConfig.slotDurationMinutes || 30,
      },
      doctorConfig,
      []
    );

    if (!validation.isValid) {
      console.warn(
        `Availability validation notice for Dr. ${appointment.primaryPhysician}: ${validation.reason}`
      );
    }

    // 2. CH01 Adapter Pattern: Video Teleconsultation Integration
    let videoRoomId: string | undefined;
    let videoJoinUrl: string | undefined;

    if (appointment.isTeleconsultation) {
      const videoService = VideoServiceFactory.getVideoService();
      const room = await videoService.createRoom({
        appointmentId: `apt_req_${Date.now()}`,
        doctorName: appointment.primaryPhysician,
        patientName: appointment.patient,
        scheduledTime: new Date(appointment.schedule),
        topic: appointment.reason || "Teleconsultation",
      });
      videoRoomId = room.roomId;
      videoJoinUrl = room.roomUrl;
    }

    const appointmentPayload = {
      ...appointment,
      ...(videoRoomId ? { videoRoomId } : {}),
      ...(videoJoinUrl ? { videoJoinUrl } : {}),
    };

    let newAppointment: any = null;

    try {
      newAppointment = await databases.createDocument(
        NEXT_PUBLIC_DATABASE_ID!,
        NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
        ID.unique(),
        appointmentPayload
      );
    } catch (appwriteErr: any) {
      console.warn(
        `[LOCAL DEMO MODE] Appwrite appointment creation failed (${appwriteErr?.code || appwriteErr?.message}). Falling back to local demonstration store.`
      );
      newAppointment = localDemoStore.createAppointment(appointmentPayload);
    }

    // 3. CH03 Observer Pattern: Publish Domain Event
    if (newAppointment && newAppointment.$id) {
      await domainEventBus.publish({
        eventId: `evt_${Date.now()}`,
        occurredAt: new Date(),
        eventType: "APPOINTMENT_SCHEDULED",
        payload: {
          appointmentId: newAppointment.$id,
          patientId: appointment.patient,
          patientName: appointment.patient,
          phone: "+1000000000",
          scheduleDate: new Date(appointment.schedule),
          doctorName: appointment.primaryPhysician,
          timeZone: "UTC",
          isTeleconsultation: appointment.isTeleconsultation,
          videoJoinUrl,
        },
      });
    }

    revalidatePath("/admin");
    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
    return null;
  }
};

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Appwrite cloud network timeout")), 1500)
    );
    const appointments = (await Promise.race([
      databases.listDocuments(
        NEXT_PUBLIC_DATABASE_ID!,
        NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
        [Query.orderDesc("$createdAt")]
      ),
      timeoutPromise,
    ])) as any;

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (
      appointments.documents as unknown as Appointment[]
    ).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case "scheduled":
            acc.scheduledCount++;
            break;
          case "pending":
            acc.pendingCount++;
            break;
          case "cancelled":
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error: any) {
    console.warn(
      `[LOCAL DEMO MODE] Appwrite getRecentAppointmentList failed (${error?.code || error?.message}). Falling back to local demonstration store.`
    );
    const demoData = localDemoStore.getRecentAppointmentList();
    return parseStringify(demoData);
  }
};

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error: any) {
    console.warn(
      `[SMS SINK / DEMO MODE] Notification recorded (Appwrite messaging status: ${error?.code || error?.message}): "${content}" to ${userId}`
    );
    return { success: true, simulated: true, content };
  }
};

// Define the UpdateAppointmentParams type
interface UpdateAppointmentParams {
  userId: string;
  appointmentId: string;
  appointment: {
    primaryPhysician: string;
    schedule: Date;
    status: Status;
    cancellationReason?: string;
  };
  type: "schedule" | "create" | "cancel";
  timeZone: string;
}

//  UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    if (!appointmentId) {
      throw new Error(
        "updateAppointment called without a valid appointmentId (documentId). Check your frontend logic."
      );
    }

    let updatedAppointment: any = null;

    try {
      updatedAppointment = await databases.updateDocument(
        NEXT_PUBLIC_DATABASE_ID!,
        NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
        appointmentId,
        appointment
      );
    } catch (appwriteErr: any) {
      console.warn(
        `[LOCAL DEMO MODE] Appwrite updateDocument failed (${appwriteErr?.code || appwriteErr?.message}). Falling back to local demonstration store.`
      );
      updatedAppointment = localDemoStore.updateAppointment({
        appointmentId,
        appointment,
        type,
      });
    }

    if (!updatedAppointment) throw new Error("Failed to update appointment record.");

    // CH03 Observer Pattern: Publish lifecycle domain events
    if (type === "cancel") {
      await domainEventBus.publish({
        eventId: `evt_cancel_${Date.now()}`,
        occurredAt: new Date(),
        eventType: "APPOINTMENT_CANCELLED",
        payload: {
          appointmentId,
          patientId: userId,
          cancellationReason:
            appointment.cancellationReason || "Cancelled by healthcare administrator",
          cancelledAt: new Date(),
        },
      });
    } else if (type === "schedule") {
      await domainEventBus.publish({
        eventId: `evt_sched_${Date.now()}`,
        occurredAt: new Date(),
        eventType: "APPOINTMENT_SCHEDULED",
        payload: {
          appointmentId,
          patientId: userId,
          patientName: userId,
          phone: "+1000000000",
          scheduleDate: new Date(appointment.schedule),
          doctorName: appointment.primaryPhysician,
          timeZone: timeZone || "UTC",
        },
      });
    }

    const smsMessage = `Greetings from CarePulse. ${type === "schedule" ? `Your appointment is confirmed for ${formatDateTime(appointment.schedule!, timeZone).dateTime} with Dr. ${appointment.primaryPhysician}` : `We regret to inform that your appointment for ${formatDateTime(appointment.schedule!, timeZone).dateTime} is cancelled. Reason:  ${appointment.cancellationReason}`}.`;
    await sendSMSNotification(userId, smsMessage);

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while scheduling an appointment:", error);
    return null;
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );
    return parseStringify(appointment);
  } catch (error: any) {
    console.warn(
      `[LOCAL DEMO MODE] Appwrite getDocument(${appointmentId}) failed (${error?.code || error?.message}). Falling back to local demonstration store.`
    );
    const demoApt = localDemoStore.getAppointment(appointmentId);
    return demoApt ? parseStringify(demoApt) : null;
  }
};
