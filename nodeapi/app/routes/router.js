import express from 'express';
import * as UserController from '../controllers/userController.js';
import * as AccountController from '../controllers/accountController.js';
import * as TransactionController from '../controllers/transactionController.js';
import * as EntityController from '../controllers/entityController.js';

const router = (app) => {
  // USERS ROUTES
  /* const userRouter = express.Router()
    userRouter.post('/categoriesAndEntities', UserController.getUserCategoriesAndEntities) */

  const usersRouter = express.Router();
  usersRouter.post('/', UserController.createOne);
  /* usersRouter.post('/changePW/', UserController.changeUserPassword)
    usersRouter.post('/demo/', UserController.autoPopulateDemoData) */

  // AUTH ROUTES
  const authRoutes = express.Router();
  authRoutes.post('/', UserController.attemptLogin);

  const validityRoutes = express.Router();
  validityRoutes.post('/', UserController.checkSessionValidity);

  // ACCOUNTS ROUTES
  const accountsRoutes = express.Router();
  accountsRoutes.post('/', AccountController.createAccount);
  accountsRoutes.get('/', AccountController.getAllAccountsForUser);
  accountsRoutes.delete('/', AccountController.deleteAccount);
  accountsRoutes.put('/', AccountController.updateAccount);
  /* accountsRoutes.get('/stats/balance-snapshots/', AccountController.getUserAccountsBalanceSnapshot)
    accountsRoutes.put('/recalculate-balance/all', AccountController.recalculateAllUserAccountsBalances) */

  // BUDGETS ROUTES
  /* const budgetRoutes = express.Router()
    budgetRoutes.get('/', BudgetController.getAllBudgetsForUser)
    budgetRoutes.get('/list', BudgetController.getBudgetsListForUser)
    budgetRoutes.get('/:id', BudgetController.getBudget)
    budgetRoutes.post('/step0', BudgetController.addBudgetStep0)
    budgetRoutes.post('/step1', BudgetController.addBudget)
    budgetRoutes.put('/', BudgetController.editBudget)
    budgetRoutes.put('/status', BudgetController.changeBudgetStatus)
    budgetRoutes.put('/:id', BudgetController.updateBudgetCategoryPlannedValues)
    budgetRoutes.delete('/', BudgetController.removeBudget)
    budgetRoutes.get('/filteredByPage/{page}', BudgetController.getFilteredBudgetsForUserByPage) */

  // CATEGORIES ROUTES
  /* const catRoutes = express.Router()
    catRoutes.get('/', CategoryController.getAllCategoriesForUser)
    catRoutes.post('/', CategoryController.addCategory)
    catRoutes.delete('/', CategoryController.removeCategory)
    catRoutes.put('/', CategoryController.updateCategory) */

  // ENTITIES ROUTES
  const entityRoutes = express.Router();
  entityRoutes.get('/', EntityController.getAllEntitiesForUser);
  entityRoutes.post('/', EntityController.createEntity);
  entityRoutes.delete('/', EntityController.deleteEntity);
  entityRoutes.put('/', EntityController.updateEntity);

  // RULES ROUTES
  /* const ruleRoutes = express.Router()
    ruleRoutes.get('/', RuleController.getAllRulesForUser)
    ruleRoutes.post('/', RuleController.addRule)
    ruleRoutes.delete('/', RuleController.removeRule)
    ruleRoutes.put('/', RuleController.updateRule) */

  // STATS ROUTES
  /* const statRoutes = express.Router()
    statRoutes.get('/dashboard/month-expenses-income-distribution', StatController.getExpensesIncomeDistributionForMonth)
    statRoutes.get('/stats/monthly-patrimony-projections', StatController.getMonthlyPatrimonyProjections)
    statRoutes.get('/userStats', StatController.getUserCounterStats)
    statRoutes.get('/category-expenses-evolution', StatController.getCategoryExpensesEvolution)
    statRoutes.get('/category-income-evolution', StatController.getCategoryIncomeEvolution)
    statRoutes.get('/year-by-year-income-expense-distribution', StatController.getYearByYearIncomeExpenseDistribution) */

  // TRANSACTIONS ROUTES
  const trxRoutes = express.Router();
  trxRoutes.get('/', TransactionController.getTransactionsForUser);
  /* trxRoutes.get('/inMonthAndCategory', TransactionController.getAllTransactionsForUserInCategoryAndInMonth)
    trxRoutes.post('/step0', TransactionController.addTransactionStep0)
    trxRoutes.post('/step1', TransactionController.addTransactionStep1)
    trxRoutes.delete('/', TransactionController.removeTransaction)
    trxRoutes.put('/', TransactionController.updateTransaction)
    trxRoutes.post('/import/step0', TransactionController.importTransactionsStep0)
    trxRoutes.post('/import/step1', TransactionController.importTransactionsStep1)
    trxRoutes.post('/import/step2', TransactionController.importTransactionsStep2)
    trxRoutes.post('/filteredByPage/:page', TransactionController.getFilteredTransactionsForUserByPage)
    trxRoutes.post('/auto-cat-trx', TransactionController.autoCategorizeTransaction) */

  // INVEST ASSET ROUTES
  /* const investAssetRoutes = express.Router();
  investAssetRoutes.get('/', InvestAssetsController.getAllAssetsForUser);
  investAssetRoutes.post('/', InvestAssetsController.createAsset);
  investAssetRoutes.delete('/:id', InvestAssetsController.deleteAsset);
  investAssetRoutes.delete('/:id', InvestAssetsController.updateAsset);
  investAssetRoutes.delete('/:id/value', InvestAssetsController.updateCurrentAssetValue);
  investAssetRoutes.delete('/summary', InvestAssetsController.getAllAssetsSummaryForUser);
  investAssetRoutes.delete('/stats', InvestAssetsController.getAssetStatsForUser);
  investAssetRoutes.delete('/stats/:id', InvestAssetsController.getAssetDetailsForUser); */

  // INVEST TRANSACTION ROUTES
  /* const investTrxRoutes = express.Router();
  investTrxRoutes.get('/', InvestTransactionsRouter.getAllTransactionsForUser);
  investTrxRoutes.post('/', InvestTransactionsRouter.addTransaction);
  investTrxRoutes.delete('/:id', InvestTransactionsRouter.removeTransaction);
  investTrxRoutes.delete('/:id', InvestTransactionsRouter.updateTransaction); */

  /* app.use('/user', userRouter) */
  app.use('/users', usersRouter);
  app.use('/auth', authRoutes);
  app.use('/validity', validityRoutes);
  app.use('/accounts', accountsRoutes);
  app.use('/trxs', trxRoutes);
  /* app.use('/budgets', budgetRoutes) */
  /* app.use('/categories', categoryRoutes) */
  app.use('/entities', entityRoutes);
  /* app.use('/rules', ruleRoutes) */
  /* app.use('/stats', statRoutes) */
  /* app.use('/invest/stats', investAssetRoutes) */
  /* app.use('/invest/trx', investTrxRoutes) */
};

export default router;
