const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

const Quiz = sequelize.define('Quiz', {
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false
  },
  correct: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const Result = sequelize.define('Result', {
  score: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

User.hasMany(Result);
Result.belongsTo(User);

Quiz.hasMany(Result);
Result.belongsTo(Quiz);

const Instructor = sequelize.define('Instructor', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

const Package = sequelize.define('Package', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

const Specialization = sequelize.define('Specialization', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Certification = sequelize.define('Certification', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

sequelize.sync();

module.exports = {
  sequelize,
  User,
  Quiz,
  Result,
  Instructor,
  Package,
  Specialization,
  Certification
};
