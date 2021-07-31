import express from 'express';
import { attemptLogin, checkSessionValidity, createOne } from '../controllers/userController.js';

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
  const accountsRouter = express.Router();

  // BUDGETS ROUTES

  // CATEGORIES ROUTES

  // ENTITIES ROUTES

  // RULES ROUTES

  // STATS ROUTES

  // TRANSACTIONS ROUTES

  app.use('/users', usersRouter);
  app.use('/auth', authRoutes);
  app.use('/validity', validityRoutes);
  app.use('/accounts', accountsRouter);
};

export default router;
