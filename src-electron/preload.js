const { contextBridge, ipcRenderer } = require('electron');

const VALID_CHANNELS = [
    'login', 'logout', 'get-user-info', 'update-user', 'update-user-password', 'delete-account', 'get-all-users', 'add-user', 'delete-user',
    'get-dashboard-stats', 'get-question-stats', 'get-questions', 'add-question', 'update-question', 'bulk-add-questions', 'delete-question',
    'get-students', 'add-student', 'update-student', 'delete-student',
    'get-instructors', 'add-instructor', 'update-instructor', 'delete-instructor',
    'get-lessons', 'add-lesson', 'update-lesson', 'delete-lesson',
    'get-specializations', 'add-specialization', 'update-specialization', 'delete-specialization',
    'get-certifications', 'add-certification', 'update-certification', 'delete-certification',
    'get-packages', 'update-package', 'get-vehicles', 'add-vehicle', 'update-vehicle', 'delete-vehicle',
    'get-question-categories', 'add-category', 'update-category', 'delete-category',
    'get-exam-questions', 'get-exam-timeframe', 'set-exam-timeframe', 'add-exam', 'get-exams', 'update-exam', 'delete-exam', 'get-exam-statistics', 'auto-allocate-exams', 'get-exam-duration',
    'add-payment', 'get-transactions', 'update-payment-status', 'get-financial-stats', 'process-salary', 'record-expense',
    'get-conversations', 'get-messages', 'send-message', 'mark-messages-read', 'upload-attachment',
    'get-student-progress', 'forgot-password', 'reset-password', 'window:minimize', 'window:maximize', 'window:close',
    'seed-lessons', 'check-lessons', 'get-lesson', 'log-vehicle-activity', 'report-vehicle-issue'
];

const api = {};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
VALID_CHANNELS.forEach(channel => {
    const funcName = channel.replace(':', '_');
    api[funcName] = (...args) => ipcRenderer.invoke(channel, ...args);
});

api.on = (channel, callback) => {
    const validEvents = ['data-change', 'new-message', 'mark-read'];
    if (validEvents.includes(channel)) {
        const subscription = (event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    }
};

contextBridge.exposeInMainWorld('electronAPI', api);
