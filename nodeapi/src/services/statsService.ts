import { prisma } from "../config/prisma.js";
import APIError from "../errorHandling/apiError.js";
import { Prisma } from "@prisma/client";
import CategoryService from "./categoryService.js";
import ConvertUtils from "../utils/convertUtils.js";
import Logger from "../utils/Logger.js";

const getExpensesIncomeDistributionForMonth = async (userId: bigint, month: number, year: number, dbClient = prisma) => {
  interface CategoryDataForStats extends Prisma.categoriesUpdateInput {
    current_amount_credit?: number;
    current_amount_debit?: number;
  }

  const data: {
    categories?: Array<CategoryDataForStats>,
    last_update_timestamp?: bigint,
  } = {};
  // Get budget
  const budget: Prisma.budgetsWhereInput = await dbClient.budgets.findFirstOrThrow({
    where: {
      users_user_id: userId,
      month: month,
      year: year
    }
  }).catch(() => {
    throw APIError.notFound();
  });

  const budgetId = budget.budget_id as bigint;
  const userData: any = await dbClient.users.findUnique({
    where: {
      user_id: userId
    },
    select: {
      last_update_timestamp: true
    }
  });
  data.last_update_timestamp = userData.last_update_timestamp as bigint;

  const budgetCategories = await CategoryService.getAllCategoriesForBudget(userId, budgetId, dbClient);
  data.categories = [];
  for (const category of budgetCategories) {
    const currentAmounts = await CategoryService.getAmountForCategoryInMonth(category.category_id as bigint, month, year, true, dbClient);
    Logger.addStringifiedLog(currentAmounts)
    Logger.addLog(`credit: ${currentAmounts.category_balance_credit} | converted: ${ConvertUtils.convertBigIntegerToFloat(BigInt(currentAmounts.category_balance_credit ?? 0))}`)
    data.categories.push({
      ...category,
      current_amount_credit: ConvertUtils.convertBigIntegerToFloat(BigInt(currentAmounts.category_balance_credit ?? 0)),
      current_amount_debit: ConvertUtils.convertBigIntegerToFloat(BigInt(currentAmounts.category_balance_debit ?? 0))
    });
  }

  return data;
};

export default { getExpensesIncomeDistributionForMonth };