const { StandardValidatorFactory, EmergencyValidatorFactory } = require('../snippet/factory');

function test() {
    let passed = 0;
    let total = 0;

    const stdFactory = new StandardValidatorFactory();
    const emgFactory = new EmergencyValidatorFactory();

    if (stdFactory.validateAppointment("pat_1", "Regular checkup")) passed++;
    total++;

    if (!stdFactory.validateAppointment("pat_1", "Short")) passed++;
    total++;

    if (!stdFactory.validateAppointment("", "Regular checkup")) passed++;
    total++;

    if (emgFactory.validateAppointment("pat_2", "Short")) passed++;
    total++;

    if (!emgFactory.validateAppointment(null, "Heart attack")) passed++;
    total++;

    console.log(`${passed}/${total} passed`);
    process.exit(passed === total ? 0 : 1);
}
test();
