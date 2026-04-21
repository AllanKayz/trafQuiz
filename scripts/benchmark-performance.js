const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { performance } = require('perf_hooks');

async function benchmark() {
  console.log('⚡ Starting Performance Benchmark...');

  try {
    await initTestDb();
    loadHandlers();

    // Setup a session if needed (assuming some handlers check authentication)
    const { setSession } = require('../src-electron/utils/session');
    setSession({ id: 1, username: 'admin', role: 'admin' });

    const handlersToTest = [
      { channel: 'get-question-stats', params: [] },
      { channel: 'get-dashboard-stats', params: [{ role: 'admin', userId: 1 }] },
      { channel: 'get-financial-stats', params: [] },
      // Add more as needed
    ];

    for (const test of handlersToTest) {
      console.log(`\nBenchmarking: ${test.channel}`);

      // Warm up
      await global.invokeIPC(test.channel, ...test.params);

      const start = performance.now();
      const iterations = 10;
      for (let i = 0; i < iterations; i++) {
        await global.invokeIPC(test.channel, ...test.params);
      }
      const end = performance.now();

      const average = (end - start) / iterations;
      console.log(`Average Latency (${iterations} runs): ${average.toFixed(2)}ms`);
    }

    console.log('\n✅ Benchmark Complete.');
  } catch (error) {
    console.error('Benchmark failed:', error);
  } finally {
    process.exit(0);
  }
}

benchmark();
