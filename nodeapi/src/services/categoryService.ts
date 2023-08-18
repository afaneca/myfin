import { prisma } from "../config/prisma.js";
import { MYFIN } from "../consts.js";
import { Prisma } from "@prisma/client";
import DateTimeUtils from "../utils/DateTimeUtils.js";
import Logger from "../utils/Logger.js";

const Category = prisma.categories;
const BudgetHasCategories = prisma.budgets_has_categories;

const getAllCategoriesForUser = async (userId: bigint, dbClient = prisma) =>
  dbClient.categories.findMany({
    where: { users_user_id: userId }
  });
const createCategory = async (category: Prisma.categoriesCreateInput) => {
  return Category.create({ data: category });
};

const deleteCategory = async (userId: bigint, categoryId: number) => {
  const deleteBudgetHasCategoriesRefs = BudgetHasCategories.deleteMany({
    where: {
      categories_category_id: categoryId,
      budgets_users_user_id: userId
    }
  });
  const deleteCat = Category.delete({
    where: {
      users_user_id: userId,
      category_id: categoryId
    }
  });

  return prisma.$transaction([deleteBudgetHasCategoriesRefs, deleteCat]);
};

const updateCategory = async (userId: bigint, categoryId, category: Prisma.categoriesUpdateInput) =>
  Category.update({
    where: {
      users_user_id: userId,
      category_id: categoryId
    },
    data: category
  });

const buildSqlForExcludedAccountsList = (excludedAccs) => {
  if (!excludedAccs || excludedAccs.length === 0) {
    return " 1 == 1";
  }
  let sql = " (";
  for (let cnt = 0; cnt < excludedAccs.length; cnt++) {
    const acc = excludedAccs[cnt].account_id;
    sql += ` '${acc}' `;

    if (cnt !== excludedAccs.length - 1) {
      sql += ", ";
    }
  }
  sql += ") ";
  return sql;
};

const getAverageAmountForCategoryInLast12Months = async (categoryId: number | bigint, dbClient = prisma) => {
  let accsExclusionSqlExcerptAccountsTo = "";
  let accsExclusionSqlExcerptAccountsFrom = "";
  let accountsToExcludeListInSQL = "";

  const listOfAccountsToExclude = await dbClient.accounts.findMany({
    where: { exclude_from_budgets: true }
  });
  if (!listOfAccountsToExclude || listOfAccountsToExclude.length < 1) {
    accsExclusionSqlExcerptAccountsTo = " 1 == 1 ";
    accsExclusionSqlExcerptAccountsFrom = " 1 == 1 ";
  } else {
    accountsToExcludeListInSQL = buildSqlForExcludedAccountsList(listOfAccountsToExclude);
    accsExclusionSqlExcerptAccountsTo = `accounts_account_to_id NOT IN ${accountsToExcludeListInSQL} `;
    accsExclusionSqlExcerptAccountsFrom = `accounts_account_from_id NOT IN ${accountsToExcludeListInSQL} `;
  }

  return dbClient.$queryRaw`SELECT avg(category_balance_credit) as 'category_balance_credit',
                                   avg(category_balance_debit)  as 'category_balance_debit'
                            FROM (SELECT sum(if(type = 'I' OR
                                                (type = 'T' AND ${accsExclusionSqlExcerptAccountsTo}),
                                                amount,
                                                0))                           as 'category_balance_credit',
                                         sum(if(type = 'E' OR
                                                (type = 'T' AND ${accsExclusionSqlExcerptAccountsFrom}),
                                                amount,
                                                0))                           as 'category_balance_debit',
                                         MONTH(FROM_UNIXTIME(date_timestamp)) as 'month',
                                         YEAR(FROM_UNIXTIME(date_timestamp))  as 'year'
                                  FROM transactions
                                  WHERE categories_category_id = ${categoryId}
                                    AND date_timestamp >
                                        UNIX_TIMESTAMP(DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 12 month))
                                  GROUP BY month, year) a`;
};

const getAmountForCategoryInPeriod = async (
  categoryId: number | bigint,
  fromDate: number,
  toDate: number,
  includeTransfers = true,
  dbClient = prisma
): Promise<{ category_balance_credit: number, category_balance_debit: number }> => {
 /*  Logger.addLog(
    `Category: ${categoryId} | fromDate: ${fromDate} | toDate: ${toDate} | includeTransfers: ${includeTransfers}`); */
  let accsExclusionSqlExcerptAccountsTo = "";
  let accsExclusionSqlExcerptAccountsFrom = "";
  let accountsToExcludeListInSQL = "";

  const listOfAccountsToExclude = await dbClient.accounts.findMany({
    where: { exclude_from_budgets: true }
  });
  if (!listOfAccountsToExclude || listOfAccountsToExclude.length < 1) {
    accsExclusionSqlExcerptAccountsTo = " 1 = 1 ";
    accsExclusionSqlExcerptAccountsFrom = " 1 = 1 ";
  } else {
    accountsToExcludeListInSQL = buildSqlForExcludedAccountsList(listOfAccountsToExclude);
    accsExclusionSqlExcerptAccountsTo = `accounts_account_to_id NOT IN ${accountsToExcludeListInSQL} `;
    accsExclusionSqlExcerptAccountsFrom = `accounts_account_from_id NOT IN ${accountsToExcludeListInSQL} `;
  }

  if (includeTransfers) {
    return dbClient.$queryRaw`SELECT sum(if(type = 'I' OR
                                            (type = 'T' AND ${accsExclusionSqlExcerptAccountsTo}),
                                            amount,
                                            0)) as 'category_balance_credit',
                                     sum(if(type = 'E' OR
                                            (type = 'T' AND ${accsExclusionSqlExcerptAccountsFrom}),
                                            amount,
                                            0)) as 'category_balance_debit'
                              FROM transactions
                              WHERE date_timestamp between ${fromDate} AND ${toDate}
                                AND categories_category_id = ${categoryId} `;
  }

  return dbClient.$queryRaw`SELECT sum(if(type = 'I', amount, 0)) as 'category_balance_credit',
                                   sum(if(type = 'E', amount, 0)) as 'category_balance_debit'
                            FROM transactions
                            WHERE date_timestamp between ${fromDate} AND ${toDate}
                              AND categories_category_id = ${categoryId} `;
};
const getAmountForCategoryInMonth = async (
  categoryId: number | bigint,
  month: number,
  year: number,
  includeTransfers = true,
  dbClient = prisma
): Promise<{ category_balance_credit: number, category_balance_debit: number }> => {
  const nextMonth = month < 12 ? month + 1 : 1;
  const nextMonthsYear = month < 12 ? year : year + 1;
  const maxDate = DateTimeUtils.getUnixTimestampFromDate(new Date(nextMonthsYear, nextMonth - 1, 1));
  const minDate = DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 1));
  /* Logger.addLog(`cat id: ${categoryId} | month: ${month} | year: ${year} | minDate: ${minDate} | maxDate: ${maxDate}`); */
  const amounts = await getAmountForCategoryInPeriod(categoryId, minDate, maxDate, includeTransfers, dbClient);
  return amounts[0];
};

const getAverageAmountForCategoryInLifetime = async (categoryId: number | bigint, dbClient = prisma) => {
  let accsExclusionSqlExcerptAccountsTo = "";
  let accsExclusionSqlExcerptAccountsFrom = "";
  let accountsToExcludeListInSQL = "";

  const listOfAccountsToExclude = await dbClient.accounts.findMany({
    where: { exclude_from_budgets: true }
  });
  if (!listOfAccountsToExclude || listOfAccountsToExclude.length < 1) {
    accsExclusionSqlExcerptAccountsTo = " 1 == 1 ";
    accsExclusionSqlExcerptAccountsFrom = " 1 == 1 ";
  } else {
    accountsToExcludeListInSQL = buildSqlForExcludedAccountsList(listOfAccountsToExclude);
    accsExclusionSqlExcerptAccountsTo = `accounts_account_to_id NOT IN ${accountsToExcludeListInSQL} `;
    accsExclusionSqlExcerptAccountsFrom = `accounts_account_from_id NOT IN ${accountsToExcludeListInSQL} `;
  }

  return dbClient.$queryRaw`SELECT avg(category_balance_credit) as 'category_balance_credit',
                                   avg(category_balance_debit)  as 'category_balance_debit'
                            FROM (SELECT sum(if(type = 'I' OR
                                                (type = 'T' AND ${accsExclusionSqlExcerptAccountsTo}),
                                                amount,
                                                0))                           as 'category_balance_credit',
                                         sum(if(type = 'E' OR
                                                (type = 'T' AND ${accsExclusionSqlExcerptAccountsFrom}),
                                                amount,
                                                0))                           as 'category_balance_debit',
                                         MONTH(FROM_UNIXTIME(date_timestamp)) as 'month',
                                         YEAR(FROM_UNIXTIME(date_timestamp))  as 'year'
                                  FROM transactions
                                  WHERE categories_category_id = ${categoryId}
                                  GROUP BY month, year) a`;
};

/**
 * Gets all (active) categories for the user, with planned & current amounts
 * related to a specific budget
 */
const getAllCategoriesForBudget = async (
  userId: number | bigint,
  budgetId: number | bigint,
  dbClient = prisma
): Promise<Array<Prisma.categoriesUpdateInput>> => dbClient.$queryRaw`SELECT users_user_id,
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
                          AND status = ${MYFIN.CATEGORY_STATUS.ACTIVE}`;

const getCountOfUserCategories = async (userId, dbClient = prisma) => dbClient.categories.count({
  where: { users_user_id: userId }
});

export default {
  getAllCategoriesForUser,
  createCategory,
  updateCategory,
  deleteCategory,
  getAmountForCategoryInMonth,
  getAverageAmountForCategoryInLast12Months,
  getAverageAmountForCategoryInLifetime,
  getAllCategoriesForBudget,
  getCountOfUserCategories
};
