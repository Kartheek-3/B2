import sys
from PIL import Image, ImageDraw, ImageFont

def render_architecture_diagram(output_path):
    width = 2400
    height = 1500
    img = Image.new("RGB", (width, height), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)

    # Fonts
    try:
        font_title = ImageFont.truetype("arial.ttf", 34)
        font_subtitle = ImageFont.truetype("arial.ttf", 18)
        font_header = ImageFont.truetype("arialbd.ttf", 20)
        font_bold = ImageFont.truetype("arialbd.ttf", 16)
        font_regular = ImageFont.truetype("arial.ttf", 14)
        font_small = ImageFont.truetype("arial.ttf", 12)
        font_mono = ImageFont.truetype("consola.ttf", 13)
    except Exception:
        font_title = font_subtitle = font_header = font_bold = font_regular = font_small = font_mono = ImageFont.load_default()

    # Title Banner
    draw.rectangle([0, 0, width, 90], fill=(15, 23, 42))
    draw.text((60, 18), "CarePulse Part 2: Software Evolution & Design Pattern Collaborations", fill=(255, 255, 255), font=font_title)
    draw.text((60, 58), "Demonstrating GoF Adapter (CH01), Strategy (CH02), and Observer (CH03) in Next.js FullStack Healthcare Architecture", fill=(148, 163, 184), font=font_subtitle)

    def draw_panel(box, title, subtitle, fill, stroke, header_color):
        x1, y1, x2, y2 = box
        draw.rounded_rectangle(box, radius=12, fill=fill, outline=stroke, width=2)
        draw.text((x1 + 18, y1 + 14), title, fill=header_color, font=font_header)
        if subtitle:
            draw.text((x1 + 18, y1 + 38), subtitle, fill=(100, 116, 139), font=font_small)

    def draw_card(box, title, lines, fill, stroke, title_color=(15, 23, 42)):
        draw.rounded_rectangle(box, radius=8, fill=fill, outline=stroke, width=1)
        x1, y1, x2, y2 = box
        draw.text((x1 + 14, y1 + 12), title, fill=title_color, font=font_bold)
        curr_y = y1 + 34
        for line in lines:
            draw.text((x1 + 14, curr_y), line, fill=(51, 65, 85), font=font_regular)
            curr_y += 18

    # 1. Presentation Layer Panel
    draw_panel((50, 110, 520, 1440), "PRESENTATION LAYER", "Next.js 14 App Router · Client UI & Endpoints", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card((75, 170, 495, 270), "AppointmentForm.tsx (Client Form)", [
        "• Handles create, schedule, cancel requests",
        "• Added isTeleconsultation checkbox toggle",
        "• Submits via Next.js Server Actions",
    ], (241, 245, 249), (148, 163, 184))

    draw_card((75, 290, 495, 390), "Success Confirmation Page", [
        "• app/.../new-appointment/success/page.tsx",
        "• Displays appointment confirmation & doctor",
        "• Displays video teleconsultation join room link",
    ], (239, 246, 255), (147, 197, 253), (30, 58, 138))

    draw_card((75, 410, 495, 510), "Admin Dashboard & Table", [
        "• components/table/columns.tsx",
        "• Triggers Schedule & Cancel Modals",
        "• Revalidates administrative cache",
    ], (241, 245, 249), (148, 163, 184))

    draw_card((75, 530, 495, 630), "POST /api/video/token", [
        "• Protected teleconsultation access endpoint",
        "• Verifies patient / doctor authorization",
        "• Mints temporary participant session tokens",
    ], (238, 242, 255), (165, 180, 252), (67, 56, 202))

    draw_card((75, 650, 495, 760), "POST /api/reminders/process", [
        "• Protected scheduled reminder processor",
        "• Requires 'x-scheduled-token' header auth",
        "• Evaluates due tasks & enforces idempotency",
    ], (254, 242, 242), (252, 165, 165), (153, 27, 27))

    # 2. Application Logic & Server Actions Panel
    draw_panel((550, 110, 1070, 1440), "APPLICATION LOGIC & SERVICES", "Domain services, Singletons & Factory schemas", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card((575, 170, 1045, 330), "lib/actions/appointment.actions.ts", [
        "• createAppointment():",
        "    - Validates doctor availability (CH02 Strategy)",
        "    - Creates meeting room if teleconsult (CH01 Adapter)",
        "    - Writes document to Appwrite Databases",
        "    - Publishes APPOINTMENT_SCHEDULED event (CH03)",
        "• updateAppointment():",
        "    - Dispatches APPOINTMENT_CANCELLED on cancel",
        "    - Preserves immediate SMS notification callback",
    ], (248, 250, 252), (100, 116, 139))

    draw_card((575, 350, 1045, 470), "lib/events/eventHub.ts (Event Backbone)", [
        "• Shared DomainEventBus singleton (Subject)",
        "• JsonFileReminderStore persistent store",
        "• ReminderProcessingEngine scheduler coordinator",
        "• AppwriteNotificationChannel multi-channel sink",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))

    draw_card((575, 490, 1045, 610), "appwrite.config.ts (Singleton - Preserved)", [
        "• Single module-scoped sdk.Client connection",
        "• Reused by Databases, Users, Messaging, Storage",
        "• Preserves baseline state without regressions",
    ], (240, 253, 244), (134, 239, 172), (22, 101, 52))

    draw_card((575, 630, 1045, 750), "validation.ts (Factory Method - Extended)", [
        "• getAppointmentSchema(type) parameterized factory",
        "• Dynamic schema: Create, Schedule, Cancel",
        "• Extended with optional isTeleconsultation flag",
    ], (240, 253, 244), (134, 239, 172), (22, 101, 52))

    # 3. CH01 Adapter Pattern Panel
    draw_panel((1100, 110, 1720, 750), "CH01: ADAPTER PATTERN", "Video consultation integration with local demonstration adaptee", (239, 246, 255), (147, 197, 253), (30, 58, 138))
    draw_card((1125, 170, 1400, 310), "<<Target Interface>>\nIVideoConsultationService", [
        "• createRoom(request): Promise",
        "• getRoomDetails(roomId): Promise",
        "• generateParticipantAccess(): Promise",
        "• getProviderName(): string",
    ], (255, 255, 255), (59, 130, 246), (29, 78, 216))

    draw_card((1430, 170, 1695, 310), "VideoServiceFactory", [
        "• Resolves active teleconsultation adapter",
        "• Defaults to LocalDemonstrationVideoAdapter",
        "• Allows runtime swapping of providers",
    ], (255, 255, 255), (59, 130, 246), (29, 78, 216))

    draw_card((1125, 340, 1400, 520), "<<Adapter>>\nLocalDemonstrationVideoAdapter", [
        "• Implements IVideoConsultationService",
        "• Translates domain requests into",
        "  proprietary session payloads",
        "• Maps doctor/patient roles into",
        "  clinician/client claims",
        "• Generates secure 1-hour access tokens",
    ], (219, 234, 254), (29, 78, 216), (30, 58, 138))

    draw_card((1430, 340, 1695, 520), "<<Adaptee>>\nLocalDemonstrationVideoProvider", [
        "• Proprietary mock video engine:",
        "  - initiateMeetingSession()",
        "  - querySession()",
        "  - mintJoinToken()",
        "• Explicitly labeled local demonstration",
        "• Zero external credential dependency",
        "• Deterministic offline testability",
    ], (254, 243, 199), (217, 119, 6), (146, 64, 14))

    # 4. CH02 Strategy Pattern Panel
    draw_panel((1100, 780, 1720, 1440), "CH02: STRATEGY PATTERN", "Flexible doctor availability rules with runtime interchangeability", (236, 253, 245), (110, 231, 183), (6, 95, 70))
    draw_card((1125, 840, 1400, 990), "<<Context>>\nDoctorAvailabilityContext", [
        "• Holds IAvailabilityStrategy reference",
        "• setStrategy(): runtime interchangeability",
        "• resolveStrategy(doctorConfig)",
        "• validateSlot(): checks conflicts & hours",
        "• Concurrency notice: TOCTOU race doc",
    ], (209, 250, 229), (5, 150, 105), (6, 95, 70))

    draw_card((1430, 840, 1695, 990), "<<Strategy Interface>>\nIAvailabilityStrategy", [
        "• validateSlot(request, config, bookings)",
        "• generateAvailableSlots(date, config)",
        "• getStrategyType(): StrategyType",
    ], (255, 255, 255), (16, 185, 129), (4, 120, 87))

    draw_card((1125, 1020, 1695, 1130), "Concrete Strategy 1: StandardBusinessHoursStrategy", [
        "• Outpatient practice: Monday through Friday (09:00 - 17:00)",
        "• Mandatory lunch break window: 12:00 - 13:00 (strictly unavailable)",
        "• Rejects weekend bookings & checks existing booking time collisions",
    ], (255, 255, 255), (16, 185, 129), (4, 120, 87))

    draw_card((1125, 1150, 1695, 1260), "Concrete Strategy 2: ShiftBasedAvailabilityStrategy", [
        "• Rotating shift rosters: Morning (07:00-15:00), Evening (15:00-23:00), Night",
        "• Rejects booking attempts on days without assigned shift duty",
        "• Rejects slots outside assigned active shift hours for that day",
    ], (255, 255, 255), (16, 185, 129), (4, 120, 87))

    draw_card((1125, 1280, 1695, 1400), "Concrete Strategy 3: EmergencyOnCallAvailabilityStrategy", [
        "• 24/7 continuous triage availability (weekends, holidays, night shifts)",
        "• Enforces mandatory 15-minute recovery buffer gap surrounding any booking",
        "• Strictly rejects slots encroaching inside the emergency buffer window",
    ], (255, 255, 255), (16, 185, 129), (4, 120, 87))

    # 5. CH03 Observer Pattern Panel
    draw_panel((1750, 110, 2350, 1440), "CH03: OBSERVER PATTERN & REMINDER ENGINE", "Domain event pub/sub, persistent store, and scheduled processing", (250, 245, 255), (216, 180, 254), (88, 28, 135))
    draw_card((1775, 170, 2325, 300), "<<Subject / Event Bus>>\nDomainEventBus", [
        "• subscribe(eventType, subscriber) / unsubscribe()",
        "• publish(DomainEvent): broadcasts events asynchronously",
        "• Decoupled domain events: APPOINTMENT_SCHEDULED, APPOINTMENT_CANCELLED, APPOINTMENT_RESCHEDULED",
    ], (243, 232, 255), (147, 51, 234), (88, 28, 135))

    draw_card((1775, 320, 2035, 460), "<<Observer 1>>\nReminderSchedulerObserver", [
        "• Subscribes: SCHEDULED & RESCHEDULED",
        "• Calculates T-24h and T-2h windows",
        "• Generates deterministic idempotency keys",
        "• Enqueues PENDING tasks to store",
    ], (255, 255, 255), (168, 85, 247), (107, 33, 168))

    draw_card((2065, 320, 2325, 460), "<<Observer 2>>\nReminderCancellationObserver", [
        "• Subscribes: APPOINTMENT_CANCELLED",
        "• Automatically revokes pending tasks",
        "• Transitions status to CANCELLED",
        "• Records cancellation reason",
    ], (255, 255, 255), (168, 85, 247), (107, 33, 168))

    draw_card((1775, 480, 2325, 570), "<<Observer 3>>\nAuditLogObserver", [
        "• Subscribes to ALL appointment lifecycle domain events",
        "• Captures chronological audit entries with timestamps and payloads",
    ], (255, 255, 255), (168, 85, 247), (107, 33, 168))

    draw_card((1775, 590, 2325, 740), "JsonFileReminderStore (Persistent File-Based Store)", [
        "• Persisted to disk (data/reminders_store.json) — not in-memory-only",
        "• Unique idempotency key: ${appointmentId}_${windowType}_${scheduleEpoch}",
        "• Duplicate prevention: never overwrites SENT task to PENDING",
        "• Queries due reminders where status === 'PENDING' && triggerAt <= T_now",
    ], (254, 242, 242), (239, 68, 68), (153, 27, 27))

    draw_card((1775, 760, 2325, 960), "ReminderProcessingEngine (Scheduled Sweeper)", [
        "• Evaluates due reminders against reference timestamp",
        "• Immediate state lock: transitions PENDING -> PROCESSING",
        "• Dispatches communications via notification channels",
        "• On Success: marks SENT and records processedAt timestamp",
        "• On Transient Error: increments retryCount up to maxRetries (3)",
        "• Duplicate prevention guarantee: second sweep sends 0 duplicates",
        "• Notice: At-least-once external delivery with application idempotency",
    ], (255, 251, 235), (245, 158, 11), (146, 64, 14))

    draw_card((1775, 980, 2325, 1100), "AppwriteNotificationChannel & Mock Sinks", [
        "• Dispatches SMS via Appwrite Messaging when configured",
        "• Local mock notification sink for reproducible offline testing",
        "• Emits teleconsultation join URLs in notification body",
    ], (248, 250, 252), (100, 116, 139), (30, 41, 59))

    draw_card((1775, 1130, 2325, 1400), "VERIFICATION & TEST RESULTS (Part2/code/tests)", [
        "• Master test suite: run_all_tests.ts (npm test)",
        "• 17 / 17 tests passed (0 failures):",
        "    - CH01 Adapter: 4 tests (translation, tokens, factory)",
        "    - CH02 Strategy: 6 tests (standard, shift, emergency, swap)",
        "    - CH03 Observer: 7 tests (pub/sub, 24h/2h, audit, retry, cancel)",
        "• TypeScript Audit: 0 errors in new code (3 pre-existing in baseline)",
        "• Next.js Production Build: Compiled and optimized successfully (11/11 pages)",
    ], (240, 253, 244), (34, 197, 94), (20, 83, 45))

    # Connective arrows
    def draw_arrow(p1, p2, color=(71, 85, 105), label=""):
        x1, y1 = p1
        x2, y2 = p2
        draw.line([p1, p2], fill=color, width=3)
        if label:
            mx = (x1 + x2) // 2
            my = (y1 + y2) // 2 - 12
            draw.text((mx, my), label, fill=color, font=font_small)

    draw_arrow((495, 220), (575, 220), (59, 130, 246), "submit")
    draw_arrow((1045, 240), (1125, 240), (37, 99, 235), "if teleconsult")
    draw_arrow((1400, 430), (1430, 430), (29, 78, 216), "adapts")
    draw_arrow((1045, 290), (1125, 890), (5, 150, 105), "validate slot")
    draw_arrow((1400, 915), (1430, 915), (5, 150, 105), "delegates")
    draw_arrow((1045, 270), (1775, 235), (147, 51, 234), "publish event")
    draw_arrow((1905, 300), (1905, 320), (147, 51, 234))
    draw_arrow((2195, 300), (2195, 320), (147, 51, 234))
    draw_arrow((1905, 460), (1905, 590), (239, 68, 68), "enqueue")
    draw_arrow((2050, 740), (2050, 760), (245, 158, 11), "process due")

    img.save(output_path, "PNG", quality=95)
    print(f"Diagram saved to {output_path}")

if __name__ == "__main__":
    out = "Part2/Diagrams/architecture_evolution.png"
    render_architecture_diagram(out)
