import dbConfig from './db.config.js';
import * as dotenv from 'dotenv';
dotenv.config({path: 'config.env'});

export default {
  development: {
    username: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    host: dbConfig.PORT,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: true
  },
  test: {
    username: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    host: dbConfig.PORT,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: true
  },
  production: {
    username: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    host: dbConfig.PORT,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
  }
};
