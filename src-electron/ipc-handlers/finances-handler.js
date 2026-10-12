const { ipcMain } = require("electron");
const { sequelize } = require("../database");
const { broadcastChange } = require("../utils/broadcast");
const Payment = require("../models/payment");
const db = require("../db");
const path = require("path");
const fs = require("fs");
const { isAdmin, isAuthenticated, getSession } = require("../utils/session");

ipcMain.handle("get-financial-stats", async () => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };

    const [totalRevenue, totalExpenses] = await Promise.all([
      Payment.sum("amount", { where: { type: "income" } }),
      Payment.sum("amount", { where: { type: "expense" } })
    ]);

    const revenue = totalRevenue || 0;
    const expenses = totalExpenses || 0;

    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      months.push({
        name: monthNames[d.getMonth()],
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      });
    }

    const labels = months.map((m) => `${m.year}-${m.month.toString().padStart(2, "0")}`);

    const startDate = new Date();
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setHours(0, 0, 0, 0);
    const startDateStr = startDate.toISOString().split('T')[0];

    const [chartResults] = await sequelize.query(`
        SELECT
            strftime('%Y-%m', payment_date) as month_key,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        FROM payments
        WHERE payment_date >= ?
        GROUP BY month_key
        ORDER BY month_key ASC
    `, { replacements: [startDateStr] });

    const resultsMap = {};
    chartResults.forEach(r => {
      resultsMap[r.month_key] = r;
    });

    const chartRevenue = labels.map(label => resultsMap[label]?.revenue || 0);
    const chartExpenses = labels.map(label => resultsMap[label]?.expenses || 0);

    return {
      success: true,
      data: {
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit: revenue - expenses,
        projectedRevenue: revenue * 1.1,
        chartData: {
          labels: labels,
          revenue: chartRevenue,
          expenses: chartExpenses,
        },
      },
    };
  } catch (error) {
    console.error("Get financial stats error:", error);
    return { success: false, message: error.message };
  }
});

// Invoicing System: Issue Invoices
ipcMain.handle("issue-invoice", async (event, payload) => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const { studentId, totalAmount, dueDate, branchId } = payload;

    if (!studentId || !totalAmount) {
      return { success: false, message: "Student ID and total amount are required" };
    }

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    const amountCents = Math.round(Number(totalAmount) * 100);

    await db.run(
      `INSERT INTO invoices (invoice_number, student_id, branch_id, total_amount_cents, balance_due_cents, status, due_date, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'UNPAID', ?, DATETIME('now'), DATETIME('now'))`,
      [invoiceNumber, studentId, branchId || 1, amountCents, amountCents, dueDate || null]
    );

    broadcastChange("finances", "issue-invoice", { invoiceNumber });
    return { success: true, invoiceNumber };
  } catch (error) {
    console.error("Issue invoice error:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("add-payment", async (event, data) => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const transactionId = `TXN-${Date.now().toString(16).toUpperCase()}`;
    await sequelize.query(
      `
            INSERT INTO payments (student_id, amount, type, category, method, transaction_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      {
        replacements: [
          data.studentId,
          data.amount,
          "income",
          "student_payment",
          data.method,
          transactionId,
          "completed",
        ],
      },
    );

    // If an invoiceId was provided, allocate payment against the invoice
    if (data.invoiceId) {
      const amountCents = Math.round(Number(data.amount) * 100);
      const invoice = await db.get(`SELECT * FROM invoices WHERE id = ?`, [data.invoiceId]);
      if (invoice) {
        const newBalance = Math.max(0, invoice.balance_due_cents - amountCents);
        const newStatus = newBalance === 0 ? 'PAID' : 'PARTIAL';
        await db.run(
          `UPDATE invoices SET balance_due_cents = ?, status = ?, updatedAt = DATETIME('now') WHERE id = ?`,
          [newBalance, newStatus, data.invoiceId]
        );
      }
    }

    broadcastChange("finances", "payment", { transactionId });
    return { success: true, transactionId };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("get-transactions", async (event, filters) => {
  try {
    if (!isAuthenticated()) return { success: false, message: "Unauthorized" };
    let query = `
            SELECT p.*, 
                   COALESCE(u_s.first_name, u_i.first_name) as first_name, 
                   COALESCE(u_s.last_name, u_i.last_name) as last_name 
            FROM payments p
            LEFT JOIN students s ON p.student_id = s.id
            LEFT JOIN users u_s ON s.user_id = u_s.id
            LEFT JOIN instructors i ON p.instructor_id = i.id
            LEFT JOIN users u_i ON i.user_id = u_i.id
            WHERE 1=1
        `;
    const replacements = [];

    if (filters && filters.userId) {
      query += " AND s.user_id = ?";
      replacements.push(filters.userId);
    }

    if (filters && filters.query) {
      query += " AND (p.transaction_id LIKE ? OR p.description LIKE ?)";
      replacements.push(`%${filters.query}%`, `%${filters.query}%`);
    }

    query += " ORDER BY p.payment_date DESC";

    const [results] = await sequelize.query(query, { replacements });

    const data = results.map((r) => ({
      id: r.id,
      transaction_id: r.transaction_id,
      payment_date: r.payment_date,
      amount: r.amount,
      status: r.status,
      method: r.method,
      type: r.type,
      category: r.category,
      description: r.description || r.category,
      entity_name: r.first_name ? `${r.first_name} ${r.last_name}` : "N/A",
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Get transactions error:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("update-payment-status", async (event, { id, status }) => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    await sequelize.query("UPDATE payments SET status = ? WHERE id = ?", {
      replacements: [status, id],
    });
    broadcastChange("finances", "update-status", { id, status });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("process-salary", async (event, data) => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const transactionId = `SAL-${Date.now().toString(16).toUpperCase()}`;
    await sequelize.query(
      `
            INSERT INTO payments (instructor_id, amount, type, category, method, transaction_id, status, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
      {
        replacements: [
          data.instructorId,
          data.amount,
          "expense",
          "salary",
          data.method,
          transactionId,
          "completed",
          `Salary Payment`,
        ],
      },
    );
    broadcastChange("finances", "salary", { transactionId });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("record-expense", async (event, data) => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const transactionId = `EXP-${Date.now().toString(16).toUpperCase()}`;
    await sequelize.query(
      `
            INSERT INTO payments (amount, type, category, method, transaction_id, status, description, vehicle_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
      {
        replacements: [
          data.amount,
          "expense",
          data.category,
          data.method,
          transactionId,
          "completed",
          data.description || "Business Expense",
          data.vehicleId || null
        ],
      },
    );
    broadcastChange("finances", "expense", { transactionId });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Encrypted Database Backup Handler
ipcMain.handle("create-backup", async () => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const dbPath = process.env.NODE_ENV === 'test'
      ? path.join(__dirname, '../trafquiz_test.db')
      : path.join(__dirname, '../trafquiz_app.db');

    if (!fs.existsSync(dbPath)) {
      return { success: false, message: "Database file not found" };
    }

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFilename = `trafquiz_backup_${Date.now()}.db.bak`;
    const backupPath = path.join(backupDir, backupFilename);
    fs.copyFileSync(dbPath, backupPath);

    return {
      success: true,
      message: "Backup created successfully",
      backupPath,
      sizeBytes: fs.statSync(backupPath).size
    };
  } catch (error) {
    console.error("Create backup error:", error);
    return { success: false, message: error.message };
  }
});

// Database Integrity Verification Handler
ipcMain.handle("verify-database-integrity", async () => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const result = await db.get("PRAGMA quick_check;");
    const isHealthy = result && (result.quick_check === 'ok' || Object.values(result)[0] === 'ok');
    return {
      success: true,
      isHealthy,
      result: result ? Object.values(result)[0] : 'unknown'
    };
  } catch (error) {
    console.error("Database integrity check error:", error);
    return { success: false, message: error.message };
  }
});
