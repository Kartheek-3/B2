import os
import math
from PIL import Image, ImageDraw, ImageFont

def get_fonts():
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 32)
        font_subtitle = ImageFont.truetype("arial.ttf", 16)
        font_header = ImageFont.truetype("arialbd.ttf", 20)
        font_subheader = ImageFont.truetype("arialbd.ttf", 15)
        font_bold = ImageFont.truetype("arialbd.ttf", 13)
        font_regular = ImageFont.truetype("arial.ttf", 12)
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

def wrap_text(text, font, max_width):
    if not text:
        return [""]
    bbox = font.getbbox(text)
    if (bbox[2] - bbox[0]) <= max_width:
        return [text]
        
    words = text.split(" ")
    lines = []
    current_line = []
    
    for word in words:
        test_line = " ".join(current_line + [word])
        w = font.getbbox(test_line)[2] - font.getbbox(test_line)[0]
        if w <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
                current_line = [word]
            else:
                lines.append(word)
                current_line = []
                
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def draw_arrow_head(draw, pt1, pt2, fill, style="open", size=10):
    x1, y1 = pt1
    x2, y2 = pt2
    angle = math.atan2(y2 - y1, x2 - x1)
    
    p_left = (
        x2 - size * math.cos(angle - math.pi / 6),
        y2 - size * math.sin(angle - math.pi / 6),
    )
    p_right = (
        x2 - size * math.cos(angle + math.pi / 6),
        y2 - size * math.sin(angle + math.pi / 6),
    )
    
    if style == "open":
        draw.line([p_left, (x2, y2)], fill=fill, width=2)
        draw.line([p_right, (x2, y2)], fill=fill, width=2)
    elif style == "solid":
        draw.polygon([(x2, y2), p_left, p_right], fill=fill)
    elif style == "hollow":
        draw.polygon([(x2, y2), p_left, p_right], fill=(255, 255, 255), outline=fill)

def draw_connector(draw, points, fill=(71, 85, 105), width=2, dashed=False, arrow_style="open", label=None, label_font=None, label_pos=None):
    if dashed:
        for i in range(len(points) - 1):
            x1, y1 = points[i]
            x2, y2 = points[i+1]
            dist = math.hypot(x2 - x1, y2 - y1)
            if dist == 0:
                continue
            dx = (x2 - x1) / dist
            dy = (y2 - y1) / dist
            dash_len = 6
            gap_len = 4
            curr = 0
            while curr < dist:
                next_pt = min(curr + dash_len, dist)
                draw.line([(x1 + dx * curr, y1 + dy * curr), (x1 + dx * next_pt, y1 + dy * next_pt)], fill=fill, width=width)
                curr += dash_len + gap_len
    else:
        for i in range(len(points) - 1):
            draw.line([points[i], points[i+1]], fill=fill, width=width)
            
    if arrow_style and len(points) >= 2:
        draw_arrow_head(draw, points[-2], points[-1], fill=fill, style=arrow_style, size=12)
        
    if label and label_font:
        if label_pos:
            lx, ly = label_pos
        else:
            mid_idx = len(points) // 2
            lx, ly = points[mid_idx][0] + 6, points[mid_idx][1] - 16
        
        tb = label_font.getbbox(label)
        tw = tb[2] - tb[0]
        th = tb[3] - tb[1]
        pill_box = (lx - 5, ly - 3, lx + tw + 5, ly + th + 3)
        draw.rounded_rectangle(pill_box, radius=4, fill=(255, 255, 255), outline=fill, width=1)
        draw.text((lx, ly), label, fill=fill, font=label_font)

def draw_panel(draw, fonts, box, title, subtitle, fill, stroke, header_color):
    draw.rounded_rectangle(box, radius=12, fill=fill, outline=stroke, width=2)
    x1, y1, x2, y2 = box
    draw.text((x1 + 18, y1 + 14), title, fill=header_color, font=fonts["header"])
    if subtitle:
        draw.text((x1 + 18, y1 + 38), subtitle, fill=(100, 116, 139), font=fonts["small"])

def draw_card(draw, fonts, box, title, lines, fill, stroke, title_color=(15, 23, 42)):
    draw.rounded_rectangle(box, radius=8, fill=fill, outline=stroke, width=1)
    x1, y1, x2, y2 = box
    max_w = (x2 - x1) - 28
    
    title_lines = title.split("\n")
    curr_y = y1 + 10
    for t_line in title_lines:
        draw.text((x1 + 14, curr_y), t_line, fill=title_color, font=fonts["bold"])
        curr_y += 18
        
    curr_y += 6
    
    for line in lines:
        for w_line in wrap_text(line, fonts["regular"], max_w):
            draw.text((x1 + 14, curr_y), w_line, fill=(51, 65, 85), font=fonts["regular"])
            curr_y += 17

def draw_uml_class(draw, fonts, box, stereotype, class_name, file_path, attributes, methods, fill, stroke, header_fill):
    x1, y1, x2, y2 = box
    max_w = (x2 - x1) - 28
    
    header_lines = 0
    if stereotype:
        header_lines += 1
    header_lines += len(class_name.split("\n"))
    if file_path:
        header_lines += 1
        
    header_height = 14 + header_lines * 17
    
    draw.rounded_rectangle(box, radius=8, fill=fill, outline=stroke, width=2)
    draw.rounded_rectangle((x1, y1, x2, y1 + header_height), radius=8, fill=header_fill, outline=stroke, width=1)
    draw.rectangle((x1, y1 + header_height - 6, x2, y1 + header_height), fill=header_fill)
    draw.line((x1, y1 + header_height, x2, y1 + header_height), fill=stroke, width=2)
    
    curr_y = y1 + 8
    if stereotype:
        draw.text((x1 + 14, curr_y), stereotype, fill=(71, 85, 105), font=fonts["small"])
        curr_y += 15
    for c_line in class_name.split("\n"):
        draw.text((x1 + 14, curr_y), c_line, fill=(15, 23, 42), font=fonts["subheader"])
        curr_y += 18
    if file_path:
        draw.text((x1 + 14, curr_y), file_path, fill=(100, 116, 139), font=fonts["small"])
        
    curr_y = y1 + header_height + 10
    
    if attributes is not None:
        for attr in attributes:
            for w in wrap_text(attr, fonts["mono"], max_w):
                draw.text((x1 + 14, curr_y), w, fill=(30, 41, 59), font=fonts["mono"])
                curr_y += 17
        draw.line((x1, curr_y + 4, x2, curr_y + 4), fill=stroke, width=1)
        curr_y += 10
        
    for method in methods:
        color = (100, 116, 139) if method.startswith("//") else (30, 41, 59)
        f = fonts["small"] if method.startswith("//") else fonts["mono"]
        for w in wrap_text(method, f, max_w):
            draw.text((x1 + 14, curr_y), w, fill=color, font=f)
            curr_y += 17

# ==============================================================================
# DIAGRAM A: SYSTEM ARCHITECTURE ENHANCED (2700 x 1750)
# ==============================================================================
def render_system_architecture(output_path):
    width, height = 2700, 1750
    img = Image.new("RGB", (width, height), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)
    fonts = get_fonts()

    # Title Banner
    draw.rectangle([0, 0, width, 90], fill=(15, 23, 42))
    draw.text((60, 18), "CarePulse Part 2: Complete System Architecture & Design Pattern Evolution", fill=(255, 255, 255), font=fonts["title"])
    draw.text((60, 58), "Demonstrating GoF Adapter (CH01), Strategy (CH02), and Observer (CH03) in Next.js FullStack Healthcare Architecture", fill=(148, 163, 184), font=fonts["subtitle"])

    # Dedicated Inter-Layer Route Channel: y=95 to 135 (height 40px)
    # Panels start at y=140

    # 1. Presentation Layer Panel (x: 50 to 440)
    draw_panel(draw, fonts, (50, 140, 440, 1320), "1. PRESENTATION LAYER", "Next.js 14 App Router · Client UI & Endpoints", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (75, 195, 415, 305), "AppointmentForm.tsx (Client Form)", [
        "• Handles create, schedule, cancel requests",
        "• Added isTeleconsultation checkbox toggle",
        "• Submits via Next.js Server Actions",
    ], (241, 245, 249), (148, 163, 184))
    draw_card(draw, fonts, (75, 325, 415, 435), "Success Confirmation Page", [
        "• app/.../new-appointment/success/page.tsx",
        "• Displays appointment confirmation & doctor",
        "• Displays video teleconsultation join room link",
    ], (239, 246, 255), (147, 197, 253), (30, 58, 138))
    draw_card(draw, fonts, (75, 455, 415, 565), "Admin Dashboard & Table", [
        "• app/admin/page.tsx & columns.tsx",
        "• Triggers Schedule & Cancel Modals",
        "• Revalidates administrative cache",
    ], (241, 245, 249), (148, 163, 184))
    draw_card(draw, fonts, (75, 585, 415, 705), "POST /api/video/token", [
        "• Protected teleconsultation access endpoint",
        "• Verifies patient / doctor authorization",
        "• Mints temporary participant session tokens",
    ], (238, 242, 255), (165, 180, 252), (67, 56, 202))
    draw_card(draw, fonts, (75, 725, 415, 845), "POST /api/reminders/process", [
        "• Protected scheduled reminder processor",
        "• Requires 'x-scheduled-token' header auth",
        "• Evaluates due tasks & enforces idempotency",
    ], (254, 242, 242), (252, 165, 165), (153, 27, 27))
    draw_card(draw, fonts, (75, 865, 415, 965), "Utility Routes", [
        "• /api/checkEmail, /api/checkPhone",
        "• /api/patients/[id] lookup endpoint",
    ], (255, 255, 255), (203, 213, 225))

    # 2. Application Layer Panel (x: 470 to 920, w=450)
    draw_panel(draw, fonts, (470, 140, 920, 1320), "2. APPLICATION LAYER", "Domain services, Singletons & Factory schemas", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (495, 195, 895, 395), "lib/actions/appointment.actions.ts", [
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
    draw_card(draw, fonts, (495, 415, 895, 545), "lib/events/eventHub.ts (Event Backbone)", [
        "• Shared DomainEventBus singleton (Subject)",
        "• JsonFileReminderStore persistent store",
        "• ReminderProcessingEngine scheduler coordinator",
        "• AppwriteNotificationChannel multi-channel sink",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))
    draw_card(draw, fonts, (495, 565, 895, 685), "appwrite.config.ts (Singleton - Preserved)", [
        "• Single module-scoped sdk.Client connection",
        "• Reused by Databases, Users, Messaging, Storage",
        "• Preserves baseline state without regressions",
    ], (240, 253, 244), (134, 239, 172), (22, 101, 52))
    draw_card(draw, fonts, (495, 705, 895, 825), "validation.ts (Factory Method - Extended)", [
        "• getAppointmentSchema(type) parameterized factory",
        "• Dynamic schema: Create, Schedule, Cancel",
        "• Extended with optional isTeleconsultation flag",
    ], (240, 253, 244), (134, 239, 172), (22, 101, 52))

    # Gutter between Col 2 and Col 3: x=920 to 1060 (140px wide!)

    # 3. Design Patterns Layer Panel (x: 1060 to 1980, w=920)
    draw_panel(draw, fonts, (1060, 140, 1980, 1320), "3. DESIGN PATTERN EVOLUTION LAYER", "Source-verified GoF Adapter (CH01), Strategy (CH02), and Observer (CH03)", (248, 250, 252), (203, 213, 225), (30, 41, 59))
    
    # CH01 Sub-panel
    draw.rounded_rectangle((1080, 190, 1960, 500), radius=10, fill=(239, 246, 255), outline=(59, 130, 246), width=2)
    draw.text((1100, 205), "CH01: ADAPTER PATTERN (Video Consultation)", fill=(30, 58, 138), font=fonts["subheader"])
    draw_card(draw, fonts, (1100, 235, 1500, 375), "<<Target Interface>>\nIVideoConsultationService", [
        "• createRoom(request): Promise<VideoRoomDetails>",
        "• getRoomDetails(roomId): Promise<VideoRoomDetails | null>",
        "• generateParticipantAccess(roomId, participant): Promise",
        "• getProviderName(): string",
    ], (255, 255, 255), (59, 130, 246), (29, 78, 216))
    draw_card(draw, fonts, (1530, 235, 1940, 375), "VideoServiceFactory", [
        "• Supplies configured video adapter",
        "• Defaults to LocalDemonstrationVideoAdapter",
        "• Enables zero-leakage polymorphic access",
    ], (255, 255, 255), (59, 130, 246), (29, 78, 216))
    draw_card(draw, fonts, (1100, 390, 1940, 490), "<<Adapter>> LocalDemonstrationVideoAdapter", [
        "• Implements IVideoConsultationService & encapsulates proprietary adaptee",
        "• Translates domain models to proprietary session payloads & ISO dates to epoch",
        "• Maps doctor/patient roles into clinician/client claims with 1-hr access tokens",
    ], (219, 234, 254), (29, 78, 216), (30, 58, 138))

    # CH02 Sub-panel
    draw.rounded_rectangle((1080, 520, 1960, 855), radius=10, fill=(236, 253, 245), outline=(16, 185, 129), width=2)
    draw.text((1100, 535), "CH02: STRATEGY PATTERN (Doctor Availability Rules)", fill=(6, 95, 70), font=fonts["subheader"])
    draw_card(draw, fonts, (1100, 565, 1500, 710), "<<Context>>\nDoctorAvailabilityContext", [
        "• Holds IAvailabilityStrategy reference",
        "• setStrategy(): runtime interchangeability",
        "• resolveStrategy(doctorConfig)",
        "• validateSlot() & generateAvailableSlots()",
    ], (209, 250, 229), (5, 150, 105), (6, 95, 70))
    draw_card(draw, fonts, (1530, 565, 1940, 710), "<<Strategy Interface>>\nIAvailabilityStrategy", [
        "• validateSlot(req, cfg, bookings)",
        "• generateAvailableSlots(date, cfg)",
        "• getStrategyType(): StrategyType",
    ], (255, 255, 255), (16, 185, 129), (4, 120, 87))
    draw_card(draw, fonts, (1100, 725, 1940, 845), "Three Interchangeable Concrete Strategies", [
        "1. StandardBusinessHoursStrategy: Mon-Fri 09:00-17:00, lunch blackout (12-13), conflict check",
        "2. ShiftBasedAvailabilityStrategy: Roster shifts (Morning 07-15, Evening 15-23, Night), off-duty rejection",
        "3. EmergencyOnCallAvailabilityStrategy: 24/7 continuous triage with mandatory 15-min recovery buffer",
    ], (255, 255, 255), (16, 185, 129), (4, 120, 87))

    # CH03 Sub-panel
    draw.rounded_rectangle((1080, 875, 1960, 1295), radius=10, fill=(255, 247, 237), outline=(249, 115, 22), width=2)
    draw.text((1100, 890), "CH03: OBSERVER PATTERN & REMINDER ENGINE", fill=(154, 52, 18), font=fonts["subheader"])
    draw_card(draw, fonts, (1100, 920, 1500, 1040), "<<Subject / Event Bus>>\nDomainEventBus", [
        "• subscribe() & unsubscribe()",
        "• publish(DomainEvent) async",
        "• Decoupled lifecycle event broadcast",
    ], (254, 237, 213), (234, 88, 12), (154, 52, 18))
    draw_card(draw, fonts, (1530, 920, 1940, 1040), "<<Observer>> Specialized Subscribers", [
        "• ReminderSchedulerObserver (24h/2h tasks)",
        "• ReminderCancellationObserver (revocation)",
        "• AuditLogObserver (chronological trail)",
    ], (255, 255, 255), (249, 115, 22), (154, 52, 18))
    draw_card(draw, fonts, (1100, 1060, 1940, 1190), "ReminderProcessingEngine (Scheduled Sweeper)", [
        "• processDueReminders(referenceTime): sweeps records where triggerAt <= T_now",
        "• Idempotent state transitions: PENDING -> PROCESSING -> SENT",
        "• Retry policy on failure with maxRetries limit (3 attempts)",
    ], (255, 251, 235), (217, 119, 6), (146, 64, 14))
    draw_card(draw, fonts, (1100, 1205, 1940, 1280), "Domain Events: APPOINTMENT_SCHEDULED · RESCHEDULED · CANCELLED", [
        "Carries appointmentId, scheduleDate, doctorName, patientName, teleconsultation details",
    ], (255, 255, 255), (249, 115, 22), (154, 52, 18))

    # 4. Infrastructure Layer Panel (x: 2020 to 2650, w=630)
    draw_panel(draw, fonts, (2020, 140, 2650, 1320), "4. INFRASTRUCTURE & PERSISTENCE", "Appwrite Cloud / Local disk storage", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (2045, 195, 2625, 305), "Appwrite Databases", [
        "• Appointment collection documents",
        "• Patient profile records",
        "• Document queries & mutations",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))
    draw_card(draw, fonts, (2045, 325, 2625, 425), "Appwrite Users & Auth", [
        "• Patient user accounts & phone auth",
        "• Admin passkey authentication",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))
    draw_card(draw, fonts, (2045, 445, 2625, 545), "Appwrite Messaging", [
        "• Direct provider telephony delivery",
        "• Preserved for baseline SMS callbacks",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))
    draw_card(draw, fonts, (2045, 565, 2625, 665), "Appwrite Storage (Buckets)", [
        "• Patient ID verification files",
        "• Medical document uploads",
    ], (250, 245, 255), (216, 180, 254), (107, 33, 168))
    draw_card(draw, fonts, (2045, 685, 2625, 865), "JsonFileReminderStore (Disk)", [
        "• IReminderStore implementation",
        "• Persists to data/reminders_store.json",
        "• Deterministic idempotency keys:",
        "  ${aptId}_${win}_${scheduleEpoch}",
        "• Atomic status transition & cancellation",
    ], (254, 242, 242), (248, 113, 113), (153, 27, 27))

    # 5. External / Execution Layer Panel
    draw_panel(draw, fonts, (50, 1350, 2650, 1710), "5. EXTERNAL SYSTEMS & EXECUTION ENVIRONMENT", "Mock Demonstration, External Cron Scheduling & Delivery Guarantees", (241, 245, 249), (148, 163, 184), (15, 23, 42))
    draw_card(draw, fonts, (75, 1410, 890, 1680), "<<Adaptee>> LocalDemonstrationVideoProvider [MOCK DEMONSTRATION]", [
        "• Proprietary mock engine: initiateMeetingSession(), querySession(), mintJoinToken()",
        "• Mints signed JWT demonstration tokens & simulated room URLs",
        "• ACADEMIC DISCLOSURE: Offline reproducible demonstration engine;",
        "  does NOT connect to live WebRTC media servers or external paid APIs (Zoom / Twilio / Daily.co).",
    ], (254, 243, 199), (217, 119, 6), (146, 64, 14))
    draw_card(draw, fonts, (920, 1410, 1780, 1680), "External Scheduler Trigger [RECURRING CRON / HTTP TRIGGER]", [
        "• Invokes POST /api/reminders/process passing 'x-scheduled-token' authentication header",
        "• Triggered by Linux Cron, AWS EventBridge, Vercel Cron, or CI test runners",
        "• OPERATIONAL DISCLOSURE: Next.js serverless runtimes do NOT execute perpetual background daemons;",
        "  the reminder processing engine executes strictly upon on-demand HTTP invocation.",
    ], (254, 242, 242), (239, 68, 68), (153, 27, 27))
    draw_card(draw, fonts, (1810, 1410, 2625, 1680), "External Telephony & Notification Sink [AT-LEAST-ONCE DELIVERY]", [
        "• Twilio SMS Gateway / Local Log Sink (AppwriteNotificationChannel)",
        "• External telecom channels do not participate in distributed 2-phase database transactions",
        "• Guarantees At-Least-Once delivery with application idempotency keys preventing duplicate alerts.",
    ], (255, 255, 255), (148, 163, 184), (15, 23, 42))

    # Connectors between layers - Route cleanly in the wide 140px gutter (x=920 to 1060)
    # 1. Presentation -> Application
    draw_connector(draw, [(415, 250), (495, 250)], fill=(71, 85, 105), width=2, arrow_style="open")
    
    # 2. Application -> CH01 Target Interface
    draw_connector(draw, [(895, 260), (1100, 260)], fill=(37, 99, 235), width=2, arrow_style="open", label="createRoom()", label_font=fonts["small"], label_pos=(955, 242))
    
    # 3. Application -> CH02 Context (routed down gutter at x=980)
    draw_connector(draw, [(895, 300), (980, 300), (980, 635), (1100, 635)], fill=(5, 150, 105), width=2, arrow_style="open", label="validateSlot()", label_font=fonts["small"], label_pos=(935, 450))
    
    # 4. Application / Event Backbone -> CH03 DomainEventBus (routed down gutter at x=1010)
    draw_connector(draw, [(895, 480), (1010, 480), (1010, 980), (1100, 980)], fill=(234, 88, 12), width=2, arrow_style="open", label="publish(DomainEvent)", label_font=fonts["small"], label_pos=(935, 730))
    
    # 5. Application -> Appwrite Databases (routed in the clear channel at y=110, completely above all panels!)
    draw_connector(draw, [(895, 215), (940, 215), (940, 110), (2000, 110), (2000, 235), (2045, 235)], fill=(126, 34, 206), width=2, arrow_style="open", label="createDocument()", label_font=fonts["small"], label_pos=(1430, 98))

    img.save(output_path, "PNG")
    print(f"Rendered: {output_path} ({width}x{height})")

# ==============================================================================
# DIAGRAM B: CH01 ADAPTER UML CLASS DIAGRAM ENHANCED (2500 x 1520)
# ==============================================================================
def render_ch01_adapter_uml(output_path):
    width, height = 2500, 1520
    img = Image.new("RGB", (width, height), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)
    fonts = get_fonts()

    # Title Banner
    draw.rectangle([0, 0, width, 90], fill=(15, 23, 42))
    draw.text((60, 18), "CH01: Video Consultation Adapter Pattern — UML Class Diagram", fill=(255, 255, 255), font=fonts["title"])
    draw.text((60, 58), "Target Interface, Concrete Adapter, Adaptee (Local Demonstration Mock), Client & Factory", fill=(148, 163, 184), font=fonts["subtitle"])

    # Client Box
    draw_uml_class(draw, fonts, (60, 130, 620, 320), "", "Client: Appointment Actions & API", "Part2/code/lib/actions/appointment.actions.ts", None, [
        "+ createAppointment(appointment: CreateAppointmentParams): Promise<Appointment>",
        "+ updateAppointment(params: UpdateAppointmentParams): Promise<Appointment>",
        "+ POST /api/video/token(request: NextRequest): Promise<NextResponse>",
    ], (255, 255, 255), (71, 85, 105), (241, 245, 249))

    # Factory Box
    draw_uml_class(draw, fonts, (60, 420, 620, 560), "", "VideoServiceFactory", "Part2/code/lib/video/VideoServiceFactory.ts", None, [
        "+ static getVideoService(): IVideoConsultationService",
        "+ static createService(): IVideoConsultationService",
    ], (255, 255, 255), (37, 99, 235), (239, 246, 255))

    # Target Interface
    draw_uml_class(draw, fonts, (740, 130, 1550, 340), "<<interface>>", "IVideoConsultationService (Target)", "Part2/code/lib/video/IVideoConsultationService.ts", None, [
        "+ createRoom(request: VideoRoomRequest): Promise<VideoRoomDetails>",
        "+ getRoomDetails(roomId: string): Promise<VideoRoomDetails | null>",
        "+ generateParticipantAccess(roomId: string, participant: VideoParticipant): Promise<VideoSessionAccess>",
        "+ getProviderName(): string",
    ], (255, 255, 255), (37, 99, 235), (239, 246, 255))

    # Concrete Adapter
    draw_uml_class(draw, fonts, (740, 420, 1550, 750), "", "LocalDemonstrationVideoAdapter (Adapter)", "Part2/code/lib/video/LocalDemonstrationVideoAdapter.ts", [
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
    draw_uml_class(draw, fonts, (1650, 420, 2440, 750), "<<adaptee>>", "LocalDemonstrationVideoProvider [LOCAL DEMONSTRATION MOCK]", "Part2/code/lib/video/LocalDemonstrationVideoProvider.ts", [
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
    draw_panel(draw, fonts, (60, 800, 2440, 1470), "DATA TRANSFER OBJECTS & PROPRIETARY ENVELOPES", "Part2/code/lib/video/types.ts", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (90, 860, 520, 1090), "VideoRoomRequest", [
        "+ appointmentId: string",
        "+ doctorName: string",
        "+ patientName: string",
        "+ scheduledTime: Date",
        "+ topic?: string",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (550, 860, 1020, 1090), "VideoRoomDetails", [
        "+ roomId: string",
        "+ roomUrl: string",
        "+ provider: string",
        "+ createdAt: Date",
        "+ scheduledTime: Date",
        "+ doctorName: string",
        "+ patientName: string",
        "+ status: string",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (1050, 860, 1570, 1090), "VideoSessionAccess & Participant", [
        "+ roomId: string",
        "+ joinUrl: string",
        "+ accessToken: string",
        "+ expiresAt: Date",
        "+ participant: VideoParticipant",
        "    userId: string",
        "    name: string",
        "    role: 'doctor' | 'patient'",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (1600, 860, 2410, 1090), "ProprietarySessionPayload & Response", [
        "ProprietarySessionPayload:",
        "  sessionTag: string, startTimestampEpoch: number",
        "  hostIdentifier: string, guestIdentifier: string",
        "ProprietarySessionResponse:",
        "  statusCode: number, data: { sessionId, rawEndpointUrl, ... }",
        "ProprietaryTokenResponse:",
        "  tokenData: { jwtStub, accessLink, validUntilEpoch }",
    ], (254, 243, 199), (217, 119, 6), (146, 64, 14))

    draw_card(draw, fonts, (90, 1130, 2410, 1430), "DESIGN PATTERN COLLABORATION SUMMARY & ARCHITECTURAL BENEFITS", [
        "1. Open-Closed Principle (OCP): New video providers (e.g., DailyVideoAdapter, ZoomVideoAdapter) can be plugged in without changing appointment.actions.ts.",
        "2. Liskov Substitution Principle (LSP): Any adapter implementing IVideoConsultationService can be supplied transparently by VideoServiceFactory.",
        "3. Dependency Inversion Principle (DIP): Core scheduling domain logic depends upon the IVideoConsultationService abstraction, not vendor SDKs.",
        "4. Mock Demonstration Integrity: LocalDemonstrationVideoProvider guarantees 100% offline reproducible test execution with zero external vendor API keys.",
    ], (239, 246, 255), (59, 130, 246), (30, 58, 138))

    # UML Connectors
    draw_connector(draw, [(620, 225), (740, 225)], fill=(37, 99, 235), width=2, dashed=True, arrow_style="open", label="uses / calls", label_font=fonts["small"], label_pos=(635, 200))
    draw_connector(draw, [(340, 320), (340, 420)], fill=(71, 85, 105), width=2, dashed=True, arrow_style="open", label="requests service", label_font=fonts["small"], label_pos=(350, 360))
    draw_connector(draw, [(620, 490), (740, 490)], fill=(37, 99, 235), width=2, dashed=True, arrow_style="open", label="instantiates", label_font=fonts["small"], label_pos=(635, 465))
    draw_connector(draw, [(1145, 420), (1145, 340)], fill=(37, 99, 235), width=2, dashed=True, arrow_style="hollow", label="<<implements>>", label_font=fonts["small"], label_pos=(1155, 375))
    draw_connector(draw, [(1550, 540), (1650, 540)], fill=(217, 119, 6), width=2, dashed=False, arrow_style="open", label="- adaptee: 1", label_font=fonts["small"], label_pos=(1565, 515))

    img.save(output_path, "PNG")
    print(f"Rendered: {output_path} ({width}x{height})")

# ==============================================================================
# DIAGRAM C: CH02 STRATEGY UML CLASS DIAGRAM ENHANCED (2500 x 1540)
# ==============================================================================
def render_ch02_strategy_uml(output_path):
    width, height = 2500, 1540
    img = Image.new("RGB", (width, height), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)
    fonts = get_fonts()

    # Title Banner
    draw.rectangle([0, 0, width, 90], fill=(15, 23, 42))
    draw.text((60, 18), "CH02: Flexible Doctor Availability Strategy Pattern — UML Class Diagram", fill=(255, 255, 255), font=fonts["title"])
    draw.text((60, 58), "Strategy Interface, Three Concrete Strategies, Context, Dynamic Selection & Client", fill=(148, 163, 184), font=fonts["subtitle"])

    # Client
    draw_uml_class(draw, fonts, (60, 130, 660, 310), "", "Client: Appointment Server Actions", "Part2/code/lib/actions/appointment.actions.ts", None, [
        "+ createAppointment(appointment: CreateAppointmentParams): Promise<Appointment>",
        "",
        "// Flow: Queries doctor config from DoctorAvailabilityConfigs",
        "// -> Calls DoctorAvailabilityContext.resolveStrategy(config)",
        "// -> Instantiates Context & calls context.validateSlot()",
    ], (255, 255, 255), (71, 85, 105), (241, 245, 249))

    # Context (x: 60 to 660)
    draw_uml_class(draw, fonts, (60, 380, 660, 710), "", "DoctorAvailabilityContext (Context)", "Part2/code/lib/availability/DoctorAvailabilityContext.ts", [
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

    # Strategy Interface (x: 800 to 1720)
    draw_uml_class(draw, fonts, (800, 130, 1720, 330), "<<interface>>", "IAvailabilityStrategy (Strategy)", "Part2/code/lib/availability/IAvailabilityStrategy.ts", None, [
        "+ validateSlot(request: SlotValidationRequest, config: DoctorAvailabilityConfig, existingBookings: ExistingBooking[]): SlotValidationResult",
        "+ generateAvailableSlots(date: Date, config: DoctorAvailabilityConfig, existingBookings: ExistingBooking[]): Date[]",
        "+ getStrategyType(): StrategyType",
    ], (255, 255, 255), (16, 185, 129), (209, 250, 229))

    # Three Concrete Strategies (Gutter from Context x=660 to x=750 is 90px!)
    draw_uml_class(draw, fonts, (750, 410, 1260, 710), "", "StandardBusinessHoursStrategy", "Part2/code/lib/availability/StandardBusinessHoursStrategy.ts", [
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

    draw_uml_class(draw, fonts, (1310, 410, 1830, 710), "", "ShiftBasedAvailabilityStrategy", "Part2/code/lib/availability/ShiftBasedAvailabilityStrategy.ts", [
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

    draw_uml_class(draw, fonts, (1880, 410, 2440, 710), "", "EmergencyOnCallAvailabilityStrategy", "Part2/code/lib/availability/EmergencyOnCallAvailabilityStrategy.ts", [
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
    draw_panel(draw, fonts, (60, 760, 2440, 1490), "TYPES, ROSTER CONFIGURATIONS & CONCURRENCY LIMITATIONS", "Part2/code/lib/availability/types.ts & constants/index.ts", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (90, 820, 620, 1080), "SlotValidationRequest & Result", [
        "SlotValidationRequest:",
        "  doctorName: string, requestedTime: Date",
        "  durationMinutes: number, isEmergency?: boolean",
        "SlotValidationResult:",
        "  isValid: boolean, reason?: string",
        "  conflictingBooking?: ExistingBooking",
        "  evaluatedStrategy: StrategyType",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (650, 820, 1260, 1080), "DoctorAvailabilityConfig", [
        "doctorName: string",
        "strategyType: StrategyType",
        "  ('STANDARD_BUSINESS_HOURS' | 'SHIFT_BASED' | 'EMERGENCY_ON_CALL')",
        "assignedShifts?: DoctorShift[]",
        "  (dayOfWeek, shiftStartHour, shiftEndHour)",
        "emergencyBufferMinutes?: number (default 15)",
        "slotDurationMinutes?: number (default 30)",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (1290, 820, 2410, 1080), "DoctorAvailabilityConfigs Registry (constants/index.ts)", [
        "• Dr. John Green, Dr. David Livingston, Dr. Jane Powell, Dr. Jasmine Lee, Dr. Hardik Sharma -> STANDARD_BUSINESS_HOURS",
        "• Dr. Leila Cameron -> SHIFT_BASED (Mon/Wed Morning 07:00-15:00, Fri Evening 15:00-23:00, 45-min slots)",
        "• Dr. Alex Ramirez -> SHIFT_BASED (Tue/Thu Morning 08:00-16:00, 30-min slots)",
        "• Dr. Evan Peter -> EMERGENCY_ON_CALL (24/7 triage, 15-min recovery buffer, 20-min slot duration)",
        "• Dr. Alyana Cruz -> EMERGENCY_ON_CALL (24/7 triage, 20-min recovery buffer, 30-min slot duration)",
    ], (236, 253, 245), (16, 185, 129), (6, 95, 70))

    draw_card(draw, fonts, (90, 1110, 2410, 1450), "CONCURRENCY LIMITATION NOTICE — TIME-OF-CHECK TO TIME-OF-USE (TOCTOU) RACE CONDITION", [
        "1. Application-Level Validation: The Strategy pattern validates availability in application memory prior to committing records.",
        "2. Concurrency Race Condition: In high-concurrency environments, two simultaneous booking requests for the exact same physician and time slot",
        "   may both evaluate as valid in memory before the first record is committed to the database (TOCTOU race).",
        "3. Architectural Guarantees: Because Appwrite document mutations do not support distributed two-phase commit transactions or pessimistic row locks,",
        "   production systems require pairing this Strategy validation with database unique compound indexes on [doctorId, scheduleTimestamp]",
        "   or optimistic version matching ($updatedAt matching) to strictly prevent concurrent double bookings.",
    ], (254, 242, 242), (239, 68, 68), (153, 27, 27))

    # UML Connectors
    draw_connector(draw, [(360, 310), (360, 380)], fill=(5, 150, 105), width=2, dashed=True, arrow_style="open", label="calls validateSlot()", label_font=fonts["small"], label_pos=(370, 340))
    # Context has-a Strategy Interface (routed in the 90px wide gutter at x=705)
    draw_connector(draw, [(660, 460), (705, 460), (705, 230), (800, 230)], fill=(5, 150, 105), width=2, dashed=False, arrow_style="open", label="- strategy: 1", label_font=fonts["small"], label_pos=(672, 340))
    # Concrete Strategies realize Strategy Interface (Hollow Triangles)
    draw_connector(draw, [(1000, 410), (1000, 330)], fill=(5, 150, 105), width=2, dashed=True, arrow_style="hollow", label="<<implements>>", label_font=fonts["small"], label_pos=(1010, 365))
    draw_connector(draw, [(1570, 410), (1570, 330)], fill=(5, 150, 105), width=2, dashed=True, arrow_style="hollow", label="<<implements>>", label_font=fonts["small"], label_pos=(1580, 365))
    draw_connector(draw, [(2160, 410), (2160, 250), (1720, 250)], fill=(5, 150, 105), width=2, dashed=True, arrow_style="hollow", label="<<implements>>", label_font=fonts["small"], label_pos=(1930, 230))

    img.save(output_path, "PNG")
    print(f"Rendered: {output_path} ({width}x{height})")

# ==============================================================================
# DIAGRAM D: CH03 OBSERVER UML & EVENT FLOW ENHANCED (2500 x 1750)
# ==============================================================================
def render_ch03_observer_uml(output_path):
    width, height = 2500, 1750
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

    # Col 1: Subject & Engine (Left side: x=60 to 550)
    draw_uml_class(draw, fonts, (60, 160, 550, 380), "", "DomainEventBus (Subject)", "Part2/code/lib/events/DomainEventBus.ts", [
        "- subscribers: Map<string, Set<IDomainEventSubscriber>>",
    ], [
        "+ subscribe<T>(eventType: string, subscriber: IDomainEventSubscriber<T>): void",
        "+ unsubscribe<T>(eventType: string, subscriber: IDomainEventSubscriber<T>): void",
        "+ publish<T>(event: T): Promise<void>",
        "+ clearSubscribers(): void",
        "",
        "// Broadcasts lifecycle domain events asynchronously to registered observers.",
    ], (255, 247, 237), (249, 115, 22), (254, 237, 213))

    draw_uml_class(draw, fonts, (60, 420, 550, 600), "", "ReminderProcessingEngine", "Part2/code/lib/reminders/ReminderProcessingEngine.ts", [
        "- store: IReminderStore, channel: INotificationChannel",
        "- maxRetries: number = 3",
    ], [
        "+ processDueReminders(refTime: Date, dryRun?: boolean): Promise<Report>",
        "// Evaluates due records; transitions PENDING -> PROCESSING -> SENT/FAILED",
    ], (255, 251, 235), (217, 119, 6), (254, 243, 199))

    # Col 2: Observer Hierarchy (Middle: x=600 to 1840)
    # Observer Interface centered above the concrete subscribers
    draw_uml_class(draw, fonts, (600, 160, 1840, 290), "<<interface>>", "IDomainEventSubscriber<T extends DomainEvent>", "Part2/code/lib/events/types.ts", None, [
        "+ onEvent(event: T): Promise<void>",
        "+ getSubscriberName(): string",
    ], (255, 255, 255), (249, 115, 22), (255, 247, 237))

    # Three Concrete Observers - Order: AuditLogObserver, ReminderSchedulerObserver, ReminderCancellationObserver
    # (ReminderCancellationObserver is adjacent to IReminderStore at x=1450..1840!)
    draw_uml_class(draw, fonts, (600, 340, 990, 580), "", "AuditLogObserver", "Part2/code/lib/events/subscribers/AuditLogObserver.ts", [
        "- auditTrail: Array<AuditEntry>",
    ], [
        "+ onEvent(event: DomainEvent): Promise<void>",
        "+ getSubscriberName(): 'AuditLogObserver'",
        "+ getAuditTrail(): AuditEntry[]",
        "",
        "// • Maintains chronological diagnostic audit trail",
        "// • Records all domain event emissions",
    ], (255, 255, 255), (249, 115, 22), (255, 247, 237))

    draw_uml_class(draw, fonts, (1020, 340, 1420, 580), "", "ReminderSchedulerObserver", "Part2/code/lib/events/subscribers/ReminderSchedulerObserver.ts", [
        "- store: IReminderStore",
    ], [
        "+ onEvent(event: AppointmentScheduledEvent): Promise<void>",
        "+ getSubscriberName(): 'ReminderSchedulerObserver'",
        "",
        "// • Calculates T-24h & T-2h reminder windows",
        "// • Mints deterministic idempotency key:",
        "//     ${appointmentId}_${windowType}_${scheduleEpoch}",
        "// • Enqueues PENDING reminder tasks to store",
    ], (255, 255, 255), (249, 115, 22), (255, 247, 237))

    draw_uml_class(draw, fonts, (1450, 340, 1850, 580), "", "ReminderCancellationObserver", "Part2/code/lib/events/subscribers/ReminderCancellationObserver.ts", [
        "- store: IReminderStore",
    ], [
        "+ onEvent(event: AppointmentCancelledEvent): Promise<void>",
        "+ getSubscriberName(): 'ReminderCancellationObserver'",
        "",
        "// • Reacts to APPOINTMENT_CANCELLED",
        "// • Revokes pending reminder records for appointmentId",
        "// • Transitions status to CANCELLED in persistent store",
    ], (255, 255, 255), (249, 115, 22), (255, 247, 237))

    # Col 3: Persistence Hierarchy (Right: x=1910 to 2440)
    draw_uml_class(draw, fonts, (1910, 160, 2440, 320), "<<interface>>", "IReminderStore", "Part2/code/lib/reminders/IReminderStore.ts", None, [
        "+ save(reminder: ReminderRecord): Promise<void>",
        "+ findDueReminders(refTime: Date): Promise<ReminderRecord[]>",
        "+ updateStatus(reminderId: string, status: ReminderStatus, details?): Promise<void>",
        "+ cancelByAppointmentId(appointmentId: string): Promise<number>",
    ], (255, 255, 255), (168, 85, 247), (250, 245, 255))

    draw_uml_class(draw, fonts, (1910, 380, 2440, 580), "", "JsonFileReminderStore", "Part2/code/lib/reminders/JsonFileReminderStore.ts", [
        "- filePath: string (data/reminders_store.json)",
    ], [
        "+ Implements IReminderStore with atomic disk sync",
        "+ Prevents duplicate alerts via idempotency keys",
        "+ Persists PENDING, PROCESSING, SENT, CANCELLED",
    ], (250, 245, 255), (168, 85, 247), (243, 232, 255))

    # Connectors for Part A - 100% collision-free
    # DomainEventBus notifies IDomainEventSubscriber
    draw_connector(draw, [(550, 225), (600, 225)], fill=(249, 115, 22), width=2, dashed=False, arrow_style="open", label="notifies", label_font=fonts["small"], label_pos=(555, 200))
    
    # 3 Concrete Observers realize IDomainEventSubscriber (Vertical straight lines with hollow triangles!)
    draw_connector(draw, [(795, 340), (795, 290)], fill=(249, 115, 22), width=2, dashed=True, arrow_style="hollow", label="<<implements>>", label_font=fonts["small"], label_pos=(805, 310))
    draw_connector(draw, [(1220, 340), (1220, 290)], fill=(249, 115, 22), width=2, dashed=True, arrow_style="hollow", label="<<implements>>", label_font=fonts["small"], label_pos=(1230, 310))
    draw_connector(draw, [(1650, 340), (1650, 290)], fill=(249, 115, 22), width=2, dashed=True, arrow_style="hollow", label="<<implements>>", label_font=fonts["small"], label_pos=(1660, 310))
    
    # JsonFileReminderStore realizes IReminderStore (Direct vertical straight line!)
    draw_connector(draw, [(2175, 380), (2175, 320)], fill=(168, 85, 247), width=2, dashed=True, arrow_style="hollow", label="<<implements>>", label_font=fonts["small"], label_pos=(2185, 345))
    
    # ReminderCancellationObserver connects directly into IReminderStore (in the clear 60px gap x=1850..1910!)
    draw_connector(draw, [(1850, 460), (1910, 460)], fill=(168, 85, 247), width=2, dashed=False, arrow_style="open", label="- store", label_font=fonts["small"], label_pos=(1858, 438))

    # Section B Header
    draw.rectangle([60, 830, width - 60, 865], fill=(241, 245, 249))
    draw.text((80, 838), "PART B: CHRONOLOGICAL REMINDER LIFECYCLE & SCHEDULED PROCESSING EVENT FLOW", fill=(15, 23, 42), font=fonts["subheader"])

    # 6 Step Sequence Cards with prominent arrows between them!
    draw_card(draw, fonts, (60, 880, 420, 1030), "1. Booking Mutation", [
        "Patient/Admin submits form",
        "appointment.actions.ts writes",
        "document to Appwrite Databases.",
    ], (255, 255, 255), (71, 85, 105))
    draw_card(draw, fonts, (460, 880, 820, 1030), "2. Publish Domain Event", [
        "Calls domainEventBus.publish()",
        "Broadcasts APPOINTMENT_SCHEDULED",
        "with schedule date & teleconsult info.",
    ], (255, 247, 237), (249, 115, 22), (154, 52, 18))
    draw_card(draw, fonts, (860, 880, 1220, 1030), "3. Observers React", [
        "ReminderScheduler calculates T-24h",
        "and T-2h triggers; mints unique",
        "idempotency keys (${aptId}_${win}_${epoch}).",
    ], (255, 255, 255), (249, 115, 22), (154, 52, 18))
    draw_card(draw, fonts, (1260, 880, 1620, 1030), "4. Persistent Disk Sync", [
        "JsonFileReminderStore saves",
        "tasks to data/reminders_store.json",
        "Status: PENDING.",
    ], (250, 245, 255), (168, 85, 247), (107, 33, 168))
    draw_card(draw, fonts, (1660, 880, 2020, 1030), "5. Scheduled HTTP Trigger", [
        "External Cron triggers route:",
        "POST /api/reminders/process",
        "Header: x-scheduled-token.",
    ], (254, 242, 242), (239, 68, 68), (153, 27, 27))
    draw_card(draw, fonts, (2060, 880, 2440, 1030), "6. Sweep & Delivery", [
        "ReminderEngine sweeps due tasks",
        "Transitions: PENDING -> PROCESSING",
        "Dispatches SMS via Channel.",
    ], (255, 251, 235), (217, 119, 6), (146, 64, 14))

    # Prominent Sequence Arrows between steps
    draw_connector(draw, [(420, 955), (460, 955)], fill=(234, 88, 12), width=3, arrow_style="solid")
    draw_connector(draw, [(820, 955), (860, 955)], fill=(234, 88, 12), width=3, arrow_style="solid")
    draw_connector(draw, [(1220, 955), (1260, 955)], fill=(168, 85, 247), width=3, arrow_style="solid")
    draw_connector(draw, [(1620, 955), (1660, 955)], fill=(239, 68, 68), width=3, arrow_style="solid")
    draw_connector(draw, [(2020, 955), (2060, 955)], fill=(217, 119, 6), width=3, arrow_style="solid")

    # Outcomes Panel
    draw_panel(draw, fonts, (60, 1060, 2440, 1390), "DELIVERY OUTCOMES, RETRY POLICIES & CANCELLATION WORKFLOW", "Deterministic state transitions inside JsonFileReminderStore", (255, 255, 255), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (90, 1115, 840, 1365), "SUCCESS OUTCOME (Status: SENT)", [
        "• Reminder status transitions immediately to SENT in reminders_store.json.",
        "• Stores messageId and dispatchedAt timestamp.",
        "• DUPLICATE PREVENTION: Idempotency key and terminal SENT status guarantee",
        "  that subsequent sweep executions will never re-deliver duplicate notifications.",
    ], (240, 253, 244), (34, 197, 94), (21, 128, 61))
    draw_card(draw, fonts, (870, 1115, 1620, 1365), "FAILURE & RETRY OUTCOME (Status: FAILED / RETRY)", [
        "• If telephony dispatch fails, status transitions to FAILED and error details recorded.",
        "• Increments retryCount on the reminder task record.",
        "• RETRY POLICY: If retryCount < maxRetries (3), task remains eligible for subsequent sweep passes.",
        "• If retryCount reaches 3, task is dead-lettered to prevent infinite looping.",
    ], (254, 242, 242), (239, 68, 68), (153, 27, 27))
    draw_card(draw, fonts, (1650, 1115, 2410, 1365), "CANCELLATION OUTCOME (Status: CANCELLED)", [
        "• When an administrator or patient cancels an appointment via updateAppointment(cancel),",
        "  the DomainEventBus publishes APPOINTMENT_CANCELLED.",
        "• ReminderCancellationObserver intercepts event and calls cancelByAppointmentId(appointmentId).",
        "• Any PENDING reminder records are immediately transitioned to CANCELLED.",
        "• Subsequent scheduled sweeps bypass CANCELLED tasks, guaranteeing no ghost alerts are sent.",
    ], (239, 246, 255), (59, 130, 246), (30, 58, 138))

    # Audit & Architectural Disclosures
    draw_panel(draw, fonts, (60, 1420, 2440, 1710), "OPERATIONAL AUDIT, CONCURRENCY LIMITATIONS & ARCHITECTURAL DISCLOSURES", "Strict compliance with assignment requirements", (248, 250, 252), (203, 213, 225), (30, 41, 59))
    draw_card(draw, fonts, (90, 1475, 840, 1685), "1. No Unmanaged Daemon Threads", [
        "• Serverless Next.js processes do NOT run unmanaged background daemon timers in process memory.",
        "• The reminder processing engine executes strictly upon on-demand HTTP invocation of",
        "  POST /api/reminders/process.",
        "• In production, this route is triggered by an external scheduler (cron, EventBridge, Vercel Cron).",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (870, 1475, 1620, 1685), "2. Delivery Guarantees (At-Least-Once)", [
        "• Third-party telecom networks (Twilio, SMS gateways, SMTP) do not participate in distributed",
        "  database two-phase commit transactions.",
        "• Application architecture guarantees At-Least-Once delivery with deterministic idempotency keys",
        "  (${appointmentId}_${windowType}_${scheduleEpoch}) to eliminate duplicate sends at the app layer.",
    ], (248, 250, 252), (148, 163, 184))
    draw_card(draw, fonts, (1650, 1475, 2410, 1685), "3. Concurrency Limitations of File Store", [
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
    print("All 4 PNG diagrams enhanced and rendered successfully!")

if __name__ == "__main__":
    render_all()
