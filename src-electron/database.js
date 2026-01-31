const { Sequelize } = require('sequelize');
const path = require('path');
const { app } = require('electron');

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
let dbPath;

if (isDev) {
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
    }
});

module.exports = {
    sequelize,
    Sequelize
};
