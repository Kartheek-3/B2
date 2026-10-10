import { NextRequest, NextResponse } from "next/server";

import { reminderEngine } from "@/lib/events/eventHub";

/**
 * Protected Automated Scheduled Reminders Processing Endpoint
 *
 * Security Requirement:
 * Requires authorization header 'x-scheduled-token' matching the configured secret
 * to prevent unauthorized trigger sweeps.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("x-scheduled-token");
  const expectedToken = process.env.SCHEDULED_TASK_SECRET || "carepulse_demo_cron_secret";

  if (authHeader !== expectedToken) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid x-scheduled-token authentication header." },
      { status: 401 }
    );
  }

  try {
    const referenceTime = new Date();
    const report = await reminderEngine.processDueReminders(referenceTime);

    return NextResponse.json({
      success: true,
      timestamp: referenceTime.toISOString(),
      report,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
