const { ipcMain } = require("electron");
const { sequelize } = require("../database");
const { broadcastChange } = require("../utils/broadcast");
const Payment = require("../models/payment");
const { Op } = require("sequelize");
const { isAdmin, isAuthenticated } = require("../utils/session");

ipcMain.handle("get-financial-stats", async () => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };

    // Calculate the date 6 months ago (start of that month)
    const startDate = new Date();
    startDate.setDate(1); // Set to 1st to avoid month overflow issues
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setHours(0, 0, 0, 0);

    const [totalRevenue, totalExpenses, [chartResults]] = await Promise.all([
      Payment.sum("amount", { where: { type: "income" } }),
      Payment.sum("amount", { where: { type: "expense" } }),
      sequelize.query(
        `
        SELECT
          strftime('%Y-%m', payment_date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        FROM payments
        WHERE payment_date >= ?
        GROUP BY month
        ORDER BY month ASC
      `,
        {
          replacements: [startDate.toISOString().replace('T', ' ').substring(0, 19)],
        },
      ),
    ]);

    // Prepare 6-month array even if some months have no data
    const chartRevenue = [];
    const chartExpenses = [];
    const labels = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      const monthData = chartResults.find((r) => r.month === monthStr);
      labels.push(monthStr);
      chartRevenue.push(Number(monthData?.revenue) || 0);
      chartExpenses.push(Number(monthData?.expenses) || 0);
    }

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue || 0,
        totalExpenses: totalExpenses || 0,
        netProfit: (totalRevenue || 0) - (totalExpenses || 0),
        projectedRevenue: (totalRevenue || 0) * 1.1,
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
