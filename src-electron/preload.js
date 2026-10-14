const { contextBridge, ipcRenderer } = require('electron');

// Explicit allowlist of authorized IPC channels for security hardening
const ALLOWED_INVOKE_CHANNELS = new Set([
  // Window controls
  'window:minimize',
  'window:maximize',
  'window:close',

  // Auth & Session
  'login',
  'logout',
  'get-current-user',
  'get-user-permissions',
  'get-user-info',
  'update-user',
  'update-user-password',
  'delete-account',
  'get-all-users',
  'delete-user',
  'forgot-password',
  'reset-password',

  // Dashboard & Analytics
  'get-dashboard-stats',
  'get-question-stats',
  'get-student-progress',

  // Students & Instructors
  'get-students',
  'add-student',
  'update-student',
  'delete-student',
  'archive-student',
  'get-instructors',
  'add-instructor',
  'update-instructor',

  // Examinations & Questions
  'get-questions',
  'add-question',
  'update-question',
  'delete-question',
  'import-questions',
  'export-questions',
  'get-exams',
  'add-exam',
  'update-exam',
  'delete-exam',
  'get-exam-questions',
  'get-exam-statistics',
  'get-exam-timeframe',
  'set-exam-timeframe',
  'auto-allocate-exams',
  'save-exam-progress',
  'recover-exam-progress',
  'get-learning-analytics',
  'get-exam-history',

  // Lessons & Scheduling
  'get-lessons',
  'add-lesson',
  'update-lesson',
  'delete-lesson',

  // Fleet & Vehicles
  'get-vehicles',
  'add-vehicle',
  'update-vehicle',
  'log-vehicle-activity',
  'report-vehicle-issue',
  'log-vehicle-maintenance',

  // Finances & Invoices
  'get-financial-stats',
  'get-payments',
  'add-payment',
  'issue-invoice',
  'get-invoices',
  'get-transactions',
  'update-payment-status',
  'process-salary',
  'record-expense',

  // Admin, System & Licensing
  'add-user',
  'get-audit-logs',
  'get-license-status',
  'activate-license',
  'create-backup',
  'restore-backup',
  'verify-database-integrity',
  'get-sync-status',
  'trigger-sync'
]);

const ALLOWED_LISTEN_CHANNELS = new Set([
  'sync-status-changed',
  'notification-received',
  'license-expired'
]);

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, ...args) => {
    if (!ALLOWED_INVOKE_CHANNELS.has(channel)) {
      console.error(`[IPC Security] Blocked unauthorized invoke channel: ${channel}`);
      return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`));
    }
    return ipcRenderer.invoke(channel, ...args);
  },
  on: (channel, callback) => {
    if (!ALLOWED_LISTEN_CHANNELS.has(channel)) {
      console.error(`[IPC Security] Blocked unauthorized listen channel: ${channel}`);
      return;
    }
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  }
});
