const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { setSession } = require('../src-electron/utils/session');
const { performance } = require('perf_hooks');

async function benchmark(name, fn) {
  const start = performance.now();
  await fn();
  const end = performance.now();
  // console.log(`${name}: ${(end - start).toFixed(4)}ms`);
  return end - start;
}

async function run() {
  console.log('--- Establishing Performance Baseline ---');
  await initTestDb();
  loadHandlers();

  // Set as admin for stats
  setSession({ id: 1, role: 'admin' });

  const handlers = [
    { name: 'get-dashboard-stats', params: { role: 'admin' } },
    { name: 'get-financial-stats', params: {} },
    { name: 'get-question-stats', params: {} },
  ];

  for (const h of handlers) {
    // Warm up
    await global.invokeIPC(h.name, h.params);

    let total = 0;
    const runs = 20;
    for (let i = 0; i < runs; i++) {
      total += await benchmark(h.name, () => global.invokeIPC(h.name, h.params));
    }
    console.log(`Average ${h.name}: ${(total / runs).toFixed(4)}ms`);
  }
}

run().catch(console.error);
