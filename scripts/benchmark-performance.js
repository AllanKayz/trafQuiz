const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { setSession } = require('../src-electron/utils/session');
const { Student } = require('../src-electron/models/StudentModel');
const { Instructor } = require('../src-electron/models/InstructorModel');
const { User } = require('../src-electron/models/UserModel');
const Payment = require('../src-electron/models/payment');

async function benchmark() {
    console.log('--- Starting Performance Benchmark ---');
    try {
        await initTestDb();
        loadHandlers();

        // Seed some data for benchmarking
        const adminUser = await User.create({ username: 'admin_bench', password: 'password', role: 'admin' });
        const studentUser = await User.create({ username: 'student_bench', password: 'password', role: 'student' });
        const instructorUser = await User.create({ username: 'instructor_bench', password: 'password', role: 'instructor' });

        const student = await Student.create({ user_id: studentUser.id, status: 'active' });
        const instructor = await Instructor.create({ user_id: instructorUser.id, license_number: 'BENCH123', experience: 5 });

        // Seed payments
        const payments = [];
        const now = new Date();
        for (let i = 0; i < 2000; i++) {
            const paymentDate = new Date();
            paymentDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12));

            payments.push({
                amount: Math.random() * 100,
                type: i % 2 === 0 ? 'income' : 'expense',
                payment_date: paymentDate,
                transaction_id: `TXN-BENCH-${i}`,
                student_id: student.id,
                status: 'completed'
            });
        }
        await Payment.bulkCreate(payments);

        const runBenchmark = async (name, handler, params) => {
            const iterations = 100;
            // Warmup
            for (let i = 0; i < 10; i++) {
                await global.invokeIPC(handler, params);
            }

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                await global.invokeIPC(handler, params);
            }
            const end = performance.now();
            console.log(`${name}: ${((end - start) / iterations).toFixed(4)}ms per call (avg over ${iterations} iterations)`);
        };

        // Admin Benchmark
        setSession({ user: adminUser });
        await runBenchmark('Admin Dashboard Stats', 'get-dashboard-stats', { role: 'admin', userId: adminUser.id });
        await runBenchmark('Financial Stats', 'get-financial-stats', {});

        // Student Benchmark
        setSession({ user: studentUser });
        await runBenchmark('Student Dashboard Stats', 'get-dashboard-stats', { role: 'student', userId: studentUser.id });

        // Instructor Benchmark
        setSession({ user: instructorUser });
        await runBenchmark('Instructor Dashboard Stats', 'get-dashboard-stats', { role: 'instructor', userId: instructorUser.id });

    } catch (error) {
        console.error('Benchmark failed:', error);
    } finally {
        process.exit(0);
    }
}

benchmark();
