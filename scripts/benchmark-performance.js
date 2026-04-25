const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const electron = require('electron');

async function benchmark() {
  console.log('⚡ Bolt Benchmark: Starting performance measurement...');

  try {
    await initTestDb();
    loadHandlers();

    // Helper to invoke handler and measure time
    async function measure(name, channel, params = {}) {
      const start = Date.now();
      const result = await global.invokeIPC(channel, params);
      const end = Date.now();
      console.log(`📊 ${name}: ${end - start}ms`);
      return end - start;
    }

    // Need to establish a session for handlers that check authentication
    const { setSession } = require('../src-electron/utils/session');
    setSession({ id: 1, role: 'admin', username: 'admin' });

    console.log('\n--- Baseline Latencies ---');
    await measure('Financial Stats', 'get-financial-stats');
    await measure('Dashboard Stats (Admin)', 'get-dashboard-stats', { role: 'admin' });

    // For student progress, we need a student ID
    const { get } = require('../src-electron/db');
    // Seed a student if none exists
    const { run } = require('../src-electron/db');
    await run('INSERT INTO users (username, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      ['teststudent', 'pass', 'student', 'Test', 'Student']);
    const user = await get('SELECT id FROM users WHERE username = ?', ['teststudent']);
    await run('INSERT INTO students (user_id, status) VALUES (?, ?)', [user.id, 'active']);

    const student = await get('SELECT id FROM students LIMIT 1');
    if (student) {
      await measure('Student Progress', 'get-student-progress', { studentId: student.id });
    }

    console.log('\n⚡ Benchmark complete.');
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
  } finally {
    process.exit(0);
  }
}

benchmark();
