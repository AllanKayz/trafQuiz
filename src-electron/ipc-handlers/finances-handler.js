const { ipcMain } = require('electron');
const { sequelize } = require('../database');

ipcMain.handle('get-financial-stats', async () => {
    try {
        const [revenue] = await sequelize.query('SELECT SUM(amount) as total FROM payments WHERE type="income"');
        const [expenses] = await sequelize.query('SELECT SUM(amount) as total FROM payments WHERE type="expense"');
        
        return {
            success: true,
            data: {
                totalRevenue: Number(revenue[0]?.total) || 0,
                totalExpenses: Number(expenses[0]?.total) || 0,
                netProfit: (Number(revenue[0]?.total) || 0) - (Number(expenses[0]?.total) || 0),
                projectedRevenue: (Number(revenue[0]?.total) || 0) * 1.1, // Simple projection
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
        return { success: true, transactionId };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-transactions', async (event, filters) => {
    try {
        // Build query based on filters
        let query = `
            SELECT p.*, s.first_name, s.last_name 
            FROM payments p
            LEFT JOIN students s ON p.student_id = s.id
            WHERE 1=1
        `;
        const replacements = [];

        if (filters && filters.userId) {
            query += ' AND s.user_id = ?';
            replacements.push(filters.userId);
        }

        if (filters && filters.query) {
             query += ' AND (p.transaction_id LIKE ? OR p.description LIKE ?)';
             replacements.push(`%${filters.query}%`, `%${filters.query}%`);
        }

        query += ' ORDER BY p.payment_date DESC';

        const [results] = await sequelize.query(query, { replacements });
        
        // Map to expected format if needed, but for now raw is likely fine
        const data = results.map(r => ({
           id: r.id,
           transaction_id: r.transaction_id,
           payment_date: r.payment_date,
           amount: r.amount,
           status: r.status,
           method: r.method,
           type: r.type,
           category: r.category,
           description: r.description || r.category, // Fallback
           entity_name: r.first_name ? `${r.first_name} ${r.last_name}` : 'N/A'
        }));

        return { success: true, data };
    } catch (error) {
        console.error('Get transactions error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-payment-status', async (event, { id, status }) => {
    try {
        await sequelize.query('UPDATE payments SET status = ? WHERE id = ?', {
            replacements: [status, id]
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('process-salary', async (event, data) => {
    try {
        const transactionId = `SAL-${Date.now().toString(16).toUpperCase()}`;
        // data should have instructorId, amount, method, etc.
         await sequelize.query(`
            INSERT INTO payments (instructor_id, amount, type, category, method, transaction_id, status, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [data.instructorId, data.amount, 'expense', 'salary', data.method, transactionId, 'completed', `Salary Payment`]
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('record-expense', async (event, data) => {
    try {
        const transactionId = `EXP-${Date.now().toString(16).toUpperCase()}`;
         await sequelize.query(`
            INSERT INTO payments (amount, type, category, method, transaction_id, status, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [data.amount, 'expense', data.category, data.method, transactionId, 'completed', data.description || 'Business Expense']
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});
