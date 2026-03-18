const { ipcMain } = require("electron");
const { sequelize } = require("../database");
const { broadcastChange } = require("../utils/broadcast");
const Payment = require("../models/payment");
const { Op, QueryTypes } = require("sequelize");
const { isAdmin, isAuthenticated } = require("../utils/session");

ipcMain.handle("get-financial-stats", async () => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };

    // BOLT: Calculate date range for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // BOLT: Parallelized total stats and aggregate chart data queries
    const [totals, chartResults] = await Promise.all([
      Promise.all([
        Payment.sum("amount", { where: { type: "income" } }),
        Payment.sum("amount", { where: { type: "expense" } })
      ]),
      // BOLT: Replaced 12 sequential queries with a single aggregate SQL query
      // using GROUP BY and CASE for efficient data extraction in one round-trip.
      // Also uses range-based filter on payment_date for index utilization.
      sequelize.query(
        `SELECT
            strftime('%Y-%m', payment_date) as month_key,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
         FROM payments
         WHERE payment_date >= ?
         GROUP BY month_key
         ORDER BY month_key ASC`,
        {
          replacements: [sixMonthsAgo.toISOString()],
          type: QueryTypes.SELECT
        }
      )
    ]);

    const totalRevenue = totals[0] || 0;
    const totalExpenses = totals[1] || 0;

    // Build the 6-month chart data map for easy lookup
    const statsMap = {};
    chartResults.forEach(r => {
      statsMap[r.month_key] = {
        revenue: Number(r.revenue) || 0,
        expenses: Number(r.expenses) || 0
      };
    });

    // Prepare labels and chart arrays based on the requested 6-month window
    const labels = [];
    const chartRevenue = [];
    const chartExpenses = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(now.getMonth() - i);

      const monthStr = (d.getMonth() + 1).toString().padStart(2, "0");
      const yearStr = d.getFullYear().toString();
      const key = `${yearStr}-${monthStr}`;

      labels.push(`${yearStr}-${monthStr}`);
      chartRevenue.push(statsMap[key]?.revenue || 0);
      chartExpenses.push(statsMap[key]?.expenses || 0);
    }

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
