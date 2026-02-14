const { Sequelize } = require('sequelize');
const path = require('path');
const { app } = require('electron');

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
const isTest = process.env.NODE_ENV === 'test';
let dbPath;

if (isTest) {
    dbPath = path.join(__dirname, 'trafquiz_test.db');
} else if (isDev) {
    dbPath = path.join(__dirname, 'trafquiz_app.db');
} else {
    if (app) {
        dbPath = path.join(app.getPath('userData'), 'trafquiz_app.db');
    } else {
        dbPath = path.join(__dirname, 'trafquiz_app.db');
    }
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: isDev ? console.log : false,
    define: {
        timestamps: true,
        underscored: true,
    },
    // SQLite performance optimizations: Enable WAL mode and NORMAL synchronous
    // This reduces disk I/O and improves concurrent read/write performance.
    dialectOptions: {
        // dialectOptions for sqlite are limited, hooks are more reliable for PRAGMAs
    },
    hooks: {
        afterConnect: (connection) => {
            return new Promise((resolve, reject) => {
                connection.run('PRAGMA journal_mode=WAL;', (err) => {
                    if (err) return reject(err);
                    connection.run('PRAGMA synchronous=NORMAL;', (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });
        }
    }
});

module.exports = {
    sequelize,
    Sequelize
};
