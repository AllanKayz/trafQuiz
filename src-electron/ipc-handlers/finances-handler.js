const { ipcMain } = require("electron");
const { sequelize } = require("../database");
const { broadcastChange } = require("../utils/broadcast");
const Payment = require("../models/payment");
const { Op } = require("sequelize");
const { isAdmin, isAuthenticated } = require("../utils/session");

ipcMain.handle("get-financial-stats", async () => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };

    // Parallelize total revenue and expenses queries
    const [totalRevenue, totalExpenses] = await Promise.all([
      Payment.sum("amount", { where: { type: "income" } }).then(val => val || 0),
      Payment.sum("amount", { where: { type: "expense" } }).then(val => val || 0)
    ]);

    // Calculate dynamic chart data for the last 6 months
    const months = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1); // Crucial: avoid month-end rollover issues
      d.setMonth(d.getMonth() - i);
      months.push({
        name: monthNames[d.getMonth()],
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      });
    }

    const labels = months.map(
      (m) => `${m.year}-${m.month.toString().padStart(2, "0")}`,
    );

    // Optimized: Use a single aggregate query to fetch all monthly data at once
    // Using index-friendly range comparison for payment_date
    const minDate = `${labels[0]}-01 00:00:00`;
    const lastMonth = months[months.length - 1];
    const maxDate = new Date(lastMonth.year, lastMonth.month, 0, 23, 59, 59).toISOString().replace('T', ' ').slice(0, 19);

    const [monthlyData] = await sequelize.query(
      `
      SELECT
        strftime('%Y-%m', payment_date) as month_key,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM payments
      WHERE payment_date BETWEEN ? AND ?
      GROUP BY month_key
      `,
      { replacements: [minDate, maxDate] }
    );

    // Map the results back to the labels to ensure correct order and handle missing months
    const dataMap = monthlyData.reduce((acc, row) => {
      acc[row.month_key] = row;
      return acc;
    }, {});

    const chartRevenue = labels.map(label => Number(dataMap[label]?.income) || 0);
    const chartExpenses = labels.map(label => Number(dataMap[label]?.expense) || 0);

    return {
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        projectedRevenue: totalRevenue * 1.1,
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
    broadcastChange("finances", "payment", { transactionId });
    return { success: true, transactionId };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("get-transactions", async (event, filters) => {
  try {
    if (!isAuthenticated()) return { success: false, message: "Unauthorized" };
    // Build query based on filters
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

    // Map to expected format if needed, but for now raw is likely fine
    const data = results.map((r) => ({
      id: r.id,
      transaction_id: r.transaction_id,
      payment_date: r.payment_date,
      amount: r.amount,
      status: r.status,
      method: r.method,
      type: r.type,
      category: r.category,
      description: r.description || r.category, // Fallback
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
    // data should have instructorId, amount, method, etc.
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
