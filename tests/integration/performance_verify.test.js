const assert = require('assert');

async function runTests() {
    const results = { total: 0, passed: 0 };

    async function test(name, fn) {
        results.total++;
        try {
            await fn();
            console.log(`✅ ${name}`);
            results.passed++;
        } catch (e) {
            console.log(`❌ ${name}`);
            console.error(e);
        }
    }

    await test('Dashboard Stats: Admin', async () => {
        const response = await global.invokeIPC('get-dashboard-stats', { role: 'admin' });
        assert.strictEqual(response.success, true);
        assert.ok('total_students' in response.data);
        assert.ok('total_instructors' in response.data);
        assert.ok('exams_today' in response.data);
        assert.ok('monthly_revenue' in response.data);
        assert.ok('pass_rate' in response.data);
    });

    await test('Dashboard Stats: Instructor', async () => {
        // First need an instructor user
        const instructorData = {
            username: 'perf_inst',
            password: 'password123',
            email: 'perf_inst@example.com',
            firstName: 'Perf',
            lastName: 'Inst',
            phone: '987654321',
            license: 'LIC-PERF',
            specialization_id: 1,
            certification_id: 1,
            experience: 5
        };
        const addResponse = await global.invokeIPC('add-instructor', instructorData);
        const instructorUserId = addResponse.data.user_id;

        const response = await global.invokeIPC('get-dashboard-stats', { role: 'instructor', userId: instructorUserId });
        assert.strictEqual(response.success, true);
        assert.ok('lessons_today' in response.data);
        assert.ok('assigned_students' in response.data);
        assert.ok('upcoming_lessons' in response.data);
    });

    await test('Dashboard Stats: Student', async () => {
        // First need a student user
        const studentData = {
            username: 'perf_student',
            password: 'password123',
            email: 'perf_student@example.com',
            firstName: 'Perf',
            lastName: 'Student',
            phone: '123456789',
            address: '123 Perf St',
            packageId: 1
        };
        const addResponse = await global.invokeIPC('add-student', studentData);
        const studentUserId = addResponse.data.user_id;

        const response = await global.invokeIPC('get-dashboard-stats', { role: 'student', userId: studentUserId });
        assert.strictEqual(response.success, true);
        assert.ok('lessons_attended' in response.data);
        assert.ok('exams_taken' in response.data);
        assert.ok('success_rate' in response.data);
    });

    await test('Financial Stats', async () => {
        const response = await global.invokeIPC('get-financial-stats');
        assert.strictEqual(response.success, true);
        assert.ok('totalRevenue' in response.data);
        assert.ok('totalExpenses' in response.data);
        assert.ok('chartData' in response.data);
        assert.strictEqual(response.data.chartData.labels.length, 6);
        assert.strictEqual(response.data.chartData.revenue.length, 6);
        assert.strictEqual(response.data.chartData.expenses.length, 6);
    });

    return results;
}

module.exports = { runTests };
