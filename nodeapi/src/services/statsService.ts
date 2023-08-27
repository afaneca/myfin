import { performDatabaseRequest, prisma } from '../config/prisma.js';
import APIError from '../errorHandling/apiError.js';
import { Prisma } from '@prisma/client';
import CategoryService from './categoryService.js';
import ConvertUtils from '../utils/convertUtils.js';
import TransactionService from './transactionService.js';
import EntityService from './entityService.js';
import AccountService from './accountService.js';
import BudgetService from './budgetService.js';
import RuleService from './ruleService.js';
import DateTimeUtils from '../utils/DateTimeUtils.js';

const getExpensesIncomeDistributionForMonth = async (
  userId: bigint,
  month: number,
  year: number,
  dbClient = prisma
) => {
  interface CategoryDataForStats extends Prisma.categoriesUpdateInput {
    current_amount_credit?: number;
    current_amount_debit?: number;
  }

  const data: {
    categories?: Array<CategoryDataForStats>;
    last_update_timestamp?: bigint;
  } = {};
  // Get budget
  const budget: Prisma.budgetsWhereInput = await dbClient.budgets
    .findFirstOrThrow({
      where: {
        users_user_id: userId,
        month: month,
        year: year,
      },
    })
    .catch(() => {
      throw APIError.notFound();
    });

  const budgetId = budget.budget_id as bigint;
  const userData: any = await dbClient.users.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      last_update_timestamp: true,
    },
  });
  data.last_update_timestamp = userData.last_update_timestamp as bigint;

  const budgetCategories = await CategoryService.getAllCategoriesForBudget(
    userId,
    budgetId,
    dbClient
  );
  data.categories = [];
  for (const category of budgetCategories) {
    const currentAmounts = await CategoryService.getAmountForCategoryInMonth(
      category.category_id as bigint,
      month,
      year,
      true,
      dbClient
    );
    /* Logger.addStringifiedLog(currentAmounts); */
    /* Logger.addLog(`credit: ${currentAmounts.category_balance_credit} | converted: ${ConvertUtils.convertBigIntegerToFloat(BigInt(currentAmounts.category_balance_credit ?? 0))}`); */
    data.categories.push({
      ...category,
      current_amount_credit: ConvertUtils.convertBigIntegerToFloat(
        BigInt(currentAmounts.category_balance_credit ?? 0)
      ),
      current_amount_debit: ConvertUtils.convertBigIntegerToFloat(
        BigInt(currentAmounts.category_balance_debit ?? 0)
      ),
    });
  }

  return data;
};

export interface UserCounterStats {
  nr_of_trx: number;
  nr_of_entities: number;
  nr_of_categories: number;
  nr_of_accounts: number;
  nr_of_budgets: number;
  nr_of_rules: number;
}

const getUserCounterStats = async (
  userId: bigint,
  dbClient = prisma
): Promise<UserCounterStats> => {
  const [trxCount, entityCount, categoryCount, accountCount, budgetCount, ruleCount] =
    await Promise.all([
      TransactionService.getCountOfUserTransactions(userId),
      CategoryService.getCountOfUserCategories(userId, dbClient),
      EntityService.getCountOfUserEntities(userId, dbClient),
      AccountService.getCountOfUserAccounts(userId, dbClient),
      BudgetService.getCountOfUserBudgets(userId, dbClient),
      RuleService.getCountOfUserRules(userId, dbClient),
    ]);

  return {
    nr_of_trx: trxCount as number,
    nr_of_entities: entityCount as number,
    nr_of_categories: categoryCount as number,
    nr_of_accounts: accountCount as number,
    nr_of_budgets: budgetCount as number,
    nr_of_rules: ruleCount as number,
  };
};

interface MonthlyPatrimonyProjections {
  budgets?: Array<any>;
  accountsFromPreviousMonth?: Array<any>;
}

const getMonthlyPatrimonyProjections = async (userId: bigint, dbClient = undefined) => {
  const currentMonth = DateTimeUtils.getMonthNumberFromTimestamp(
    DateTimeUtils.getCurrentUnixTimestamp()
  );
  const currentYear = DateTimeUtils.getYearFromTimestamp(DateTimeUtils.getCurrentUnixTimestamp());
  const previousMonth = currentMonth > 1 ? currentMonth - 1 : 12;
  const previousMonthYear = currentMonth > 1 ? currentYear : currentYear - 1;

  /**
   * Skeleton:
   *  [
   *    {category_name, category_expenses },
   *    ...
   * ]
   */
  return performDatabaseRequest(async (dbTx) => {
    interface ExtendedBudget extends Prisma.budgetsUpdateInput {
      planned_balance?: number;
      planned_initial_balance?: number;
      planned_final_balance?: number;
    }

    const output: MonthlyPatrimonyProjections = {};

    const budgets: Array<ExtendedBudget> = await BudgetService.getBudgetAfterCertainMonth(
      userId,
      previousMonth,
      previousMonthYear,
      dbTx
    );
    let lastPlannedFinalBalance = null;

    for (const budget of budgets) {
      budget.planned_balance = await BudgetService.calculateBudgetBalance(userId, budget, dbTx);
      const month = budget.month as number;
      const year = budget.year as number;
      if (!lastPlannedFinalBalance) {
        budget.planned_initial_balance = await AccountService.getBalancesSnapshotForMonthForUser(
          userId,
          month > 1 ? month - 1 : 12,
          month > 1 ? year : year - 1,
          true,
          dbTx
        );
      } else {
        budget.planned_initial_balance = lastPlannedFinalBalance;
      }
      budget.planned_final_balance = budget.planned_initial_balance + budget.planned_balance;
      lastPlannedFinalBalance = budget.planned_final_balance;
    }

    const accountsFromPreviousMonth: Array<{
      account_id: bigint;
      type: string;
      balance?: number;
    }> = await dbTx.accounts.findMany({
      where: {
        users_user_id: userId,
      },
      select: {
        account_id: true,
        type: true,
      },
    });

    for (const account of accountsFromPreviousMonth) {
      const balanceSnapshot = (await AccountService.getBalanceSnapshotAtMonth(
        account.account_id,
        previousMonth,
        previousMonthYear,
        dbTx
      )) ?? { balance: 0 };
      account.balance = balanceSnapshot.balance ?? 0;
    }

    output.budgets = budgets;
    output.accountsFromPreviousMonth = accountsFromPreviousMonth;

    return output;
  }, dbClient);
};

export default {
  getExpensesIncomeDistributionForMonth,
  getUserCounterStats,
  getMonthlyPatrimonyProjections,
};
