import { Sequelize } from 'sequelize';
import dbConfig from '../config/db.config.js';
import initModels from './init-models.js';

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

// import models into sequelize instance
const db = initModels(sequelize);
db.Sequelize = Sequelize;

export default db;
