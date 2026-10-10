const { AppwriteClientManager } = require('../snippet/singleton');

function test() {
    let passed = 0;
    let total = 0;

    AppwriteClientManager.resetInstanceForTesting();
    const inst1 = new AppwriteClientManager();
    const inst2 = new AppwriteClientManager();

    if (inst1 === inst2) passed++;
    total++;

    if (!inst1.isConfigured()) passed++;
    total++;

    console.log(`${passed}/${total} passed`);
    process.exit(passed === total ? 0 : 1);
}
test();
