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

    await test('Add Student: Flow from IPC to DB', async () => {
        const studentData = {
            username: 'student1',
            password: 'password123',
            email: 'student1@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '123456789',
            address: '123 Main St',
            packageId: 1
        };

        const response = await global.invokeIPC('add-student', studentData);
        assert.strictEqual(response.success, true, 'Response should be success');
        assert.strictEqual(response.data.firstName, 'John');
        assert.ok(response.data.id, 'Should have an ID');

        // Verify in DB via get-students
        const getResponse = await global.invokeIPC('get-students', { role: 'admin' });
        assert.strictEqual(getResponse.success, true);
        const student = getResponse.data.find(s => s.email === 'student1@example.com');
        assert.ok(student, 'Student should be found in DB');
        assert.strictEqual(student.firstName, 'John');
        assert.strictEqual(student.address, '123 Main St');
    });

    await test('Add Instructor: Flow from IPC to DB', async () => {
        const instructorData = {
            username: 'inst1',
            password: 'password123',
            email: 'inst1@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '987654321',
            license: 'LIC-001',
            specialization_id: 1,
            certification_id: 1,
            experience: 5
        };

        const response = await global.invokeIPC('add-instructor', instructorData);
        assert.strictEqual(response.success, true);
        assert.strictEqual(response.data.firstName, 'Jane');
        assert.ok(response.data.id);

        const getResponse = await global.invokeIPC('get-instructors');
        const inst = getResponse.data.find(i => i.email === 'inst1@example.com');
        assert.ok(inst);
        assert.strictEqual(inst.license_number, 'LIC-001');
    });

    await test('Add Admin: Flow via add-user', async () => {
        const adminData = {
            username: 'newadmin',
            password: 'password123',
            email: 'admin2@example.com',
            firstName: 'Boss',
            lastName: 'Admin',
            role: 'admin'
        };

        const response = await global.invokeIPC('add-user', adminData);
        assert.strictEqual(response.success, true);
        assert.strictEqual(response.data.username, 'newadmin');

        const getResponse = await global.invokeIPC('get-all-users');
        const admin = getResponse.data.find(u => u.username === 'newadmin');
        assert.ok(admin);
        assert.strictEqual(admin.role, 'admin');
    });

    await test('Add Lesson: Flow from IPC to DB', async () => {
        const lessonData = {
            title: 'Driving Lesson 1',
            subject: 'Practical',
            startTime: new Date(Date.now() + 86400000).toISOString(),
            durationMinutes: 60,
            instructorId: 1,
            studentId: 1,
            location: 'Parking Lot',
            status: 'pending',
            type: 'private'
        };

        const response = await global.invokeIPC('add-lesson', lessonData);
        assert.strictEqual(response.success, true);
        assert.strictEqual(response.data.title, 'Driving Lesson 1');

        const getResponse = await global.invokeIPC('get-lessons', {});
        const lesson = getResponse.data.find(l => l.title === 'Driving Lesson 1');
        assert.ok(lesson);
        assert.strictEqual(lesson.location, 'Parking Lot');
    });

    await test('New Vehicle: Flow from IPC to DB', async () => {
        const vehicleData = {
            make: 'Toyota',
            model: 'Camry',
            year: 2022,
            registration: 'TEST-123',
            type: 'car',
            status: 'active'
        };

        const response = await global.invokeIPC('add-vehicle', vehicleData);
        assert.strictEqual(response.success, true);
        assert.strictEqual(response.data.registration, 'TEST-123');

        const getResponse = await global.invokeIPC('get-vehicles');
        const vehicle = getResponse.data.find(v => v.registration === 'TEST-123');
        assert.ok(vehicle);
    });

    await test('Log Vehicle Activity & Issue', async () => {
        // Log Activity
        const activityData = {
            vehicleId: 1,
            instructorId: 1, // User ID for instructor 1
            mileage: 5000,
            fuelLevel: 80,
            notes: 'Refueled'
        };

        const actResponse = await global.invokeIPC('log-vehicle-activity', activityData);
        assert.strictEqual(actResponse.success, true);

        // Verify vehicle was updated
        const getVehicles = await global.invokeIPC('get-vehicles');
        const vehicle = getVehicles.data.find(v => v.id === 1);
        assert.strictEqual(vehicle.mileage, 5000);
        assert.strictEqual(vehicle.fuel_level, 80);

        // Report Issue
        const issueData = {
            vehicleId: 1,
            instructorId: 1,
            description: 'Flat tire',
            severity: 'medium'
        };

        const issueResponse = await global.invokeIPC('report-vehicle-issue', issueData);
        assert.strictEqual(issueResponse.success, true);
        assert.strictEqual(issueResponse.data.description, 'Flat tire');
    });

    await test('Log Expense: Flow from IPC to DB', async () => {
        const expenseData = {
            amount: 150.50,
            category: 'maintenance',
            method: 'card',
            description: 'Brake repair',
            vehicleId: 1
        };

        const response = await global.invokeIPC('record-expense', expenseData);
        assert.strictEqual(response.success, true);

        const getResponse = await global.invokeIPC('get-transactions', {});
        const expense = getResponse.data.find(t => t.description === 'Brake repair');
        assert.ok(expense);
        assert.strictEqual(Number(expense.amount), 150.50);
        assert.strictEqual(expense.category, 'maintenance');
    });

    return results;
}

module.exports = { runTests };
