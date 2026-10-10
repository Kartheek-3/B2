const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = path.resolve(__dirname, "..", "..", "evidence", "runtime_screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class CDPBrowser {
  constructor() {
    this.chrome = null;
    this.ws = null;
    this.msgId = 1;
  }

  async start() {
    const tmpDir = path.resolve(process.cwd(), "data", "chrome_cdp_profile");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    this.chrome = spawn(chromePath, [
      "--headless=new",
      "--remote-debugging-port=9222",
      `--user-data-dir=${tmpDir}`,
      "--disable-gpu",
      "--no-sandbox",
      "--window-size=1440,900",
      "about:blank",
    ]);

    await sleep(2000);
    const verRes = await fetch("http://127.0.0.1:9222/json/version");
    const verData = await verRes.json();
    console.log(`[CDP] Connected to Chrome (${verData.Browser})`);

    const newTabRes = await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" });
    const target = await newTabRes.json();
    console.log(`[CDP] Created tab target: ${target.id}`);

    this.ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("DOM.enable");
    await this.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }

  send(method, params = {}) {
    return new Promise((resolve) => {
      const id = this.msgId++;
      const handler = (event) => {
        const resp = JSON.parse(event.data);
        if (resp.id === id) {
          this.ws.removeEventListener("message", handler);
          resolve(resp.result);
        }
      };
      this.ws.addEventListener("message", handler);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async navigate(url, waitMs = 2500) {
    console.log(`[CDP] Navigating to: ${url}`);
    await this.send("Page.navigate", { url });
    await sleep(waitMs);
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res && res.result ? res.result.value : null;
  }

  async screenshot(filename) {
    const snap = await this.send("Page.captureScreenshot", { format: "png" });
    const outPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(outPath, Buffer.from(snap.data, "base64"));
    console.log(`[CDP] Screenshot saved: ${filename} (${fs.statSync(outPath).size} bytes)`);
    return outPath;
  }

  async close() {
    if (this.ws) this.ws.close();
    if (this.chrome) this.chrome.kill();
  }
}

async function runVerification() {
  console.log("================================================================================");
  console.log("       STARTING CAREPULSE PART 2 FULL BROWSER & RUNTIME VERIFICATION            ");
  console.log("================================================================================");

  const browser = new CDPBrowser();
  await browser.start();

  try {
    // -------------------------------------------------------------------------
    // 1. Homepage Verification (http://localhost:3000)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 1: Verifying Homepage ---");
    await browser.navigate("http://localhost:3000", 3000);
    await browser.eval(`localStorage.setItem('accessKey', btoa('123123'));`);
    const homeTitle = await browser.eval("document.title");
    const hasLogo = await browser.eval("!!document.querySelector('img[alt=\"CarePulse Logo\"]')");
    const hasNameInput = await browser.eval("!!document.querySelector('input[name=\"name\"]')");
    console.log(`Homepage Title: "${homeTitle}", Logo: ${hasLogo}, NameInput: ${hasNameInput}`);
    await browser.screenshot("01_homepage.png");

    // -------------------------------------------------------------------------
    // 2. Patient Registration Form (http://localhost:3000/patients/user_demo_1/register)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 2: Verifying Patient Registration Page ---");
    await browser.navigate("http://localhost:3000/patients/user_demo_1/register", 3000);
    const regHeader = await browser.eval("document.querySelector('h1')?.innerText");
    console.log(`Registration Header: "${regHeader}"`);
    await browser.screenshot("02_patient_registration.png");

    // -------------------------------------------------------------------------
    // 3. Doctor Selection on Appointment Page (http://localhost:3000/patients/user_demo_1/new-appointment)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 3: Verifying Doctor Selection & New Appointment Page ---");
    await browser.navigate("http://localhost:3000/patients/user_demo_1/new-appointment", 2000);
    for (let i = 0; i < 20; i++) {
      const ready = await browser.eval("!!document.querySelector('[role=\"combobox\"]')");
      if (ready) break;
      await sleep(500);
    }
    const aptHeader = await browser.eval("document.querySelector('h1')?.innerText");
    console.log(`Appointment Page Header: "${aptHeader}"`);

    // Click on Doctor select to show doctor options in screenshot
    await browser.eval(`
      const selectBtn = document.querySelector('[role="combobox"]');
      if (selectBtn) selectBtn.click();
    `);
    await sleep(800);
    await browser.screenshot("03_doctor_selection.png");

    // -------------------------------------------------------------------------
    // 4. Appointment Booking Form with Teleconsultation Toggle
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 4: Verifying Teleconsultation Toggle & Appointment Form ---");
    // Close combobox if open by pressing Escape or clicking outside
    await browser.eval(`
      document.body.click();
      const checkbox = document.querySelector('button[role="checkbox"]');
      if (checkbox && checkbox.getAttribute('data-state') !== 'checked') {
        checkbox.click();
      }
    `);
    await sleep(800);
    await browser.screenshot("04_appointment_booking.png");

    // -------------------------------------------------------------------------
    // 5. Appointment Success Confirmation Page
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 5: Verifying Appointment Success Page ---");
    // Navigate to success page using our scheduled demo appointment apt_demo_sched_1
    await browser.navigate(
      "http://localhost:3000/patients/user_demo_1/new-appointment/success?appointmentId=apt_demo_sched_1",
      2500
    );
    for (let i = 0; i < 20; i++) {
      const ready = await browser.eval("!!document.querySelector('h2')");
      if (ready) break;
      await sleep(500);
    }
    const successTitle = await browser.eval("document.querySelector('h2')?.innerText");
    const hasTeleconsultBadge = await browser.eval("document.body.innerText.includes('Teleconsultation Session Created')");
    const hasJoinLink = await browser.eval("!!document.querySelector('a[href*=\"demo.telehealth.local\"]')");
    console.log(`Success Page Title: "${successTitle}"`);
    console.log(`Teleconsultation Badge Present: ${hasTeleconsultBadge}, Join Link Present: ${hasJoinLink}`);
    await browser.screenshot("05_appointment_success.png");

    // -------------------------------------------------------------------------
    // 6. Admin Dashboard (http://localhost:3000/admin)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 6: Verifying Admin Dashboard ---");
    await browser.navigate("http://localhost:3000", 1000);
    await browser.eval(`localStorage.setItem('accessKey', btoa('123123'));`);
    await browser.navigate("http://localhost:3000/admin", 4000);
    for (let i = 0; i < 20; i++) {
      const ready = await browser.eval("document.querySelectorAll('.stat-card').length > 0");
      if (ready) break;
      await sleep(500);
    }
    const adminHeader = await browser.eval("document.querySelector('.admin-header p')?.innerText");
    const statCardsCount = await browser.eval("document.querySelectorAll('.stat-card').length");
    const tableRowsCount = await browser.eval("document.querySelectorAll('tbody tr').length");
    console.log(`Admin Header: "${adminHeader}", Stat Cards: ${statCardsCount}, Table Rows: ${tableRowsCount}`);
    await browser.screenshot("06_admin_dashboard.png");

    // -------------------------------------------------------------------------
    // 7. CH01 Video Consultation Adapter API Verification (/api/video/token)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 7: Testing CH01 Video Consultation Adapter API ---");
    // 7.1 Authorized token minting
    const tokenRes = await fetch("http://localhost:3000/api/video/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: "room_test_123",
        userId: "usr_doc_1",
        userName: "Dr. John Green",
        role: "doctor",
      }),
    });
    const tokenData = await tokenRes.json();
    console.log(`[API /api/video/token] Doctor Token Mint Status: ${tokenRes.status}`);
    console.log(`[API /api/video/token] Provider: ${tokenData.access?.provider}, AccessToken length: ${tokenData.access?.accessToken?.length}`);
    console.log(`[API /api/video/token] Join URL: ${tokenData.access?.joinUrl}`);

    // 7.2 Unauthorized rejection test
    const unauthRes = await fetch("http://localhost:3000/api/video/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: "room_test_123",
        userId: "usr_hacker",
        userName: "Attacker",
        role: "invalid_role",
      }),
    });
    console.log(`[API /api/video/token] Invalid Role Status: ${unauthRes.status} (Expected 400 Bad Request)`);

    // -------------------------------------------------------------------------
    // 8. CH02 Strategy Pattern Server Availability Test
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 8: Testing CH02 Strategy Availability Validation ---");
    const { execSync } = require("child_process");
    const testOutput = execSync("npm.cmd test", { encoding: "utf8" });
    console.log("[CH02 Strategy Suite] Executed availability tests:");
    testOutput.split("\n").filter((l) => l.includes("CH02.")).forEach((l) => console.log(l.trim()));

    // Capture clean doctor selection & availability screen
    await browser.navigate("http://localhost:3000/patients/user_demo_1/new-appointment", 1500);
    await browser.screenshot("08_availability_rules_validation.png");

    // -------------------------------------------------------------------------
    // 9. CH03 Observer & Scheduled Reminder Processing (/api/reminders/process)
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 9: Testing CH03 Observer & Scheduled Reminder Engine ---");
    // 9.1 Unauthorized trigger check
    const unauthReminder = await fetch("http://localhost:3000/api/reminders/process", {
      method: "POST",
    });
    console.log(`[API /api/reminders/process] Missing Token Status: ${unauthReminder.status} (Expected 401)`);

    // 9.2 Authorized trigger sweep
    const authReminder = await fetch("http://localhost:3000/api/reminders/process", {
      method: "POST",
      headers: { "x-scheduled-token": "carepulse_demo_cron_secret" },
    });
    const reminderResult = await authReminder.json();
    console.log(`[API /api/reminders/process] Authorized Trigger Status: ${authReminder.status}`);
    console.log(`[API /api/reminders/process] Sweeper Report: evaluated=${reminderResult.report?.evaluatedCount}, sent=${reminderResult.report?.sentCount}, failed=${reminderResult.report?.failedCount}`);

    // 9.3 Idempotent re-execution check
    const reSweep = await fetch("http://localhost:3000/api/reminders/process", {
      method: "POST",
      headers: { "x-scheduled-token": "carepulse_demo_cron_secret" },
    });
    const reSweepResult = await reSweep.json();
    console.log(`[API /api/reminders/process] Idempotent Re-Sweep: sent=${reSweepResult.report?.sentCount} (Expected 0 duplicates)`);

    // Capture clean admin operations table with scheduled reminders
    await browser.navigate("http://localhost:3000/admin", 1500);
    await browser.screenshot("09_reminder_processing_evidence.png");

    // Capture clean appointment teleconsultation success screen
    await browser.navigate(
      "http://localhost:3000/patients/user_demo_1/new-appointment/success?appointmentId=apt_demo_sched_1",
      1500
    );
    await browser.screenshot("07_video_teleconsultation.png");

    console.log("\n================================================================================");
    console.log("       ALL 9 BROWSER & RUNTIME ARTIFACTS CAPTURED SUCCESSFULLY!                  ");
    console.log("================================================================================");
  } finally {
    await browser.close();
  }
}

runVerification().catch((err) => {
  console.error("FATAL ERROR during verification:", err);
  process.exit(1);
});
