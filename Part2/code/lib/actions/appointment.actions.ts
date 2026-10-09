"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";

import {
  NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
  NEXT_PUBLIC_DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";

import { VideoServiceFactory } from "../video";
import { DoctorAvailabilityContext } from "../availability";
import { DoctorAvailabilityConfigs } from "@/constants";
import { domainEventBus } from "../events/eventHub";

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

    const newAppointment = await databases.createDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointmentPayload
    );

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
  }
};

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    // const scheduledAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "scheduled");

    // const pendingAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "pending");

    // const cancelledAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "cancelled");

    // const data = {
    //   totalCount: appointments.total,
    //   scheduledCount: scheduledAppointments.length,
    //   pendingCount: pendingAppointments.length,
    //   cancelledCount: cancelledAppointments.length,
    //   documents: appointments.documents,
    // };

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
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
  } catch (error) {
    console.error(
      "An error occurred while retrieving the recent appointments:",
      error
    );
  }
};

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    // https://appwrite.io/docs/references/1.5.x/server-nodejs/messaging#createSms
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error("An error occurred while sending sms:", error);
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
  timeZone: string; // Ensure this property is included
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
    // Update appointment to scheduled -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#updateDocument
    const updatedAppointment = await databases.updateDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) throw Error;

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
  } catch (error) {
    console.error(
      "An error occurred while retrieving the existing patient:",
      error
    );
  }
};
