import { NextRequest, NextResponse } from "next/server";

import { VideoServiceFactory } from "@/lib/video";

/**
 * Protected Video Teleconsultation Access Minting Endpoint
 *
 * Security Requirement:
 * Verifies participant identity and role before generating meeting join credentials.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, userId, userName, role } = body;

    if (!roomId || !userId || !userName || !role) {
      return NextResponse.json(
        { error: "Bad Request: roomId, userId, userName, and role are required." },
        { status: 400 }
      );
    }

    if (role !== "doctor" && role !== "patient") {
      return NextResponse.json(
        { error: "Bad Request: role must be 'doctor' or 'patient'." },
        { status: 400 }
      );
    }

    const videoService = VideoServiceFactory.getVideoService();
    const access = await videoService.generateParticipantAccess(roomId, {
      userId,
      name: userName,
      role,
    });

    return NextResponse.json({
      success: true,
      provider: videoService.getProviderName(),
      access: {
        ...access,
        provider: videoService.getProviderName(),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
