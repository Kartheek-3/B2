"use server";

import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import {
  BUCKET_ID,
  NEXT_PUBLIC_DATABASE_ID,
  ENDPOINT,
  NEXT_PUBLIC_PATIENT_COLLECTION_ID,
  NEXT_PUBLIC_PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { localDemoStore } from "../demo/localDemoStore";
import { parseStringify } from "../utils";

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
    const newuser = await users.create(
      ID.unique(),
      user.email,
      undefined, // phone is not unique in Appwrite, so skip it here
      undefined,
      user.name
    );
    return newuser;
  } catch (error: any) {
    // Check existing user if error code is 409 (conflict)
    if (error && error.code === 409) {
      try {
        const existingUser = await users.list([
          Query.equal("email", [user.email]),
        ]);
        if (existingUser.users[0] && existingUser.users[0].$id) {
          return existingUser.users[0];
        }
      } catch (listErr) {
        // Fall through to demo store if Appwrite list fails
      }
    }

    // Graceful fallback to Local Demonstration Store when Appwrite is unreachable or 401
    console.warn(
      `[LOCAL DEMO MODE] Appwrite user creation failed (${error?.code || error?.message || error}). Operating in local demonstration mode.`
    );
    const demoUser = localDemoStore.createUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    return demoUser;
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error: any) {
    console.warn(
      `[LOCAL DEMO MODE] Appwrite getUser(${userId}) failed (${error?.code || error?.message}). Falling back to local demonstration store.`
    );
    const demoUser = localDemoStore.getUser(userId);
    return demoUser ? parseStringify(demoUser) : null;
  }
};

// REGISTER PATIENT
export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile
    let file;
    let publicUrl = null;
    if (identificationDocument) {
      const blobEntry = identificationDocument.get("blobFile");
      const fileName = identificationDocument.get("fileName") as string;
      if (blobEntry && blobEntry instanceof Blob) {
        const inputFile = InputFile.fromBuffer(blobEntry, fileName);
        file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
        if (file?.$id) {
          publicUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${NEXT_PUBLIC_PROJECT_ID}`;
        }
      }
    }

    // Create new patient document -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#createDocument
    const { $id, ...patientData } = patient;
    const newPatient = await databases.createDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      $id || ID.unique(),
      {
        identificationDocumentId: file?.$id ? file.$id : null,
        identificationDocumentUrl: publicUrl,
        ...patientData,
      } as any
    );

    return parseStringify(newPatient);
  } catch (error: any) {
    console.warn(
      `[LOCAL DEMO MODE] Appwrite registerPatient failed (${error?.code || error?.message}). Falling back to local demonstration store.`
    );
    const demoPatient = localDemoStore.registerPatient({
      ...patient,
      identificationDocumentUrl: "/assets/images/dr-green.png",
    });
    return parseStringify(demoPatient);
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      [
        Query.equal("userId", [userId]),
        Query.orderDesc("$updatedAt"),
        Query.limit(1),
      ]
    );
    return patients.documents.length > 0
      ? parseStringify(patients.documents[0])
      : null;
  } catch (error: any) {
    console.warn(
      `[LOCAL DEMO MODE] Appwrite getPatient(${userId}) failed (${error?.code || error?.message}). Falling back to local demonstration store.`
    );
    const demoPatient = localDemoStore.getPatient(userId);
    return demoPatient ? parseStringify(demoPatient) : null;
  }
};

// --- Utility functions for returning patient logic ---

export const getUserByEmail = async (email: string) => {
  try {
    const usersList = await users.list([Query.equal("email", [email])]);
    if (usersList.users.length > 0) {
      return parseStringify(usersList.users[0]);
    }
    return null;
  } catch (error: any) {
    console.warn(
      `[LOCAL DEMO MODE] Appwrite getUserByEmail failed (${error?.code || error?.message}). Falling back to local demonstration store.`
    );
    const demoUser = localDemoStore.getUserByEmail(email);
    return demoUser ? parseStringify(demoUser) : null;
  }
};

export const getPatientByEmail = async (email: string) => {
  try {
    const patients = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      [
        Query.equal("email", [email]),
        Query.orderDesc("$updatedAt"),
        Query.limit(1),
      ]
    );
    if (patients.documents.length > 0) {
      return parseStringify(patients.documents[0]);
    }
    return null;
  } catch (error: any) {
    console.warn(
      `[LOCAL DEMO MODE] Appwrite getPatientByEmail failed (${error?.code || error?.message}). Falling back to local demonstration store.`
    );
    const demoPatient = localDemoStore.getPatientByEmail(email);
    return demoPatient ? parseStringify(demoPatient) : null;
  }
};

export const updatePatientUserId = async (
  patientId: string,
  userId: string
) => {
  try {
    const updated = await databases.updateDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      patientId,
      { userId }
    );
    return parseStringify(updated);
  } catch (error: any) {
    console.warn(
      `[LOCAL DEMO MODE] Appwrite updatePatientUserId failed (${error?.code || error?.message}). Falling back to local demonstration store.`
    );
    return null;
  }
};
