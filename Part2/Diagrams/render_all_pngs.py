import os
from PIL import Image, ImageDraw, ImageFont

def get_fonts():
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 32)
        font_subtitle = ImageFont.truetype("arial.ttf", 16)
        font_header = ImageFont.truetype("arialbd.ttf", 20)
        font_subheader = ImageFont.truetype("arialbd.ttf", 16)
        font_bold = ImageFont.truetype("arialbd.ttf", 14)
        font_regular = ImageFont.truetype("arial.ttf", 13)
        font_small = ImageFont.truetype("arial.ttf", 11)
        font_mono = ImageFont.truetype("consola.ttf", 12)
        font_mono_bold = ImageFont.truetype("consolab.ttf", 12)
    except Exception:
        font_title = font_subtitle = font_header = font_subheader = font_bold = font_regular = font_small = font_mono = font_mono_bold = ImageFont.load_default()
    return {
        "title": font_title,
        "subtitle": font_subtitle,
        "header": font_header,
        "subheader": font_subheader,
        "bold": font_bold,
        "regular": font_regular,
        "small": font_small,
        "mono": font_mono,
        "mono_bold": font_mono_bold,
    }

def draw_panel(draw, fonts, box, title, subtitle, fill, stroke, header_color):
    draw.rounded_rectangle(box, radius=12, fill=fill, outline=stroke, width=2)
    x1, y1, x2, y2 = box
    draw.text((x1 + 18, y1 + 14), title, fill=header_color, font=fonts["header"])
    if subtitle:
        draw.text((x1 + 18, y1 + 38), subtitle, fill=(100, 116, 139), font=fonts["small"])

def draw_card(draw, fonts, box, title, lines, fill, stroke, title_color=(15, 23, 42)):
    draw.rounded_rectangle(box, radius=8, fill=fill, outline=stroke, width=1)
    x1, y1, x2, y2 = box
    draw.text((x1 + 14, y1 + 12), title, fill=title_color, font=fonts["bold"])
    curr_y = y1 + 32
    for line in lines:
        draw.text((x1 + 14, curr_y), line, fill=(51, 65, 85), font=fonts["regular"])
        curr_y += 18

def draw_uml_class(draw, fonts, box, stereotype, class_name, file_path, attributes, methods, fill, stroke, header_fill):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=8, fill=fill, outline=stroke, width=2)
    
    # Header compartment
    header_height = 54 if file_path else 44
    draw.rounded_rectangle((x1, y1, x2, y1 + header_height), radius=8, fill=header_fill, outline=stroke, width=1)
    draw.rectangle((x1, y1 + header_height - 6, x2, y1 + header_height), fill=header_fill) # square bottom corners
    draw.line((x1, y1 + header_height, x2, y1 + header_height), fill=stroke, width=2)
    
    if stereotype:
        draw.text((x1 + 14, y1 + 6), stereotype, fill=(71, 85, 105), font=fonts["small"])
        draw.text((x1 + 14, y1 + 22), class_name, fill=(15, 23, 42), font=fonts["subheader"])
    else:
        draw.text((x1 + 14, y1 + 10), class_name, fill=(15, 23, 42), font=fonts["subheader"])
        
    if file_path:
        draw.text((x1 + 14, y1 + 38), file_path, fill=(100, 116, 139), font=fonts["small"])
        
    curr_y = y1 + header_height + 10
    
    # Attributes compartment
    if attributes is not None:
        for attr in attributes:
            draw.text((x1 + 14, curr_y), attr, fill=(30, 41, 59), font=fonts["mono"])
            curr_y += 17
        draw.line((x1, curr_y + 4, x2, curr_y + 4), fill=stroke, width=1)
        curr_y += 12
        
    # Methods compartment
    for method in methods:
        draw.text((x1 + 14, curr_y), method, fill=(30, 41, 59), font=fonts["mono"])
        curr_y += 17

# ==============================================================================
# DIAGRAM A: SYSTEM ARCHITECTURE
# ==============================================================================
def render_system_architecture(output_path):
    width, height = 2400, 1600
    img = Image.new("RGB", (width, height), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)
    fonts = get_fonts()

    # Title Banner
    draw.rectangle([0, 0, width, 90], fill=(15, 23, 42))
    draw.text((60, 18), "CarePulse Part 2: Complete System Architecture & Design Pattern Evolution", fill=(255, 255, 255), font=fonts["title"])
    draw.text((60, 58), "Demonstrating GoF Adapter (CH01), Strategy (CH02), and Observer (CH03) in Next.js FullStack Healthcare Architecture", fill=(148, 163, 184), font=fonts["subtitle"])

    # 1. Presentation Layer Panel
    draw_panel(draw, fonts, (50, 110, 490, 1260), "1. PRESENTATION LAYER", "Next.js 14 App Router · Client UI & Endpoints", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (75, 170, 465, 270), "AppointmentForm.tsx (Client Form)", [
        "• Handles create, schedule, cancel requests",
        "• Added isTeleconsultation checkbox toggle",
        "• Submits via Next.js Server Actions",
    ], (241, 245, 249), (148, 163, 184))
    draw_card(draw, fonts, (75, 290, 465, 390), "Success Confirmation Page", [
        "• app/.../new-appointment/success/page.tsx",
        "• Displays appointment confirmation & doctor",
        "• Displays video teleconsultation join room link",
    ], (239, 246, 255), (147, 197, 253), (30, 58, 138))
    draw_card(draw, fonts, (75, 410, 465, 510), "Admin Dashboard & Table", [
        "• app/admin/page.tsx & columns.tsx",
        "• Triggers Schedule & Cancel Modals",
        "• Revalidates administrative cache",
    ], (241, 245, 249), (148, 163, 184))
    draw_card(draw, fonts, (75, 530, 465, 630), "POST /api/video/token", [
        "• Protected teleconsultation access endpoint",
        "• Verifies patient / doctor authorization",
        "• Mints temporary participant session tokens",
    ], (238, 242, 255), (165, 180, 252), (67, 56, 202))
    draw_card(draw, fonts, (75, 650, 465, 760), "POST /api/reminders/process", [
        "• Protected scheduled reminder processor",
        "• Requires 'x-scheduled-token' header auth",
        "• Evaluates due tasks & enforces idempotency",
    ], (254, 242, 242), (252, 165, 165), (153, 27, 27))
    draw_card(draw, fonts, (75, 780, 465, 870), "Utility Routes", [
        "• /api/checkEmail, /api/checkPhone",
        "• /api/patients/[id] lookup endpoint",
    ], (255, 255, 255), (203, 213, 225))

    # 2. Application Layer Panel
    draw_panel(draw, fonts, (510, 110, 990, 1260), "2. APPLICATION LAYER", "Domain services, Singletons & Factory schemas", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (535, 170, 965, 360), "lib/actions/appointment.actions.ts", [
        "• createAppointment():",
        "    - Validates doctor availability (CH02 Strategy)",
        "    - Creates meeting room if teleconsult (CH01 Adapter)",
        "    - Writes document to Appwrite Databases",
        "    - Publishes APPOINTMENT_SCHEDULED event (CH03)",
        "• updateAppointment():",
        "    - Dispatches APPOINTMENT_CANCELLED on cancel",
        "    - Preserves immediate SMS notification callback",
        "• getRecentAppointmentList() & getAppointment()",
    ], (248, 250, 252), (100, 116, 139))
    draw_card(draw, fonts, (535, 380, 965, 500), "lib/events/eventHub.ts (Event Backbone)", [
        "• Shared DomainEventBus singleton (Subject)",
        "• JsonFileReminderStore persistent store",
        "• ReminderProcessingEngine scheduler coordinator",
        "• AppwriteNotificationChannel multi-channel sink",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))
    draw_card(draw, fonts, (535, 520, 965, 630), "appwrite.config.ts (Singleton - Preserved)", [
        "• Single module-scoped sdk.Client connection",
        "• Reused by Databases, Users, Messaging, Storage",
        "• Preserves baseline state without regressions",
    ], (240, 253, 244), (134, 239, 172), (22, 101, 52))
    draw_card(draw, fonts, (535, 650, 965, 760), "validation.ts (Factory Method - Extended)", [
        "• getAppointmentSchema(type) parameterized factory",
        "• Dynamic schema: Create, Schedule, Cancel",
        "• Extended with optional isTeleconsultation flag",
    ], (240, 253, 244), (134, 239, 172), (22, 101, 52))

    # 3. Design Patterns Layer Panel
    draw_panel(draw, fonts, (1010, 110, 1810, 1260), "3. DESIGN PATTERN EVOLUTION LAYER", "Source-verified GoF Adapter (CH01), Strategy (CH02), and Observer (CH03)", (248, 250, 252), (203, 213, 225), (30, 41, 59))
    
    # CH01 Sub-panel
    draw.rounded_rectangle((1030, 160, 1790, 480), radius=10, fill=(239, 246, 255), outline=(59, 130, 246), width=2)
    draw.text((1050, 175), "CH01: ADAPTER PATTERN (Video Consultation)", fill=(30, 58, 138), font=fonts["subheader"])
    draw_card(draw, fonts, (1050, 210, 1380, 340), "<<Target Interface>>\nIVideoConsultationService", [
        "• createRoom(request): Promise",
        "• getRoomDetails(roomId): Promise",
        "• generateParticipantAccess(): Promise",
        "• getProviderName(): string",
    ], (255, 255, 255), (59, 130, 246), (29, 78, 216))
    draw_card(draw, fonts, (1410, 210, 1770, 340), "VideoServiceFactory", [
        "• Supplies configured video adapter",
        "• Defaults to LocalDemonstrationVideoAdapter",
        "• Enables zero-leakage polymorphic access",
    ], (255, 255, 255), (59, 130, 246), (29, 78, 216))
    draw_card(draw, fonts, (1050, 360, 1770, 460), "<<Adapter>> LocalDemonstrationVideoAdapter", [
        "• Implements IVideoConsultationService & encapsulates proprietary adaptee",
        "• Translates domain models to proprietary session payloads & ISO dates to epoch",
        "• Maps doctor/patient roles into clinician/client claims with 1-hr access tokens",
    ], (219, 234, 254), (29, 78, 216), (30, 58, 138))

    # CH02 Sub-panel
    draw.rounded_rectangle((1030, 500, 1790, 830), radius=10, fill=(236, 253, 245), outline=(16, 185, 129), width=2)
    draw.text((1050, 515), "CH02: STRATEGY PATTERN (Doctor Availability Rules)", fill=(6, 95, 70), font=fonts["subheader"])
    draw_card(draw, fonts, (1050, 550, 1380, 680), "<<Context>>\nDoctorAvailabilityContext", [
        "• Holds IAvailabilityStrategy reference",
        "• setStrategy(): runtime interchangeability",
        "• resolveStrategy(doctorConfig)",
        "• validateSlot() & generateAvailableSlots()",
    ], (209, 250, 229), (5, 150, 105), (6, 95, 70))
    draw_card(draw, fonts, (1410, 550, 1770, 680), "<<Strategy Interface>>\nIAvailabilityStrategy", [
        "• validateSlot(req, cfg, bookings)",
        "• generateAvailableSlots(date, cfg)",
        "• getStrategyType(): StrategyType",
    ], (255, 255, 255), (16, 185, 129), (4, 120, 87))
    draw_card(draw, fonts, (1050, 700, 1770, 810), "Three Interchangeable Concrete Strategies", [
        "1. StandardBusinessHoursStrategy: Mon-Fri 09:00-17:00, lunch blackout (12-13), conflict check",
        "2. ShiftBasedAvailabilityStrategy: Roster shifts (Morning 07-15, Evening 15-23, Night), off-duty rejection",
        "3. EmergencyOnCallAvailabilityStrategy: 24/7 continuous triage with mandatory 15-min recovery buffer",
    ], (255, 255, 255), (16, 185, 129), (4, 120, 87))

    # CH03 Sub-panel
    draw.rounded_rectangle((1030, 850, 1790, 1240), radius=10, fill=(255, 247, 237), outline=(249, 115, 22), width=2)
    draw.text((1050, 865), "CH03: OBSERVER PATTERN & REMINDER ENGINE", fill=(154, 52, 18), font=fonts["subheader"])
    draw_card(draw, fonts, (1050, 900, 1380, 1010), "<<Subject / Event Bus>>\nDomainEventBus", [
        "• subscribe() & unsubscribe()",
        "• publish(DomainEvent) async",
        "• Decoupled lifecycle event broadcast",
    ], (254, 237, 213), (234, 88, 12), (154, 52, 18))
    draw_card(draw, fonts, (1410, 900, 1770, 1010), "<<Observer>> Specialized Subscribers", [
        "• ReminderSchedulerObserver (24h/2h tasks)",
        "• ReminderCancellationObserver (revocation)",
        "• AuditLogObserver (chronological trail)",
    ], (255, 255, 255), (249, 115, 22), (154, 52, 18))
    draw_card(draw, fonts, (1050, 1030, 1770, 1140), "ReminderProcessingEngine (Scheduled Sweeper)", [
        "• processDueReminders(referenceTime): sweeps records where triggerAt <= T_now",
        "• Idempotent state transitions: PENDING -> PROCESSING -> SENT",
        "• Retry policy on failure with maxRetries limit (3 attempts)",
    ], (255, 251, 235), (217, 119, 6), (146, 64, 14))
    draw_card(draw, fonts, (1050, 1160, 1770, 1220), "Domain Events: APPOINTMENT_SCHEDULED · RESCHEDULED · CANCELLED", [
        "Carries appointmentId, scheduleDate, doctorName, patientName, teleconsultation details",
    ], (255, 255, 255), (249, 115, 22), (154, 52, 18))

    # 4. Infrastructure Layer Panel
    draw_panel(draw, fonts, (1830, 110, 2350, 1260), "4. INFRASTRUCTURE & PERSISTENCE", "Appwrite Cloud / Local disk storage", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (1855, 170, 2325, 280), "Appwrite Databases", [
        "• Appointment collection documents",
        "• Patient profile records",
        "• Document queries & mutations",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))
    draw_card(draw, fonts, (1855, 300, 2325, 390), "Appwrite Users & Auth", [
        "• Patient user accounts & phone auth",
        "• Admin passkey authentication",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))
    draw_card(draw, fonts, (1855, 410, 2325, 500), "Appwrite Messaging", [
        "• Direct provider telephony delivery",
        "• Preserved for baseline SMS callbacks",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))
    draw_card(draw, fonts, (1855, 520, 2325, 610), "Appwrite Storage (Buckets)", [
        "• Patient ID verification files",
        "• Medical document uploads",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))
    draw_card(draw, fonts, (1855, 630, 2325, 780), "JsonFileReminderStore (Disk)", [
        "• IReminderStore implementation",
        "• Persists to data/reminders_store.json",
        "• Deterministic idempotency keys:",
        "  ${aptId}_${win}_${scheduleEpoch}",
        "• Atomic status transition & cancellation",
    ], (254, 242, 242), (248, 113, 113), (153, 27, 27))

    # 5. External / Execution Layer Panel
    draw_panel(draw, fonts, (50, 1280, 2350, 1570), "5. EXTERNAL SYSTEMS & EXECUTION ENVIRONMENT", "Mock Demonstration, External Cron Scheduling & Delivery Guarantees", (241, 245, 249), (148, 163, 184), (15, 23, 42))
    draw_card(draw, fonts, (75, 1340, 780, 1540), "<<Adaptee>> LocalDemonstrationVideoProvider [MOCK DEMONSTRATION]", [
        "• Proprietary mock engine: initiateMeetingSession(), querySession(), mintJoinToken()",
        "• Mints signed JWT demonstration tokens & simulated room URLs",
        "• ACADEMIC DISCLOSURE: Offline reproducible demonstration engine;",
        "  does NOT connect to live WebRTC media servers or external paid APIs (Zoom / Twilio / Daily.co).",
    ], (254, 243, 199), (217, 119, 6), (146, 64, 14))
    draw_card(draw, fonts, (810, 1340, 1540, 1540), "External Scheduler Trigger [RECURRING CRON / HTTP TRIGGER]", [
        "• Invokes POST /api/reminders/process passing 'x-scheduled-token' authentication header",
        "• Triggered by Linux Cron, AWS EventBridge, Vercel Cron, or CI test runners",
        "• OPERATIONAL DISCLOSURE: Next.js serverless runtimes do NOT execute perpetual background daemons;",
        "  the reminder processing engine executes strictly upon on-demand HTTP invocation.",
    ], (254, 242, 242), (239, 68, 68), (153, 27, 27))
    draw_card(draw, fonts, (1570, 1340, 2325, 1540), "External Telephony & Notification Sink [AT-LEAST-ONCE DELIVERY]", [
        "• Twilio SMS Gateway / Local Log Sink (AppwriteNotificationChannel)",
        "• External telecom channels do not participate in distributed 2-phase database transactions",
        "• Guarantees At-Least-Once delivery with application idempotency keys preventing duplicate alerts.",
    ], (255, 255, 255), (148, 163, 184), (15, 23, 42))

    img.save(output_path, "PNG")
    print(f"Rendered: {output_path} ({width}x{height})")

# ==============================================================================
# DIAGRAM B: CH01 ADAPTER UML CLASS DIAGRAM
# ==============================================================================
def render_ch01_adapter_uml(output_path):
    width, height = 2200, 1400
    img = Image.new("RGB", (width, height), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)
    fonts = get_fonts()

    # Title Banner
    draw.rectangle([0, 0, width, 90], fill=(15, 23, 42))
    draw.text((60, 18), "CH01: Video Consultation Adapter Pattern — UML Class Diagram", fill=(255, 255, 255), font=fonts["title"])
    draw.text((60, 58), "Target Interface, Concrete Adapter, Adaptee (Local Demonstration Mock), Client & Factory", fill=(148, 163, 184), font=fonts["subtitle"])

    # Client
    draw_uml_class(draw, fonts, (60, 130, 520, 290), "", "Client: Appointment Actions & API", "Part2/code/lib/actions/appointment.actions.ts", None, [
        "+ createAppointment(appointment): Promise<Appointment>",
        "+ updateAppointment(params): Promise<Appointment>",
        "+ POST /api/video/token(request): Promise<NextResponse>",
    ], (255, 255, 255), (71, 85, 105), (241, 245, 249))

    # Factory
    draw_uml_class(draw, fonts, (60, 360, 520, 480), "", "VideoServiceFactory", "Part2/code/lib/video/VideoServiceFactory.ts", None, [
        "+ static getVideoService(): IVideoConsultationService",
        "+ static createService(): IVideoConsultationService",
    ], (255, 255, 255), (37, 99, 235), (239, 246, 255))

    # Target Interface
    draw_uml_class(draw, fonts, (620, 130, 1260, 330), "<<interface>>", "IVideoConsultationService (Target)", "Part2/code/lib/video/IVideoConsultationService.ts", None, [
        "+ createRoom(request: VideoRoomRequest): Promise<VideoRoomDetails>",
        "+ getRoomDetails(roomId: string): Promise<VideoRoomDetails | null>",
        "+ generateParticipantAccess(roomId: string, participant: VideoParticipant): Promise<VideoSessionAccess>",
        "+ getProviderName(): string",
    ], (255, 255, 255), (37, 99, 235), (239, 246, 255))

    # Concrete Adapter
    draw_uml_class(draw, fonts, (620, 390, 1260, 670), "", "LocalDemonstrationVideoAdapter (Adapter)", "Part2/code/lib/video/LocalDemonstrationVideoAdapter.ts", [
        "- adaptee: LocalDemonstrationVideoProvider",
    ], [
        "+ constructor(adaptee?: LocalDemonstrationVideoProvider)",
        "+ createRoom(request: VideoRoomRequest): Promise<VideoRoomDetails>",
        "+ getRoomDetails(roomId: string): Promise<VideoRoomDetails | null>",
        "+ generateParticipantAccess(roomId: string, participant: VideoParticipant): Promise<VideoSessionAccess>",
        "+ getProviderName(): string",
        "",
        "// Data Transformations & Role Mapping:",
        "// 1. Converts ISO Date -> epoch milliseconds (startTimestampEpoch)",
        "// 2. Maps doctorName -> hostIdentifier, patientName -> guestIdentifier",
        "// 3. Translates domain roles: 'doctor' -> 'clinician', 'patient' -> 'client'",
    ], (239, 246, 255), (29, 78, 216), (219, 234, 254))

    # Adaptee
    draw_uml_class(draw, fonts, (1360, 390, 2120, 670), "<<adaptee>>", "LocalDemonstrationVideoProvider [LOCAL DEMONSTRATION MOCK]", "Part2/code/lib/video/LocalDemonstrationVideoProvider.ts", [
        "- activeSessions: Map<string, ProprietarySessionResponse['data']>",
    ], [
        "+ initiateMeetingSession(payload: ProprietarySessionPayload): Promise<ProprietarySessionResponse>",
        "+ querySession(sessionId: string): Promise<ProprietarySessionResponse['data'] | null>",
        "+ mintJoinToken(sessionId: string, proprietaryRole: string, clientTag: string): Promise<ProprietaryTokenResponse>",
        "+ terminateSession(sessionId: string): Promise<boolean>",
        "",
        "// Academic & Functional Disclosure:",
        "// Simulates teleconsultation session URLs & JWT token minting offline.",
        "// Zero external credentials required; does NOT stream WebRTC audio/video.",
    ], (254, 243, 199), (217, 119, 6), (254, 235, 179))

    # DTO Panel
    draw_panel(draw, fonts, (60, 730, 2120, 1340), "DATA TRANSFER OBJECTS & PROPRIETARY ENVELOPES", "Part2/code/lib/video/types.ts", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (90, 790, 470, 990), "VideoRoomRequest", [
        "+ appointmentId: string",
        "+ doctorName: string",
        "+ patientName: string",
        "+ scheduledTime: Date",
        "+ topic?: string",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (500, 790, 920, 990), "VideoRoomDetails", [
        "+ roomId: string",
        "+ roomUrl: string",
        "+ provider: string",
        "+ createdAt: Date",
        "+ scheduledTime: Date",
        "+ doctorName: string",
        "+ patientName: string",
        "+ status: string",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (950, 790, 1420, 990), "VideoSessionAccess & Participant", [
        "+ roomId: string",
        "+ joinUrl: string",
        "+ accessToken: string",
        "+ expiresAt: Date",
        "+ participant: VideoParticipant",
        "    userId: string",
        "    name: string",
        "    role: 'doctor' | 'patient'",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (1450, 790, 2090, 990), "ProprietarySessionPayload & Response", [
        "ProprietarySessionPayload:",
        "  sessionTag: string, startTimestampEpoch: number",
        "  hostIdentifier: string, guestIdentifier: string",
        "ProprietarySessionResponse:",
        "  statusCode: number, data: { sessionId, rawEndpointUrl, ... }",
        "ProprietaryTokenResponse:",
        "  tokenData: { jwtStub, accessLink, validUntilEpoch }",
    ], (254, 243, 199), (217, 119, 6), (146, 64, 14))

    # Notes & Guarantees
    draw_card(draw, fonts, (90, 1030, 2090, 1300), "DESIGN PATTERN COLLABORATION SUMMARY & ARCHITECTURAL BENEFITS", [
        "1. Open-Closed Principle (OCP): New video providers (e.g., DailyVideoAdapter, ZoomVideoAdapter) can be plugged in without changing appointment.actions.ts.",
        "2. Liskov Substitution Principle (LSP): Any adapter implementing IVideoConsultationService can be supplied transparently by VideoServiceFactory.",
        "3. Dependency Inversion Principle (DIP): Core scheduling domain logic depends upon the IVideoConsultationService abstraction, not vendor SDKs.",
        "4. Mock Demonstration Integrity: LocalDemonstrationVideoProvider guarantees 100% offline reproducible test execution with zero external vendor API keys.",
    ], (239, 246, 255), (59, 130, 246), (30, 58, 138))

    img.save(output_path, "PNG")
    print(f"Rendered: {output_path} ({width}x{height})")

# ==============================================================================
# DIAGRAM C: CH02 STRATEGY UML CLASS DIAGRAM
# ==============================================================================
def render_ch02_strategy_uml(output_path):
    width, height = 2200, 1400
    img = Image.new("RGB", (width, height), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)
    fonts = get_fonts()

    # Title Banner
    draw.rectangle([0, 0, width, 90], fill=(15, 23, 42))
    draw.text((60, 18), "CH02: Flexible Doctor Availability Strategy Pattern — UML Class Diagram", fill=(255, 255, 255), font=fonts["title"])
    draw.text((60, 58), "Strategy Interface, Three Concrete Strategies, Context, Dynamic Selection & Client", fill=(148, 163, 184), font=fonts["subtitle"])

    # Client
    draw_uml_class(draw, fonts, (60, 130, 580, 280), "", "Client: Appointment Server Actions", "Part2/code/lib/actions/appointment.actions.ts", None, [
        "+ createAppointment(appointment): Promise<Appointment>",
        "",
        "// Flow: Queries doctor config from DoctorAvailabilityConfigs",
        "// -> Calls DoctorAvailabilityContext.resolveStrategy(config)",
        "// -> Instantiates Context & calls context.validateSlot()",
    ], (255, 255, 255), (71, 85, 105), (241, 245, 249))

    # Context
    draw_uml_class(draw, fonts, (60, 320, 680, 620), "", "DoctorAvailabilityContext (Context)", "Part2/code/lib/availability/DoctorAvailabilityContext.ts", [
        "- strategy: IAvailabilityStrategy",
    ], [
        "+ constructor(initialStrategy?: IAvailabilityStrategy)",
        "+ setStrategy(strategy: IAvailabilityStrategy): void",
        "+ getStrategy(): IAvailabilityStrategy",
        "+ static resolveStrategy(config: DoctorAvailabilityConfig): IAvailabilityStrategy",
        "+ validateSlot(request, config, existingBookings): SlotValidationResult",
        "+ generateAvailableSlots(date, config, existingBookings): Date[]",
        "",
        "// Runtime Swapping:",
        "// Swaps availability evaluation logic per physician, operational mode,",
        "// or emergency triage status without modifying calling server actions.",
    ], (209, 250, 229), (5, 150, 105), (167, 243, 208))

    # Strategy Interface
    draw_uml_class(draw, fonts, (820, 130, 1580, 320), "<<interface>>", "IAvailabilityStrategy (Strategy)", "Part2/code/lib/availability/IAvailabilityStrategy.ts", None, [
        "+ validateSlot(request: SlotValidationRequest, config: DoctorAvailabilityConfig, existingBookings: ExistingBooking[]): SlotValidationResult",
        "+ generateAvailableSlots(date: Date, config: DoctorAvailabilityConfig, existingBookings: ExistingBooking[]): Date[]",
        "+ getStrategyType(): StrategyType",
    ], (255, 255, 255), (16, 185, 129), (209, 250, 229))

    # Concrete Strategies
    draw_uml_class(draw, fonts, (740, 360, 1170, 640), "", "StandardBusinessHoursStrategy", "Part2/code/lib/availability/StandardBusinessHoursStrategy.ts", [
        "- startHour: number = 9",
        "- endHour: number = 17",
        "- lunchStart: number = 12",
        "- lunchEnd: number = 13",
    ], [
        "+ validateSlot(...): SlotValidationResult",
        "+ generateAvailableSlots(...): Date[]",
        "+ getStrategyType(): 'STANDARD_BUSINESS_HOURS'",
        "",
        "// Clinical Rules:",
        "// • Outpatient Mon-Fri 09:00-17:00",
        "// • Lunch blackout: 12:00-13:00 unavailable",
        "// • Rejects weekends & overlapping bookings",
    ], (255, 255, 255), (16, 185, 129), (236, 253, 245))

    draw_uml_class(draw, fonts, (1210, 360, 1660, 640), "", "ShiftBasedAvailabilityStrategy", "Part2/code/lib/availability/ShiftBasedAvailabilityStrategy.ts", [
        "- defaultShifts: DoctorShift[]",
    ], [
        "+ validateSlot(...): SlotValidationResult",
        "+ generateAvailableSlots(...): Date[]",
        "+ getStrategyType(): 'SHIFT_BASED'",
        "",
        "// Clinical Rules:",
        "// • Enforces doctor assigned shift duty",
        "// • Morning (07-15), Evening (15-23), Night",
        "// • Rejects off-duty days & out-of-shift hours",
    ], (255, 255, 255), (16, 185, 129), (236, 253, 245))

    draw_uml_class(draw, fonts, (1700, 360, 2140, 640), "", "EmergencyOnCallAvailabilityStrategy", "Part2/code/lib/availability/EmergencyOnCallAvailabilityStrategy.ts", [
        "- defaultBufferMinutes: number = 15",
    ], [
        "+ validateSlot(...): SlotValidationResult",
        "+ generateAvailableSlots(...): Date[]",
        "+ getStrategyType(): 'EMERGENCY_ON_CALL'",
        "",
        "// Clinical Rules:",
        "// • 24/7 continuous triage availability",
        "// • Permits late-night & weekend emergency slots",
        "// • Enforces mandatory 15-min recovery buffer",
    ], (255, 255, 255), (16, 185, 129), (236, 253, 245))

    # Types Panel
    draw_panel(draw, fonts, (60, 670, 2140, 1350), "TYPES, ROSTER CONFIGURATIONS & CONCURRENCY LIMITATIONS", "Part2/code/lib/availability/types.ts & constants/index.ts", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (90, 730, 550, 940), "SlotValidationRequest & Result", [
        "SlotValidationRequest:",
        "  doctorName: string, requestedTime: Date",
        "  durationMinutes: number, isEmergency?: boolean",
        "SlotValidationResult:",
        "  isValid: boolean, reason?: string",
        "  conflictingBooking?: ExistingBooking",
        "  evaluatedStrategy: StrategyType",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (580, 730, 1100, 940), "DoctorAvailabilityConfig", [
        "doctorName: string",
        "strategyType: StrategyType ('STANDARD_BUSINESS_HOURS' | 'SHIFT_BASED' | 'EMERGENCY_ON_CALL')",
        "assignedShifts?: DoctorShift[] (dayOfWeek, shiftStartHour, shiftEndHour)",
        "emergencyBufferMinutes?: number (default 15)",
        "slotDurationMinutes?: number (default 30)",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (1130, 730, 2110, 940), "DoctorAvailabilityConfigs Registry (constants/index.ts)", [
        "• Dr. John Green, Dr. David Livingston, Dr. Jane Powell, Dr. Jasmine Lee, Dr. Hardik Sharma -> STANDARD_BUSINESS_HOURS",
        "• Dr. Leila Cameron -> SHIFT_BASED (Mon/Wed Morning 07:00-15:00, Fri Evening 15:00-23:00, 45-min slots)",
        "• Dr. Alex Ramirez -> SHIFT_BASED (Tue/Thu Morning 08:00-16:00, 30-min slots)",
        "• Dr. Evan Peter -> EMERGENCY_ON_CALL (24/7 triage, 15-min recovery buffer, 20-min slot duration)",
        "• Dr. Alyana Cruz -> EMERGENCY_ON_CALL (24/7 triage, 20-min recovery buffer, 30-min slot duration)",
    ], (236, 253, 245), (16, 185, 129), (6, 95, 70))

    draw_card(draw, fonts, (90, 970, 2110, 1310), "CONCURRENCY LIMITATION NOTICE — TIME-OF-CHECK TO TIME-OF-USE (TOCTOU) RACE CONDITION", [
        "1. Application-Level Validation: The Strategy pattern validates availability in application memory prior to committing records.",
        "2. Concurrency Race Condition: In high-concurrency environments, two simultaneous booking requests for the exact same physician and time slot",
        "   may both evaluate as valid in memory before the first record is committed to the database (TOCTOU race).",
        "3. Architectural Guarantees: Because Appwrite document mutations do not support distributed two-phase commit transactions or pessimistic row locks,",
        "   production systems require pairing this Strategy validation with database unique compound indexes on [doctorId, scheduleTimestamp]",
        "   or optimistic version matching ($updatedAt matching) to strictly prevent concurrent double bookings.",
    ], (254, 242, 242), (239, 68, 68), (153, 27, 27))

    img.save(output_path, "PNG")
    print(f"Rendered: {output_path} ({width}x{height})")

# ==============================================================================
# DIAGRAM D: CH03 OBSERVER UML & EVENT FLOW DIAGRAM
# ==============================================================================
def render_ch03_observer_uml(output_path):
    width, height = 2400, 1600
    img = Image.new("RGB", (width, height), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)
    fonts = get_fonts()

    # Title Banner
    draw.rectangle([0, 0, width, 90], fill=(15, 23, 42))
    draw.text((60, 18), "CH03: Automated Appointment Reminders — Observer Pattern & Event Flow", fill=(255, 255, 255), font=fonts["title"])
    draw.text((60, 58), "DomainEventBus (Subject), Subscribers, Persistent Store, Scheduled Engine & Chronological Sequence", fill=(148, 163, 184), font=fonts["subtitle"])

    # Section A Header
    draw.rectangle([60, 110, width - 60, 145], fill=(241, 245, 249))
    draw.text((80, 118), "PART A: OBSERVER PATTERN CLASS STRUCTURE & OBJECT ROLES", fill=(15, 23, 42), font=fonts["subheader"])

    # Subject
    draw_uml_class(draw, fonts, (60, 160, 520, 360), "", "DomainEventBus (Subject)", "Part2/code/lib/events/DomainEventBus.ts", [
        "- subscribers: Map<string, Set<IDomainEventSubscriber>>",
    ], [
        "+ subscribe<T>(eventType: string, subscriber: IDomainEventSubscriber<T>): void",
        "+ unsubscribe<T>(eventType: string, subscriber: IDomainEventSubscriber<T>): void",
        "+ publish<T>(event: T): Promise<void>",
        "+ clearSubscribers(): void",
        "",
        "// Broadcasts lifecycle domain events asynchronously to registered observers.",
    ], (255, 247, 237), (249, 115, 22), (254, 237, 213))

    # Observer Interface
    draw_uml_class(draw, fonts, (560, 160, 1100, 280), "<<interface>>", "IDomainEventSubscriber<T extends DomainEvent>", "Part2/code/lib/events/types.ts", None, [
        "+ onEvent(event: T): Promise<void>",
        "+ getSubscriberName(): string",
    ], (255, 255, 255), (249, 115, 22), (255, 247, 237))

    # Concrete Observers
    draw_uml_class(draw, fonts, (560, 310, 1020, 510), "", "ReminderSchedulerObserver", "Part2/code/lib/events/subscribers/ReminderSchedulerObserver.ts", [
        "- store: IReminderStore",
    ], [
        "+ onEvent(event: AppointmentScheduledEvent): Promise<void>",
        "+ getSubscriberName(): 'ReminderSchedulerObserver'",
        "",
        "// • Calculates T-24h & T-2h reminder windows",
        "// • Mints deterministic idempotency key: ${aptId}_${win}_${epoch}",
        "// • Enqueues PENDING reminder tasks to store",
    ], (255, 255, 255), (249, 115, 22), (255, 247, 237))

    draw_uml_class(draw, fonts, (1050, 310, 1490, 510), "", "ReminderCancellationObserver", "Part2/code/lib/events/subscribers/ReminderCancellationObserver.ts", [
        "- store: IReminderStore",
    ], [
        "+ onEvent(event: AppointmentCancelledEvent): Promise<void>",
        "+ getSubscriberName(): 'ReminderCancellationObserver'",
        "",
        "// • Reacts to APPOINTMENT_CANCELLED",
        "// • Revokes pending reminder records for appointmentId",
        "// • Transitions status to CANCELLED in persistent store",
    ], (255, 255, 255), (249, 115, 22), (255, 247, 237))

    draw_uml_class(draw, fonts, (1520, 310, 1920, 510), "", "AuditLogObserver", "Part2/code/lib/events/subscribers/AuditLogObserver.ts", [
        "- auditTrail: Array<AuditEntry>",
    ], [
        "+ onEvent(event: DomainEvent): Promise<void>",
        "+ getSubscriberName(): 'AuditLogObserver'",
        "+ getAuditTrail(): AuditEntry[]",
        "",
        "// • Maintains chronological diagnostic audit trail",
        "// • Records all domain event emissions",
    ], (255, 255, 255), (249, 115, 22), (255, 247, 237))

    # Store & Engine
    draw_uml_class(draw, fonts, (1950, 160, 2340, 340), "<<interface>>", "IReminderStore", "Part2/code/lib/reminders/IReminderStore.ts", None, [
        "+ save(reminder: ReminderRecord): Promise<void>",
        "+ findDueReminders(refTime: Date): Promise<ReminderRecord[]>",
        "+ updateStatus(id, status, details?): Promise<void>",
        "+ cancelByAppointmentId(aptId: string): Promise<number>",
    ], (255, 255, 255), (168, 85, 247), (250, 245, 255))

    draw_uml_class(draw, fonts, (1950, 360, 2340, 530), "", "JsonFileReminderStore", "Part2/code/lib/reminders/JsonFileReminderStore.ts", [
        "- filePath: string (data/reminders_store.json)",
    ], [
        "+ Implements IReminderStore with atomic disk sync",
        "+ Prevents duplicate alerts via idempotency keys",
        "+ Persists PENDING, PROCESSING, SENT, CANCELLED",
    ], (250, 245, 255), (168, 85, 247), (243, 232, 255))

    draw_uml_class(draw, fonts, (60, 380, 520, 530), "", "ReminderProcessingEngine", "Part2/code/lib/reminders/ReminderProcessingEngine.ts", [
        "- store: IReminderStore, channel: INotificationChannel",
        "- maxRetries: number = 3",
    ], [
        "+ processDueReminders(refTime: Date, dryRun?: boolean): Promise<Report>",
        "// Evaluates due records; transitions PENDING -> PROCESSING -> SENT/FAILED",
    ], (255, 251, 235), (217, 119, 6), (254, 243, 199))

    # Section B Header
    draw.rectangle([60, 560, width - 60, 595], fill=(241, 245, 249))
    draw.text((80, 568), "PART B: CHRONOLOGICAL REMINDER LIFECYCLE & SCHEDULED PROCESSING EVENT FLOW", fill=(15, 23, 42), font=fonts["subheader"])

    # 6 Step Sequence Cards
    draw_card(draw, fonts, (60, 610, 410, 750), "1. Booking Mutation", [
        "Patient/Admin submits form",
        "appointment.actions.ts writes",
        "document to Appwrite Databases.",
    ], (255, 255, 255), (71, 85, 105))
    draw_card(draw, fonts, (440, 610, 790, 750), "2. Publish Domain Event", [
        "Calls domainEventBus.publish()",
        "Broadcasts APPOINTMENT_SCHEDULED",
        "with schedule date & teleconsult info.",
    ], (255, 247, 237), (249, 115, 22), (154, 52, 18))
    draw_card(draw, fonts, (820, 610, 1180, 750), "3. Observers React", [
        "ReminderScheduler calculates T-24h",
        "and T-2h triggers; mints unique",
        "idempotency keys (${aptId}_${win}_${epoch}).",
    ], (255, 255, 255), (249, 115, 22), (154, 52, 18))
    draw_card(draw, fonts, (1210, 610, 1570, 750), "4. Persistent Disk Sync", [
        "JsonFileReminderStore saves",
        "tasks to data/reminders_store.json",
        "Status: PENDING.",
    ], (250, 245, 255), (168, 85, 247), (107, 33, 168))
    draw_card(draw, fonts, (1600, 610, 1960, 750), "5. Scheduled HTTP Trigger", [
        "External Cron triggers route:",
        "POST /api/reminders/process",
        "Header: x-scheduled-token.",
    ], (254, 242, 242), (239, 68, 68), (153, 27, 27))
    draw_card(draw, fonts, (1990, 610, 2340, 750), "6. Sweep & Delivery", [
        "ReminderEngine sweeps due tasks",
        "Transitions: PENDING -> PROCESSING",
        "Dispatches SMS via Channel.",
    ], (255, 251, 235), (217, 119, 6), (146, 64, 14))

    # Outcomes Panel
    draw_panel(draw, fonts, (60, 780, 2340, 1140), "DELIVERY OUTCOMES, RETRY POLICIES & CANCELLATION WORKFLOW", "Deterministic state transitions inside JsonFileReminderStore", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (90, 840, 800, 1110), "SUCCESS OUTCOME (Status: SENT)", [
        "• Reminder status transitions immediately to SENT in reminders_store.json.",
        "• Stores messageId and dispatchedAt timestamp.",
        "• DUPLICATE PREVENTION: Idempotency key and terminal SENT status guarantee",
        "  that subsequent sweep executions will never re-deliver duplicate notifications.",
    ], (240, 253, 244), (34, 197, 94), (21, 128, 61))
    draw_card(draw, fonts, (830, 840, 1560, 1110), "FAILURE & RETRY OUTCOME (Status: FAILED / RETRY)", [
        "• If telephony dispatch fails, status transitions to FAILED and error details recorded.",
        "• Increments retryCount on the reminder task record.",
        "• RETRY POLICY: If retryCount < maxRetries (3), task remains eligible for subsequent sweep passes.",
        "• If retryCount reaches 3, task is dead-lettered to prevent infinite looping.",
    ], (254, 242, 242), (239, 68, 68), (153, 27, 27))
    draw_card(draw, fonts, (1590, 840, 2310, 1110), "CANCELLATION OUTCOME (Status: CANCELLED)", [
        "• When an administrator or patient cancels an appointment via updateAppointment(cancel),",
        "  the DomainEventBus publishes APPOINTMENT_CANCELLED.",
        "• ReminderCancellationObserver intercepts event and calls cancelByAppointmentId(appointmentId).",
        "• Any PENDING reminder records are immediately transitioned to CANCELLED.",
        "• Subsequent scheduled sweeps bypass CANCELLED tasks, guaranteeing no ghost alerts are sent.",
    ], (239, 246, 255), (59, 130, 246), (30, 58, 138))

    # Audit & Architectural Disclosures
    draw_panel(draw, fonts, (60, 1170, 2340, 1560), "OPERATIONAL AUDIT, CONCURRENCY LIMITATIONS & ARCHITECTURAL DISCLOSURES", "Strict compliance with assignment requirements", (248, 250, 252), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (90, 1230, 800, 1520), "1. No Unmanaged Daemon Threads", [
        "• Serverless Next.js processes do NOT run unmanaged background daemon timers in process memory.",
        "• The reminder processing engine executes strictly upon on-demand HTTP invocation of",
        "  POST /api/reminders/process.",
        "• In production, this route is triggered by an external scheduler (cron, EventBridge, Vercel Cron).",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (830, 1230, 1560, 1520), "2. Delivery Guarantees (At-Least-Once)", [
        "• Third-party telecom networks (Twilio, SMS gateways, SMTP) do not participate in distributed",
        "  database two-phase commit transactions.",
        "• Application architecture guarantees At-Least-Once delivery with deterministic idempotency keys",
        "  (${appointmentId}_${windowType}_${scheduleEpoch}) to eliminate duplicate sends at the app layer.",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (1590, 1230, 2310, 1520), "3. Concurrency Limitations of File Store", [
        "• The JsonFileReminderStore provides single-process file serialization suitable for demonstrations.",
        "• Under high-concurrency multi-instance horizontal scaling, file-lock contention can occur.",
        "• Enterprise production migration requires Redis BullMQ, RabbitMQ, or PostgreSQL transactional",
        "  row locking (SELECT ... FOR UPDATE SKIP LOCKED).",
    ], (248, 250, 252), (148, 163, 184))

    img.save(output_path, "PNG")
    print(f"Rendered: {output_path} ({width}x{height})")

def render_all():
    base_dir = r"Part2\Diagrams"
    os.makedirs(base_dir, exist_ok=True)
    
    render_system_architecture(os.path.join(base_dir, "Part2_System_Architecture.png"))
    render_ch01_adapter_uml(os.path.join(base_dir, "CH01_Adapter_UML.png"))
    render_ch02_strategy_uml(os.path.join(base_dir, "CH02_Strategy_UML.png"))
    render_ch03_observer_uml(os.path.join(base_dir, "CH03_Observer_UML.png"))
    print("All 4 PNG diagrams rendered successfully!")

if __name__ == "__main__":
    render_all()
