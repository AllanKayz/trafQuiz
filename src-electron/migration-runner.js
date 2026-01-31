const { Umzug, SequelizeStorage } = require('umzug');
const { sequelize } = require('./database');
const path = require('path');

const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, 'migrations/*.js'),
    resolve: ({ name, path, context }) => {
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context, sequelize.constructor),
        down: async () => migration.down(context, sequelize.constructor),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

async function runMigrations() {
  try {
    console.log('Running migrations...');
    await umzug.up();
    console.log('Migrations complete.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

module.exports = {
  runMigrations,
  umzug
};
