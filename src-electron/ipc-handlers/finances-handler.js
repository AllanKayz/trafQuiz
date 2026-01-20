const { ipcMain } = require('electron');
const { query } = require('../db');

ipcMain.handle('get-financial-stats', async () => {
    try {
        const stats = await query(`
            SELECT 
                SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END) as totalRevenue,
                SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END) as totalExpenses
            FROM payments
        `);
        
        const totalRevenue = stats[0].totalRevenue || 0;
        const totalExpenses = stats[0].totalExpenses || 0;
        const netProfit = totalRevenue - totalExpenses;

        // Mock projected revenue or calculate based on pending
        const projected = await query(`
            SELECT SUM(amount) as projectedRevenue 
            FROM payments 
            WHERE type = 'income' AND status = 'pending'
        `);
        const projectedRevenue = (projected[0].projectedRevenue || 0) + totalRevenue;
        
        // Mock chart data for now or aggregate by date
        // Simple aggregation by month for chart
        const chartQuery = await query(`
             SELECT strftime('%Y-%m', payment_date) as month, 
                    SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as revenue,
                    SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
             FROM payments 
             WHERE status='completed'
             GROUP BY month
             ORDER BY month DESC
             LIMIT 6
        `);

        return {
            success: true,
            data: {
                totalRevenue,
                totalExpenses,
                netProfit,
                projectedRevenue,
                chartData: {
                    labels: chartQuery.map(c => c.month).reverse(),
                    revenue: chartQuery.map(c => c.revenue).reverse(),
                    expenses: chartQuery.map(c => c.expense).reverse()
                }
            }
        };

    } catch (error) {
        console.error('Error fetching financial stats:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-transactions', async (event, { userId, query: searchTerm } = {}) => {
    try {
        let sql = `
            SELECT p.*, 
                   s.user_id as student_user_id,
                   u_s.first_name as s_first, u_s.last_name as s_last, u_s.username as s_username,
                   i.user_id as instructor_user_id,
                   u_i.first_name as i_first, u_i.last_name as i_last, u_i.username as i_username,
                   v.make, v.model, v.registration
            FROM payments p
            LEFT JOIN students s ON p.student_id = s.id
            LEFT JOIN users u_s ON s.user_id = u_s.id
            LEFT JOIN instructors i ON p.instructor_id = i.id
            LEFT JOIN users u_i ON i.user_id = u_i.id
            LEFT JOIN vehicles v ON p.vehicle_id = v.id
            WHERE 1=1
        `;
        
        const params = [];

        // If filtering by userId (e.g. for student dashboard history)
        if (userId) {
            // Check if user is student or instructor to filter on correct ID
            // Complicated without knowing role. Let's assume passed userId matches u_s.id or u_i.id
            sql += ` AND (u_s.id = ? OR u_i.id = ?)`;
            params.push(userId, userId);
        }

        if (searchTerm) {
             sql += ` AND (p.transaction_id LIKE ? OR u_s.first_name LIKE ? OR u_s.last_name LIKE ? OR v.registration LIKE ?)`;
             const term = `%${searchTerm}%`;
             params.push(term, term, term, term);
        }

        sql += ` ORDER BY p.payment_date DESC LIMIT 50`;

        const rows = await query(sql, params);

        const formatted = rows.map(r => {
            let entityName = 'Unknown';
            if (r.student_id) entityName = `${r.s_first || ''} ${r.s_last || ''}`.trim() || r.s_username;
            else if (r.instructor_id) entityName = `${r.i_first || ''} ${r.i_last || ''}`.trim() || r.i_username;
            else if (r.vehicle_id) entityName = `${r.make} ${r.model} (${r.registration})`;
            
            return {
                ...r,
                entity_name: entityName,
                studentName: entityName, // Backward compat
                description: r.notes || r.category // Map description to notes or category
            };
        });

        return { success: true, data: formatted };
    } catch (error) {
         console.error('Error fetching transactions:', error);
         return { success: false, message: error.message };
    }
});

ipcMain.handle('update-payment-status', async (event, { id, status }) => {
    try {
        const { run } = require('../db');
        await run('UPDATE payments SET status = ? WHERE id = ?', [status, id]);
        return { success: true };
    } catch (error) {
        console.error('Error updating payment status:', error);
        return { success: false, message: error.message };
    }
});
ipcMain.handle('add-payment', async (event, data) => {
    try {
        const { run } = require('../db');
        const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
        const { userId, studentId, instructorId, vehicleId, amount, method, category, notes, status = 'completed' } = data;
        
        let targetStudentId = studentId;
        // If userId is provided, resolve studentId if not present
        if (!targetStudentId && userId) {
            const student = await require('../db').get('SELECT id FROM students WHERE user_id = ?', [userId]);
            if (student) targetStudentId = student.id;
        }

        const sql = `
            INSERT INTO payments (transaction_id, student_id, instructor_id, vehicle_id, amount, method, category, notes, status, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [transactionId, targetStudentId, instructorId, vehicleId, amount, method, category || 'student_payment', notes, status, 'income'];
        
        const result = await run(sql, params);
        return { success: true, transactionId, id: result.lastID };
    } catch (error) {
        console.error('Error adding payment:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('process-salary', async (event, data) => {
    try {
        const { run } = require('../db');
        const transactionId = 'SAL' + Date.now() + Math.floor(Math.random() * 1000);
        const { instructorId, amount, method, notes } = data;

        const sql = `
            INSERT INTO payments (transaction_id, instructor_id, amount, method, category, notes, status, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [transactionId, instructorId, amount, method, 'salary', notes, 'completed', 'expense'];
        
        const result = await run(sql, params);
        return { success: true, transactionId, id: result.lastID };
    } catch (error) {
        console.error('Error processing salary:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('record-expense', async (event, data) => {
    try {
        const { run } = require('../db');
        const transactionId = 'EXP' + Date.now() + Math.floor(Math.random() * 1000);
        const { vehicleId, amount, method, category, notes } = data;

        const sql = `
            INSERT INTO payments (transaction_id, vehicle_id, amount, method, category, notes, status, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [transactionId, vehicleId, amount, method, category || 'business_expense', notes, 'completed', 'expense'];
        
        const result = await run(sql, params);
        return { success: true, transactionId, id: result.lastID };
    } catch (error) {
        console.error('Error recording expense:', error);
        return { success: false, message: error.message };
    }
});
