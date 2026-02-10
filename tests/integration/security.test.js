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
        // Assume we were logged in from previous tests
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
        // Login as student1 (created in core.test.js or migrations)
        // First we need to know student1's user id.
        // In core.test.js, we added student1.
        // Let's login as admin first to get student1's id
        await global.invokeIPC('login', { username: 'admin', password: '123' }); // Try 123 if 123456 fails in some envs, but let's stick to what works
        await global.invokeIPC('login', { username: 'admin', password: '123456' });

        const allUsers = await global.invokeIPC('get-all-users');
        const student1 = allUsers.data.find(u => u.username === 'student1');
        const adminUser = allUsers.data.find(u => u.username === 'admin');

        // Login as student1
        await global.invokeIPC('login', { username: 'student1', password: 'password123' });

        // Try to update admin's email
        const response = await global.invokeIPC('update-user', { id: adminUser.id, email: 'hacked@example.com' });
        assert.strictEqual(response.success, false);
        assert.strictEqual(response.message, 'Unauthorized: Cannot update other users');
    });

    return results;
}

module.exports = { runTests };
