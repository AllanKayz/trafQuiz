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

    await test('Logout works and clears session', async () => {
        await global.invokeIPC('logout');
        const response = await global.invokeIPC('get-all-users');
        assert.strictEqual(response.success, false);
        assert.strictEqual(response.message, 'Unauthorized: Admin access required');
    });

    await test('Generic error message on login failure (User not found)', async () => {
        const response = await global.invokeIPC('login', { username: 'nonexistent', password: 'password' });
        assert.strictEqual(response.success, false);
        assert.strictEqual(response.message, 'Invalid credentials');
    });

    await test('Generic error message on login failure (Wrong password)', async () => {
        const response = await global.invokeIPC('login', { username: 'admin', password: 'wrongpassword' });
        assert.strictEqual(response.success, false);
        assert.strictEqual(response.message, 'Invalid credentials');
    });

    await test('Unauthorized access to admin-only handler (get-financial-stats)', async () => {
        await global.invokeIPC('logout');
        const response = await global.invokeIPC('get-financial-stats');
        assert.strictEqual(response.success, false);
        assert.strictEqual(response.message, 'Unauthorized');
    });

    await test('IDOR protection: student cannot update other user', async () => {
        // Login as admin to get admin user details and create test student
        const adminLogin = await global.invokeIPC('login', { username: 'admin', password: '123456' });
        assert.strictEqual(adminLogin.success, true);

        const allUsers = await global.invokeIPC('get-all-users');
        assert.strictEqual(allUsers.success, true);
        const adminUser = allUsers.data.find(u => u.username === 'admin');

        const studentUsername = 'test_student_idor';
        const studentPassword = 'password123';
        await global.invokeIPC('add-user', {
            username: studentUsername,
            password: studentPassword,
            email: 'idor_student@example.com',
            firstName: 'Test',
            lastName: 'Student',
            role: 'student'
        });

        // Login as student
        const studentLogin = await global.invokeIPC('login', { username: studentUsername, password: studentPassword });
        assert.strictEqual(studentLogin.success, true);

        // Try to update admin's email as student
        const response = await global.invokeIPC('update-user', { id: adminUser.id, email: 'hacked@example.com' });
        assert.strictEqual(response.success, false);
        assert.strictEqual(response.message, 'Unauthorized: Cannot update other users');
    });

    return results;
}

module.exports = { runTests };
