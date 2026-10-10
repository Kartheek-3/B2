import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

import {
  databases,
  NEXT_PUBLIC_DATABASE_ID,
  NEXT_PUBLIC_PATIENT_COLLECTION_ID,
} from "@/lib/appwrite.config";
import { localDemoStore } from "@/lib/demo/localDemoStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json(
      { error: "Invalid phone number" },
      { status: 400 }
    );
  }

  try {
    const response = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      [Query.equal("phone", phone)]
    );
    const exists = response.documents.length > 0;
    return NextResponse.json({ exists });
  } catch (error: any) {
    console.warn(
      `[LOCAL DEMO MODE] Appwrite checkPhone failed (${error?.code || error?.message}). Falling back to local demonstration store.`
    );
    const demoPatient = localDemoStore.getPatientByPhone(phone);
    return NextResponse.json({ exists: !!demoPatient });
  }
}
