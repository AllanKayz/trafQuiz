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

    await test('Can login admin', async () => {
        const response = await global.invokeIPC('login', { username: 'admin', password: '123' });
        // The default password hash in migration is for '123456'
        // Let's try 123456
        const response2 = await global.invokeIPC('login', { username: 'admin', password: '123456' });
        assert.strictEqual(response2.success, true);
        assert.strictEqual(response2.user.username, 'admin');
    });

    return results;
}

module.exports = { runTests };
