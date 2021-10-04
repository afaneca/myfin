import express from 'express';
import { attemptLogin, checkSessionValidity, createOne } from '../controllers/userController.js';
import { createAccount, getAllAccountsForUser } from '../controllers/accountController.js';
import { getTransactionsForUser } from '../controllers/transactionController.js';

const router = (app) => {
// USERS ROUTES
  const usersRouter = express.Router();
  /* usersRouter.get("/", users.findAll)
    usersRouter.get("/:id", users.findOne) */
  usersRouter.post('/', createOne);

  // AUTH ROUTES
  const authRoutes = express.Router();
  authRoutes.post('/', attemptLogin);

  const validityRoutes = express.Router();
  validityRoutes.post('/', checkSessionValidity);

  // ACCOUNTS ROUTES
  // const users = require("../controllers/userController")
  const accountsRoutes = express.Router();
  accountsRoutes.post('/', createAccount);
  accountsRoutes.get('/', getAllAccountsForUser);

  // BUDGETS ROUTES

  // CATEGORIES ROUTES

  // ENTITIES ROUTES

  // RULES ROUTES

  // STATS ROUTES

  // TRANSACTIONS ROUTES
  const trxRoutes = express.Router();
  trxRoutes.get('/', getTransactionsForUser);

  app.use('/users', usersRouter);
  app.use('/auth', authRoutes);
  app.use('/validity', validityRoutes);
  app.use('/accounts', accountsRoutes);
  app.use('/trxs', trxRoutes);
};

export default router;
