const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { setSession } = require('../src-electron/utils/session');
const { User } = require('../src-electron/models/UserModel');
const { Question } = require('../src-electron/models/QuestionModel');
const { sequelize } = require('../src-electron/database');

async function seedManyQuestions(count) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        questions.push({
            question_text: `Question ${i}?`,
            option_a: 'A',
            option_b: 'B',
            option_c: 'C',
            answer: 'A',
            exam_id: 1
        });
    }
    await Question.bulkCreate(questions, { logging: false });
}

async function benchmark(name, fn) {
    const start = process.hrtime.bigint();
    const res = await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000;
    console.log(`${name}: ${duration.toFixed(2)}ms (items: ${res.data?.length || 'N/A'})`);
    return duration;
}

async function run() {
    await initTestDb();
    loadHandlers();

    const adminUser = await User.create({ username: 'admin_perf_3', role: 'admin', password: 'password' });
    setSession({ id: adminUser.id, role: 'admin' });

    console.log('Seeding 2000 questions...');
    await seedManyQuestions(2000);

    await benchmark('get-questions', () => global.invokeIPC('get-questions'));

    await sequelize.close();
}

run().catch(console.error);
