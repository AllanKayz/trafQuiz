const { ipcMain } = require('electron');
const { sequelize } = require('../database');

ipcMain.handle('get-financial-stats', async () => {
    try {
        const [revenue] = await sequelize.query('SELECT SUM(amount) as total FROM payments WHERE type="income"');
        const [expenses] = await sequelize.query('SELECT SUM(amount) as total FROM payments WHERE type="expense"');
        
        return {
            success: true,
            data: {
                totalRevenue: revenue[0]?.total || 0,
                totalExpenses: expenses[0]?.total || 0,
                netProfit: (revenue[0]?.total || 0) - (expenses[0]?.total || 0),
                chartData: { labels: [], revenue: [], expenses: [] } // Placeholder
            }
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-payment', async (event, data) => {
    try {
        const transactionId = `TXN-${Date.now().toString(16).toUpperCase()}`;
        await sequelize.query(`
            INSERT INTO payments (student_id, amount, type, category, method, transaction_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [data.studentId, data.amount, 'income', 'student_payment', data.method, transactionId, 'completed']
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});
