# CarePulse Healthcare Appointment Application — Part 2 Local Demonstration Guide

This guide explains step-by-step how to launch, demonstrate, and verify the updated CarePulse Next.js application on a Windows laptop for **Part 2 of the 23CSE455 Design Patterns Case Study**.

---

## 1. Prerequisites

- **Operating System:** Windows 10 / 11 (PowerShell or Command Prompt)
- **Node.js:** v18.x, v20.x, or v24.x (Verified on `v24.21.0`)
- **npm:** v9.x or higher (Verified on `11.19.0`)
- **Web Browser:** Google Chrome, Microsoft Edge, or Firefox

---

## 2. Quick Start: Launching the Application

Open **Windows PowerShell** or **Command Prompt** and run:

```powershell
# 1. Navigate to the Part 2 application directory
cd "Part2/code"

# 2. Install dependencies using the clean lockfile
npm.cmd ci

# 3. Start the Next.js development server
npm.cmd run dev
```

When the server outputs:
```text
▲ Next.js 14.2.35
- Local: http://localhost:3000
✓ Ready in 2.8s
```

Open your browser to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 3. Step-by-Step Demonstration Walkthrough

### Demonstration 1: Baseline Patient Registration & Appointment Booking
1. Open `http://localhost:3000`.
2. Enter your Name (`John Doe`), Email (`johndoe@gmail.com`), and Phone (`+15551234567`). Click **Get Started**.
3. Complete the registration form on `/patients/user_demo_1/register` with emergency contacts and primary physician.
4. On `/patients/user_demo_1/new-appointment`, choose a doctor (e.g. **Dr. John Green**), select a date/time, and fill out the reason for visit.
5. Notice the **Request Video Teleconsultation** checkbox: check this box to activate CH01!
6. Click **Submit and continue**. You will see the confirmation screen with the scheduled details and teleconsultation badge.

### Demonstration 2: Admin Dashboard Access
1. Navigate to: `http://localhost:3000/admin`
2. When prompted for the Admin Passkey modal, enter:
   🔑 **`123123`**
3. The Admin Dashboard opens displaying:
   - Total scheduled, pending, and cancelled appointment metrics.
   - Comprehensive appointment table with patient names, doctors, dates, and teleconsultation badges.
   - Interactive **Schedule** and **Cancel** action modals.

### Demonstration 3: CH01 — Video Consultation Adapter Pattern
- **Target Interface:** `IVideoConsultationService`
- **Adapter:** `LocalDemonstrationVideoAdapter`
- **Adaptee:** `LocalDemonstrationVideoProvider`
- To test the token-minting endpoint directly from PowerShell:

```powershell
# Mint a clinician teleconsultation token
Invoke-RestMethod -Uri "http://localhost:3000/api/video/token" -Method POST -ContentType "application/json" -Body '{"roomId":"room_demo_123","userId":"doc_1","userName":"Dr. John Green","role":"doctor"}'
```
*Expected Output:* Status `200 OK`, signed JWT token `ldv.tok...`, and meeting URL with role `clinician`.

- To test unauthorized role rejection:
```powershell
# Invalid participant role is rejected with HTTP 400
Invoke-RestMethod -Uri "http://localhost:3000/api/video/token" -Method POST -ContentType "application/json" -Body '{"roomId":"room_demo_123","userId":"hacker","userName":"Attacker","role":"invalid_role"}' -SkipHttpErrorCheck
```

### Demonstration 4: CH02 — Flexible Doctor Availability Strategy Pattern
- **Three Interchangeable Strategies:**
  1. `StandardBusinessHoursStrategy`: Enforces Mon–Fri 09:00–17:00, lunch break (12:00–13:00), and slot conflicts.
  2. `ShiftBasedAvailabilityStrategy`: Enforces roster shifts (07:00–15:00) and shift boundary overlaps.
  3. `EmergencyOnCallAvailabilityStrategy`: Permits 24/7 emergency triage while strictly enforcing a 15-minute recovery buffer between emergency surgeries.
- All availability strategies are evaluated on the server in `appointment.actions.ts`. Invalid requests return a descriptive clinical reason.

### Demonstration 5: CH03 — Automated Reminders & Scheduled Processing
- Scheduling an appointment publishes `APPOINTMENT_SCHEDULED` on the `DomainEventBus`.
- The `ReminderSchedulerObserver` enqueues T-24h and T-2h reminders in `Part2/code/data/reminders_store.json`.
- To trigger the scheduled reminder engine sweep manually:

```powershell
# Trigger protected sweeper (Auth Header: x-scheduled-token)
Invoke-RestMethod -Uri "http://localhost:3000/api/reminders/process" -Method POST -Headers @{ "x-scheduled-token" = "carepulse_demo_cron_secret" }
```
*Expected Output:* HTTP `200 OK` with JSON sweeper report. Re-executing produces `0` duplicates due to deterministic idempotency keys (`${aptId}_${win}_${epoch}`).

---

## 4. Running the Automated Test Suites

From `Part2/code/`, execute any of the following commands:

```powershell
# 1. Run the 17 integration & pattern unit tests
npm.cmd test

# 2. Verify 100% clean TypeScript compilation (0 errors)
npx.cmd tsc --noEmit

# 3. Verify clean ESLint and formatting
npm.cmd run lint

# 4. Verify clean Next.js production build
npm.cmd run build

# 5. Run automated browser verification & recapture screenshots
node scripts/verify_and_capture.js
```

---

## 5. Environment Mode Notice

- **Appwrite Cloud Fallback:**  
  When Appwrite cloud API credentials return `401 Unauthorized` or are offline, the application automatically activates **Local Demonstration Mode** (`localDemoStore.ts`), persisting synthetic records to `Part2/code/data/demo_store.json`.
- **Zero Destructive Changes:**  
  The production Appwrite SDK integration is 100% preserved. If valid credentials are provided in `.env.local`, the application will communicate with Appwrite cloud immediately without code modifications.
- **Baseline Integrity:**  
  The baseline application under `data/code/` and all Part 1 files under `Part1/` remain 100% untouched.
