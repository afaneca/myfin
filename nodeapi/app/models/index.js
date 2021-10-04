import { Sequelize } from 'sequelize';
import dbConfig from '../config/db.config.js';
import userModel from './userModel.js';
import accountModel from './accountModel.js';
import transactionModel from './transactionModel.js';

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  operatorsAliases: '0',
  define: {
    timestamps: false,
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = userModel(sequelize, Sequelize);
db.accounts = accountModel(sequelize, Sequelize);
db.transactions = transactionModel(sequelize, Sequelize);

/*db.users.hasMany(db.accounts);*/

export default db;
