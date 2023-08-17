import { prisma, setupPrismaTransaction } from "../config/prisma.js";
import { MYFIN } from "../consts.js";
import ConvertUtils from "../utils/convertUtils.js";
import CategoryService from "./categoryService.js";
import AccountService from "./accountService.js";
import DateTimeUtils from "../utils/DateTimeUtils.js";
import Logger from "../utils/Logger.js";
import { Prisma } from "@prisma/client";

/**
 * Gets all (active) categories for the user, with planned & current amounts
 * related to a specific budget
 */
const getAllCategoriesForUser = async (userId: number | bigint, budgetId: number | bigint, dbClient = prisma) : Promise<Array<any>> =>
  dbClient.$queryRaw`SELECT users_user_id,
                            category_id,
                            name,
                            status,
                            type,
                            description,
                            color_gradient,
                            budgets_budget_id,
                            exclude_from_budgets,
                            truncate((coalesce(planned_amount_credit, 0) / 100), 2) as planned_amount_credit,
                            truncate((coalesce(planned_amount_debit, 0) / 100), 2)  as planned_amount_debit,
                            truncate((coalesce(current_amount, 0) / 100), 2)        as current_amount
                     FROM (SELECT *
                           FROM budgets_has_categories
                           WHERE budgets_users_user_id = ${userId}
                             AND (budgets_budget_id = ${budgetId})) b
                              RIGHT JOIN categories ON categories.category_id = b.categories_category_id
                     WHERE users_user_id = ${userId}
                       AND status = ${MYFIN.CATEGORY_STATUS.ACTIVE} `;

const calculateBudgetBalance = async (userId: number | bigint, budget: Prisma.budgetsCreateInput, dbClient = prisma) => {
  const budgetId = budget.budget_id;
  const month = budget.month;
  const year = budget.year;
  const isOpen = budget.is_open;

  const categories = await getAllCategoriesForUser(userId, budgetId, dbClient);

  const balance = await categories.reduce(async (acc, category) => {
    let amountCredit = 0;
    let amountDebit = 0;
    if (isOpen) {
      amountCredit = Math.abs(
        ConvertUtils.convertFloatToBigInteger(category.planned_amount_credit)
      );
      amountDebit = Math.abs(ConvertUtils.convertFloatToBigInteger(category.planned_amount_debit));
    } else {
      const calculatedAmounts = await CategoryService.getAmountForCategoryInMonth(
        category.category_id,
        month,
        year,
        true,
        dbClient
      );
      const calculatedAmountsFromInvestmentAccounts =
        await AccountService.getAmountForInvestmentAccountsInMonth(
          category.category_id,
          month,
          year,
          dbClient
        );
      const creditFromInvestmentAccounts =
        calculatedAmountsFromInvestmentAccounts[0].account_balance_credit;
      const expensesFromInvestmentAccounts =
        calculatedAmountsFromInvestmentAccounts[0].account_balance_debit;
      amountCredit =
        Math.abs(calculatedAmounts.category_balance_credit) - creditFromInvestmentAccounts;
      amountDebit =
        Math.abs(calculatedAmounts.category_balance_debit) - expensesFromInvestmentAccounts;
    }
    return acc + amountCredit - amountDebit;
  }, 0);
  return ConvertUtils.convertBigIntegerToFloat(balance);
};

const getSumAmountsForBudget = async (userId, budget, dbClient = prisma) => {
  const budgetId = budget.budget_id;
  const month = parseInt(budget.month, 10);
  const year = parseInt(budget.year, 10);
  const isOpen = budget.is_open;

  const categories: any = await getAllCategoriesForUser(userId, budgetId, dbClient);
  let balanceCredit = 0;
  let balanceDebit = 0;

  for await (const category of categories) {
    let amountCredit = 0;
    let amountDebit = 0;
    if (isOpen === 1) {
      amountCredit = Math.abs(
        ConvertUtils.convertFloatToBigInteger(category.planned_amount_credit)
      );
      amountDebit = Math.abs(ConvertUtils.convertFloatToBigInteger(category.planned_amount_debit));
    } else {
      const calculatedAmounts = await CategoryService.getAmountForCategoryInMonth(
        category.category_id,
        month,
        year,
        true,
        dbClient
      );

      const calculatedAmountsFromInvestmentAccounts =
        await AccountService.getAmountForInvestmentAccountsInMonth(
          category.category_id,
          month,
          year,
          dbClient
        );

      /* Logger.addLog(
        `Category: ${category.category_id} | calculatedAmounts: ${JSON.stringify(
          calculatedAmounts
        )} | calculatedAmountsFromInvestmentAccounts: ${JSON.stringify(
          calculatedAmountsFromInvestmentAccounts
        )}`
      ); */
      // Unrealized gains
      const creditFromInvestmentAccounts =
        calculatedAmountsFromInvestmentAccounts[0]?.account_balance_credit;
      // Unrealized losses
      const expensesFromInvestmentAccounts =
        calculatedAmountsFromInvestmentAccounts[0]?.account_balance_debit;

      // remove unrealized gains from budget calcs
      amountCredit =
        Math.abs(calculatedAmounts[0]?.category_balance_credit) - creditFromInvestmentAccounts;
      // remove unrealized losses from budget calcs
      amountDebit =
        Math.abs(calculatedAmounts[0]?.category_balance_debit) - expensesFromInvestmentAccounts;
    }

    /* Logger.addLog(
      `Category: ${category.category_id} | amountCredit: ${amountCredit} | amountDebit: ${amountDebit}`
    ); */

    if (!category.exclude_from_budgets) {
      balanceCredit += amountCredit;
      balanceDebit += amountDebit;
    }
  }
  /* Logger.addLog(`balanceCredit: ${balanceCredit} | balanceDebit: ${balanceDebit}`); */

  return {
    balance_credit: ConvertUtils.convertBigIntegerToFloat(balanceCredit),
    balance_debit: ConvertUtils.convertBigIntegerToFloat(balanceDebit)
  };
};

const calculateBudgetBalanceChangePercentage = async (
  userId,
  budget,
  budgetBalance,
  dbClient = prisma
) => {
  const month = parseInt(budget.month, 10);
  const year = parseInt(budget.year, 10);

  const initialBalance = await AccountService.getBalancesSnapshotForMonthForUser(
    userId,
    month > 1 ? month - 1 : 12,
    month > 1 ? year : year - 1,
    true,
    dbClient
  );
  const finalBalance = initialBalance + budgetBalance;
  if (initialBalance === 0) {
    return "NaN";
  }

  return ((finalBalance - initialBalance) / Math.abs(initialBalance)) * 100;
};
const getAllBudgetsForUser = async (userId: bigint, status: string) => {
  return setupPrismaTransaction(async (prismaTx) => {
    let whereCondition = {};
    if (status) {
      whereCondition = {
        users_user_id: userId,
        status: status
      };
    } else {
      whereCondition = { users_user_id: userId };
    }

    const budgetsList = await prismaTx.budgets.findMany({
      where: whereCondition,
      orderBy: [{ year: "desc" }, { month: "desc" }]
    });

    for await (const budget of budgetsList) {
      budget.balance_value = await calculateBudgetBalance(userId, budget, prismaTx);
      budget.balance_change_percentage = await calculateBudgetBalanceChangePercentage(
        userId,
        budget,
        budget.balance_value,
        prismaTx
      );
      const budgetSums = await getSumAmountsForBudget(userId, budget, prismaTx);
      budget.credit_amount = budgetSums.balance_credit;
      budget.debit_amount = budgetSums.balance_debit;
      if (parseFloat(budget.credit_amount) == 0) {
        budget.savings_rate_percentage = 0;
      } else {
        budget.savings_rate_percentage =
          (parseFloat(budget.balance_value) / parseFloat(budget.credit_amount)) * 100;
      }
    }
  });
};

const getBudgetsForUserByPage = async (
  userId: bigint,
  page: number,
  pageSize: number,
  searchQuery: string,
  status: string,
  dbClient = prisma
): Promise<{ total_count: number; filtered_count: number; results: Array<any> }> => {
  const query = `%${searchQuery}%`;
  const offsetValue = page * pageSize;

  let isOpenValue = "%";
  if (status) {
    // eslint-disable-next-line default-case
    switch (status) {
      case "O":
        isOpenValue = "1";
        break;
      case "1":
        isOpenValue = "0";
        break;
      default:
        isOpenValue = "%";
        break;
    }
  }
  Logger.addLog(
    `userId: ${userId} | query: ${query} | offsetValue: ${offsetValue} | page: ${page} | pageSize: ${pageSize}} | isOpenValue: ${isOpenValue}`
  );

  // main query for list of results (limited by $pageSize and $offsetValue)
  const results: any =
    await dbClient.$queryRaw`SELECT budget_id, month, year, observations, is_open, users_user_id
                             FROM budgets
                             WHERE (users_user_id = ${userId})
                               AND (observations LIKE ${query} OR month LIKE ${query} OR year LIKE ${query})
                               AND is_open LIKE ${isOpenValue}
                             GROUP BY budget_id
                             ORDER BY year DESC, month DESC
                             LIMIT ${pageSize} OFFSET ${offsetValue} `;

  // count of total of filtered results
  const filteredCount = await dbClient.$queryRaw`SELECT count(*) as 'count'
                                                 FROM (SELECT budget_id
                                                       from budgets
                                                       WHERE (users_user_id = ${userId})
                                                         AND (observations LIKE ${query} OR month LIKE ${query} OR year LIKE ${query})
                                                         AND is_open LIKE ${isOpenValue}
                                                       GROUP BY budget_id) budget`;

  // count of total of results
  const totalCount = await dbClient.$queryRaw`SELECT count(*) as 'count'
                                              FROM budgets
                                              WHERE users_user_id = ${userId}`;

  return {
    results: results,
    filtered_count: parseInt(filteredCount[0].count, 10),
    total_count: parseInt(totalCount[0].count, 10)
  };
};

const getFilteredBudgetsForUserByPage = async (userId: bigint, page: number, pageSize: number, query: string, status: string) =>
  setupPrismaTransaction(async (prismaTx) => {
    const budgetsArr = await getBudgetsForUserByPage(
      userId,
      page,
      pageSize,
      query,
      status,
      prismaTx
    );

    for await (const budget of budgetsArr.results) {
      budget.balance_value = await calculateBudgetBalance(userId, budget, prismaTx);
      budget.balance_change_percentage = await calculateBudgetBalanceChangePercentage(
        userId,
        budget,
        budget.balance_value,
        prismaTx
      );
      const budgetSums = await getSumAmountsForBudget(userId, budget, prismaTx);
      budget.credit_amount = budgetSums.balance_credit;
      budget.debit_amount = budgetSums.balance_debit;
      if (parseFloat(budget.credit_amount) === 0) {
        budget.savings_rate_percentage = 0;
      } else {
        budget.savings_rate_percentage =
          (parseFloat(budget.balance_value) / parseFloat(budget.credit_amount)) * 100;
      }
    }
    return budgetsArr;
  });

const getCategoryDataForNewBudget = async (userId: bigint) => {
  const categories = await CategoryService.getAllCategoriesForUser(userId);

  for await (const category of categories) {
    const monthToUse = DateTimeUtils.getMonthNumberFromTimestamp();
    const yearToUse = DateTimeUtils.getYearFromTimestamp();

    const previousMonth = monthToUse > 1 ? monthToUse - 1 : 12;
    const previousMonthsYear = monthToUse > 1 ? yearToUse : yearToUse - 1;
    const previousMonthAmounts = await CategoryService.getAmountForCategoryInMonth(
      category.category_id,
      previousMonth,
      previousMonthsYear,
      true
    )[0];

    if (previousMonthAmounts) {
      (category as any).avg_previous_month_credit = Math.abs(
        Number(ConvertUtils.convertBigIntegerToFloat(previousMonthAmounts.category_balance_credit))
      );

      (category as any).avg_previous_month_debit = Math.abs(
        Number(ConvertUtils.convertBigIntegerToFloat(previousMonthAmounts.category_balance_debit))
      );
    }

    const sameMonthPreviousYearAmounts = await CategoryService.getAmountForCategoryInMonth(
      category.category_id,
      monthToUse,
      yearToUse - 1,
      true
    )[0];

    if (sameMonthPreviousYearAmounts) {
      (category as any).avg_same_month_previous_year_credit = Math.abs(
        Number(ConvertUtils.convertBigIntegerToFloat(sameMonthPreviousYearAmounts.category_balance_credit))
      );
      (category as any).avg_same_month_previous_year_debit = Math.abs(
        Number(ConvertUtils.convertBigIntegerToFloat(sameMonthPreviousYearAmounts.category_balance_debit))
      );
    }

    const last12MonthsAverageAmounts =
      await CategoryService.getAverageAmountForCategoryInLast12Months(category.category_id)[0];

    if (last12MonthsAverageAmounts) {
      (category as any).avg_12_months_credit = Math.abs(
        Number(ConvertUtils.convertBigIntegerToFloat(last12MonthsAverageAmounts.category_balance_credit))
      );
      (category as any).avg_12_months_debit = Math.abs(
        Number(ConvertUtils.convertBigIntegerToFloat(last12MonthsAverageAmounts.category_balance_debit))
      );
    }

    const lifetimeAverageAmounts = await CategoryService.getAverageAmountForCategoryInLifetime(
      category.category_id
    )[0];
    if (lifetimeAverageAmounts) {
      (category as any).avg_lifetime_credit = Math.abs(
        Number(ConvertUtils.convertBigIntegerToFloat(lifetimeAverageAmounts.category_balance_credit))
      );
      (category as any).avg_lifetime_debit = Math.abs(
        Number(ConvertUtils.convertBigIntegerToFloat(lifetimeAverageAmounts.category_balance_debit))
      );
    }
  }
  return {
    categories: categories,
    initial_balance: "-"
  };
};

const addOrUpdateCategoryValueInBudget = async (
  userId,
  budgetId,
  catId,
  plannedValueCredit,
  plannedValueDebit,
  dbClient = prisma
) => {
  Logger.addLog(
    `budgetId: ${budgetId} | catId: ${catId} | plannedValueCredit: ${plannedValueCredit} | plannedValueDebit: ${plannedValueDebit}`
  );
  await dbClient.$executeRaw`INSERT INTO budgets_has_categories (budgets_budget_id,
                                                                 budgets_users_user_id,
                                                                 categories_category_id,
                                                                 planned_amount_credit,
                                                                 planned_amount_debit)
                             VALUES (${budgetId}, ${userId}, ${catId},
                                     ${plannedValueCredit},
                                     ${plannedValueDebit})
                             ON DUPLICATE KEY UPDATE planned_amount_credit = ${plannedValueCredit},
                                                     planned_amount_debit  = ${plannedValueDebit}`;
};

const parseCatValuesIntoBudgetCategories = async (
  userId,
  budgetId,
  catValuesArr,
  dbClient = prisma
) => {
  // ADD CAT VALUES TO BUDGET CATEGORIES
  const promises = [];
  for (const catValue of catValuesArr) {
    const plannedValueCredit = ConvertUtils.convertFloatToBigInteger(
      parseFloat(catValue.planned_value_credit)
    );
    const plannedValueDebit = ConvertUtils.convertFloatToBigInteger(
      parseFloat(catValue.planned_value_debit)
    );
    /* Logger.addLog(`cat value debit: ${catValue.planned_value_debit} || converted: ${plannedValueDebit}`);
    Logger.addStringifiedLog(catValue); */

    promises.push(
      addOrUpdateCategoryValueInBudget(
        userId,
        budgetId,
        catValue.category_id,
        plannedValueCredit,
        plannedValueDebit,
        dbClient
      )
    );
  }
  return Promise.all(promises);
};
const createBudget = async (userId, month, year, catValuesArr, observations) =>
  setupPrismaTransaction(async (prismaTx) => {
    const budget = await prismaTx.budgets.create({
      data: {
        month: month,
        year: year,
        observations: observations,
        is_open: true,
        users_user_id: userId
      }
    });

    // ADD CAT VALUES TO BUDGET CATEGORIES
    await parseCatValuesIntoBudgetCategories(userId, budget.budget_id, catValuesArr, prismaTx);
    return budget.budget_id;
  });

const getTotalEssentialDebitTransactionsAmountForBudget = async (
  userId,
  budget,
  dbClient = prisma
) => {
  const month = parseInt(budget.month, 10);
  const year = parseInt(budget.year, 10);

  const result: any = await dbClient.$queryRaw`SELECT sum(amount) as 'amount'
                                                              FROM transactions
                                                                       inner join accounts on transactions.accounts_account_from_id = accounts.account_id
                                                              where users_user_id = ${userId}
                                                                and date_timestamp between ${
                                                                      new Date(year, month, 1).getTime() / 1000
                                                              } AND ${new Date(year, month, 0).getTime() / 1000}
                                                                and transactions.is_essential IS TRUE
                                                                and transactions.type = ${MYFIN.TRX_TYPES.EXPENSE}`;

  return result.amount ? ConvertUtils.convertBigIntegerToFloat(result.amount) : 0;
};

const getBudget = async (userId: bigint, budgetId: number | bigint, dbclient = prisma) => {
  const budget = await prisma.budgets.findUnique({
    where: {
      users_user_id: userId,
      budget_id: budgetId
    },
    select: {
      observations: true,
      month: true,
      year: true
    }
  });

  const month = (budget as any).month;
  const year = (budget as any).year;

  (budget as any).initial_balance = await AccountService.getBalancesSnapshotForMonthForUser(
    userId,
    month > 1 ? month - 1 : 12,
    month > 1 ? year : year - 1,
    true,
    dbclient
  );
  (budget as any).categories = await CategoryService.getAllCategoriesForBudget(userId, budgetId, dbclient);
  (budget as any).debit_essential_trx_total = await getTotalEssentialDebitTransactionsAmountForBudget(
    userId,
    budget,
    dbclient
  );

  for (const category of (budget as any).categories) {
    const monthToUse = (budget as any).month;
    const yearToUse = (budget as any).year;
    const calculatedAmounts = await CategoryService.getAmountForCategoryInMonth(
      category.category_id,
      monthToUse,
      yearToUse,
      true,
      dbclient
    );
    const calculatedAmountsFromInvestmentAccounts =
      await AccountService.getAmountForInvestmentAccountsInMonth(
        category.category_id,
        monthToUse,
        yearToUse,
        dbclient
      );

    /* Logger.addLog(`-----------------------
    Category: ${category.name}
    Calculated amounts: ${JSON.stringify(calculatedAmounts[0])}
    `); */

    // Unrealized gains
    const creditFromInvestmentAccounts = calculatedAmountsFromInvestmentAccounts
      ? calculatedAmountsFromInvestmentAccounts[0].account_balance_credit
      : 0;
    // Unrealized losses
    const expensesFromInvestmentAccounts = calculatedAmountsFromInvestmentAccounts
      ? calculatedAmountsFromInvestmentAccounts[0].account_balance_debit
      : 0;
    // remove unrealized gains from budget calcs
    const currentAmountCredit =
      (calculatedAmounts ? calculatedAmounts[0].category_balance_credit : 0) -
      creditFromInvestmentAccounts;
    // remove unrealized losses from budget calcs
    const currentAmountDebit =
      (calculatedAmounts ? calculatedAmounts[0].category_balance_debit : 0) -
      expensesFromInvestmentAccounts;

    category.current_amount_credit = Math.abs(
      Number(ConvertUtils.convertBigIntegerToFloat(currentAmountCredit))
    );
    category.current_amount_debit = Math.abs(
      Number(ConvertUtils.convertBigIntegerToFloat(currentAmountDebit))
    );

    const previousMonth = monthToUse > 1 ? monthToUse - 1 : 12;
    const previousMonthsYear = monthToUse > 1 ? yearToUse : yearToUse - 1;
    const previousMonthAmounts = await CategoryService.getAmountForCategoryInMonth(
      category.category_id,
      previousMonth,
      previousMonthsYear,
      true,
      dbclient
    )[0];
    category.avg_previous_month_credit = Math.abs(
      Number(ConvertUtils.convertBigIntegerToFloat(previousMonthAmounts?.category_balance_credit))
    );
    category.avg_previous_month_debit = Math.abs(
      Number(ConvertUtils.convertBigIntegerToFloat(previousMonthAmounts?.category_balance_debit))
    );

    const sameMonthPreviousYearAmounts = await CategoryService.getAmountForCategoryInMonth(
      category.category_id,
      monthToUse,
      yearToUse - 1,
      true,
      dbclient
    )[0];
    category.avg_same_month_previous_year_credit = Math.abs(
      Number(ConvertUtils.convertBigIntegerToFloat(sameMonthPreviousYearAmounts?.category_balance_credit))
    );
    category.avg_same_month_previous_year_debit = Math.abs(
      Number(ConvertUtils.convertBigIntegerToFloat(sameMonthPreviousYearAmounts?.category_balance_debit))
    );

    const last12MonthsAverageAmounts =
      await CategoryService.getAverageAmountForCategoryInLast12Months(
        category.category_id,
        dbclient
      )[0];
    category.avg_12_months_credit = Math.abs(
      Number(ConvertUtils.convertBigIntegerToFloat(last12MonthsAverageAmounts?.category_balance_credit))
    );
    category.avg_12_months_debit = Math.abs(
      Number(ConvertUtils.convertBigIntegerToFloat(last12MonthsAverageAmounts?.category_balance_debit))
    );

    const lifetimeAverageAmounts = await CategoryService.getAverageAmountForCategoryInLifetime(
      category.category_id,
      dbclient
    )[0];
    category.avg_lifetime_credit = Math.abs(
      Number(ConvertUtils.convertBigIntegerToFloat(lifetimeAverageAmounts?.category_balance_credit))
    );
    category.avg_lifetime_debit = Math.abs(
      Number(ConvertUtils.convertBigIntegerToFloat(lifetimeAverageAmounts?.category_balance_debit))
    );
  }
  return budget;
};

const updateBudget = async (userId, budgetId, month, year, catValuesArr, observations) =>
  setupPrismaTransaction(async (prismaTx) => {
    await prismaTx.budgets.update({
      where: {
        users_user_id: userId,
        budget_id: budgetId
      },
      data: {
        month,
        year,
        observations
      }
    });
    // ADD CAT VALUES TO BUDGET CATEGORIES
    await parseCatValuesIntoBudgetCategories(userId, budgetId, catValuesArr, prismaTx);
  });

const changeBudgetStatus = async (userId, budgetId, isOpen, dbClient = prisma) =>
  dbClient.budgets.update({
    where: {
      users_user_id: userId,
      budget_id: budgetId
    },
    data: {
      is_open: isOpen
    }
  });

const removeBudget = async (userId, budgetId, dbClient = undefined) =>
  setupPrismaTransaction(async (prismaTx) => {
    if (!dbClient) {
      dbClient = prismaTx;
    }
    await dbClient.budgets_has_categories.deleteMany({
      where: {
        budgets_budget_id: budgetId,
        budgets_users_user_id: userId
      }
    });

    await dbClient.budgets.delete({
      where: {
        budget_id: budgetId,
        users_user_id: userId
      }
    });
  });

export default {
  getAllBudgetsForUser,
  getFilteredBudgetsForUserByPage,
  getCategoryDataForNewBudget,
  createBudget,
  getBudget,
  updateBudget,
  changeBudgetStatus,
  removeBudget
};
