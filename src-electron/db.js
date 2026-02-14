const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

// Get userData path effectively
const isDev =
  process.env.NODE_ENV === "development" || process.argv.includes("--dev");
const isTest = process.env.NODE_ENV === "test";
let dbPath;

if (isTest) {
  dbPath = path.join(__dirname, "trafquiz_test.db");
} else if (isDev) {
  dbPath = path.join(__dirname, "trafquiz_app.db");
} else {
  // In production, app should be available. If not, fallback to __dirname to avoid crash, but log error.
  if (app) {
    dbPath = path.join(app.getPath("userData"), "trafquiz_app.db");
  } else {
    console.error(
      "Electron app object is not available. Falling back to local DB path.",
    );
    dbPath = path.join(__dirname, "trafquiz_app.db");
  }
}

console.log("Database path:", dbPath);

const db = new sqlite3.Database(dbPath);

// Helper to run queries with promises
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// For multiple statements (exec)
const exec = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

async function init() {
  console.log("Initializing Database...");

  // Enable foreign keys and performance optimizations (WAL mode, NORMAL synchronous)
  await exec("PRAGMA foreign_keys = ON");
  await exec("PRAGMA journal_mode = WAL");
  await exec("PRAGMA synchronous = NORMAL");

  // Check if tables exist (using 'users' as a marker)
  try {
    const userTableExists = await get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
    );

    if (!userTableExists) {
      console.log(
        "Database empty. Initializing data from sqlite_schema.json...",
      );

      const schemaJsonPath = path.join(__dirname, "sqlite_schema.json");

      if (fs.existsSync(schemaJsonPath)) {
        try {
          const schemaContent = fs.readFileSync(schemaJsonPath, "utf8");
          const schemaData = JSON.parse(schemaContent);

          // Note: Structure is assumed to be handled by Sequelize migrations
          // which run BEFORE this (see main.js).
          // If migrations haven't run, this will fail or insert into nothing.

          await exec("BEGIN TRANSACTION");

          for (const item of schemaData) {
            if (item.type === "table" && item.data && item.data.length > 0) {
              const tableName = item.name;
              console.log(`Populating table: ${tableName}`);

              const firstRow = item.data[0];
              const columns = Object.keys(firstRow);
              const placeholders = columns.map(() => "?").join(", ");
              const columnNames = columns.join(", ");

              const stmt = db.prepare(
                `INSERT OR IGNORE INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`,
              );

              for (const row of item.data) {
                const values = columns.map((col) => row[col]);
                stmt.run(values);
              }
              stmt.finalize();
            }
          }

          await exec("COMMIT");
          console.log(
            "Database successfully populated from sqlite_schema.json",
          );
        } catch (err) {
          console.error("Failed to populate from JSON:", err);
          try {
            await exec("ROLLBACK");
          } catch (e) {}
        }
      } else {
        console.warn("sqlite_schema.json not found. Skipping data population.");
      }
    } else {
      console.log("Database already initialized.");
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

module.exports = {
  db,
  query,
  get,
  run,
  exec,
  init,
};
