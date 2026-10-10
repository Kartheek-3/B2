const { AppointmentContext } = require('../snippet/state');

function test() {
    let passed = 0;
    let total = 0;

    const app1 = new AppointmentContext("app1");
    
    // 1
    app1.schedule();
    if (app1.getStatus() === "scheduled") passed++;
    total++;

    // 2
    app1.cancel("Patient");
    if (app1.getStatus() === "cancelled") passed++;
    total++;

    // 3
    try { app1.cancel("Again"); } 
    catch (e) { passed++; }
    total++;

    // 4
    try { app1.schedule(); } 
    catch (e) { passed++; }
    total++;

    // 5
    const app2 = new AppointmentContext("app2");
    app2.cancel("Doctor");
    if (app2.getStatus() === "cancelled" && app2.cancellationReason === "Doctor") passed++;
    total++;

    console.log(`${passed}/${total} passed`);
    process.exit(passed === total ? 0 : 1);
}
test();
