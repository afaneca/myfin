import { prisma, setupPrismaTransaction } from "../config/prisma.js";
import EntityService from "./entityService.js";
import CategoryService from "./categoryService.js";
import AccountService from "./accountService.js";
import UserService from "./userService.js";
import DateTimeUtils from "../utils/DateTimeUtils.js";
import { MYFIN } from "../consts.js";
import ConvertUtils from "../utils/convertUtils.js";
import APIError from "../errorHandling/apiError.js";
import Logger from "../utils/Logger.js";

const getTransactionsForUser = async (userId: number, trxLimit: number) => prisma.$queryRaw`SELECT transaction_id,
                                                                                                   transactions.date_timestamp,
                                                                                                   (transactions.amount / 100) as amount,
                                                                                                   transactions.type,
                                                                                                   transactions.is_essential,
                                                                                                   transactions.description,
                                                                                                   entities.entity_id,
                                                                                                   entities.name               as entity_name,
                                                                                                   categories_category_id,
                                                                                                   categories.name             as category_name,
                                                                                                   accounts_account_from_id,
                                                                                                   acc_to.name                 as account_to_name,
                                                                                                   accounts_account_to_id,
                                                                                                   acc_from.name               as account_from_name
                                                                                            FROM transactions
                                                                                                     LEFT JOIN accounts ON accounts.account_id = transactions.accounts_account_from_id
                                                                                                     LEFT JOIN categories
                                                                                                               ON categories.category_id = transactions.categories_category_id
                                                                                                     LEFT JOIN entities ON entities.entity_id = transactions.entities_entity_id
                                                                                                     LEFT JOIN accounts acc_to
                                                                                                               ON acc_to.account_id = transactions.accounts_account_to_id
                                                                                                     LEFT JOIN accounts acc_from
                                                                                                               ON acc_from.account_id = transactions.accounts_account_from_id
                                                                                            WHERE acc_to.users_user_id = ${userId}
                                                                                               OR acc_from.users_user_id = ${userId}
                                                                                            GROUP BY transaction_id
                                                                                            ORDER BY transactions.date_timestamp DESC
                                                                                            LIMIT ${trxLimit}`;

const getFilteredTransactionsByForUser = async (userId: number, page: number, pageSize: number, searchQuery: string) => {
  const query = `%${searchQuery}%`;
  const offsetValue = page * pageSize;

  // main query for list of results (limited by pageSize and offsetValue)
  const mainQuery = prisma.$queryRaw`SELECT transaction_id,
                                            transactions.is_essential,
                                            transactions.date_timestamp,
                                            (transactions.amount / 100) as amount,
                                            transactions.type,
                                            transactions.description,
                                            entities.entity_id,
                                            entities.name               as entity_name,
                                            categories_category_id,
                                            categories.name             as category_name,
                                            accounts_account_from_id,
                                            acc_to.name                 as account_to_name,
                                            accounts_account_to_id,
                                            acc_from.name               as account_from_name
                                     FROM transactions
                                              LEFT JOIN accounts ON accounts.account_id = transactions.accounts_account_from_id
                                              LEFT JOIN categories
                                                        ON categories.category_id = transactions.categories_category_id
                                              LEFT JOIN entities ON entities.entity_id = transactions.entities_entity_id
                                              LEFT JOIN accounts acc_to
                                                        ON acc_to.account_id = transactions.accounts_account_to_id
                                              LEFT JOIN accounts acc_from
                                                        ON acc_from.account_id = transactions.accounts_account_from_id
                                     WHERE (acc_to.users_user_id = ${userId} OR acc_from.users_user_id = ${userId})
                                       AND (transactions.description LIKE
                                            ${query} OR
                                            acc_from.name LIKE ${query}
                                         OR acc_to.name LIKE ${query}
                                         OR amount LIKE ${query}
                                         OR entities.name LIKE ${query}
                                         OR categories.name LIKE ${query})
                                     GROUP BY transaction_id
                                     ORDER BY transactions.date_timestamp
                                             DESC
                                     LIMIT ${pageSize} OFFSET ${offsetValue}`;

  // count of total of filtered results
  const countQuery = prisma.$queryRaw`SELECT count(*) as 'count'
                                      FROM (SELECT transactions.date_timestamp
                                            from transactions
                                                     LEFT JOIN accounts ON accounts.account_id = transactions.accounts_account_from_id
                                                     LEFT JOIN categories
                                                               ON categories.category_id = transactions.categories_category_id
                                                     LEFT JOIN entities ON entities.entity_id = transactions.entities_entity_id
                                                     LEFT JOIN accounts acc_to
                                                               ON acc_to.account_id = transactions.accounts_account_to_id
                                                     LEFT JOIN accounts acc_from
                                                               ON acc_from.account_id = transactions.accounts_account_from_id
                                            WHERE (acc_to.users_user_id = ${userId} OR acc_from.users_user_id = ${userId})
                                              AND (transactions.description LIKE
                                                   ${query} OR
                                                   acc_from.name LIKE ${query}
                                                OR acc_to.name LIKE ${query}
                                                OR amount LIKE ${query}
                                                OR entities.name LIKE ${query}
                                                OR categories.name LIKE
                                                   ${query})
                                            GROUP BY transaction_id) trx`;

  const totalCountQuery = prisma.$queryRaw`SELECT count(*) as 'count'
                                           FROM (SELECT transactions.date_timestamp
                                                 from transactions
                                                          LEFT JOIN accounts ON accounts.account_id = transactions.accounts_account_from_id
                                                          LEFT JOIN categories
                                                                    ON categories.category_id = transactions.categories_category_id
                                                          LEFT JOIN entities ON entities.entity_id = transactions.entities_entity_id
                                                          LEFT JOIN accounts acc_to
                                                                    ON acc_to.account_id = transactions.accounts_account_to_id
                                                          LEFT JOIN accounts acc_from
                                                                    ON acc_from.account_id = transactions.accounts_account_from_id
                                                 WHERE (acc_to.users_user_id = ${userId} OR acc_from.users_user_id = ${userId})
                                                 GROUP BY transaction_id) trx`;

  const [mainQueryResult, countQueryResult, totalCountQueryResult] = await prisma.$transaction([
    mainQuery,
    countQuery,
    totalCountQuery
  ]);
  return {
    results: mainQueryResult,
    filtered_count: countQueryResult[0].count,
    total_count: totalCountQueryResult[0].count
  };
};
const createTransactionStep0 = async (userId: number) => {
  const [entities, categories, accounts] = await setupPrismaTransaction(async (_) => {
    const ents = await EntityService.getAllEntitiesForUser(userId);
    const cats = await CategoryService.getAllCategoriesForUser(userId);
    const accs = await AccountService.getActiveAccountsForUser(userId);

    return [ents, cats, accs];
  });

  return {
    entities: entities,
    categories: categories,
    accounts: accounts
  };
};

export type CreateTransactionType = { amount: number, type: string, description: string, entity_id?: number, account_from_id?: number, account_to_id?: number, category_id?: number, date_timestamp: number, is_essential: boolean };
const createTransaction = async (userId: number, trx: CreateTransactionType, prismaClient = undefined) => {
  Logger.addStringifiedLog(trx);
  trx.amount = ConvertUtils.convertFloatToBigInteger(trx.amount);
  await setupPrismaTransaction(async (prismaTx) => {
    prismaTx = prismaClient || prismaTx;
    await prismaTx.transactions.create({
      data: {
        date_timestamp: trx.date_timestamp,
        amount: trx.amount,
        type: trx.type,
        description: trx.description,
        entities_entity_id: trx.entity_id,
        accounts_account_from_id: trx.account_from_id,
        accounts_account_to_id: trx.account_to_id,
        categories_category_id: trx.category_id,
        is_essential: trx.is_essential
      }
    });

    await UserService.setupLastUpdateTimestamp(
      userId,
      DateTimeUtils.getCurrentUnixTimestamp(),
      prismaTx
    );

    let newBalance;
    switch (trx.type) {
      case MYFIN.TRX_TYPES.INCOME:
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          trx.account_to_id,
          trx.date_timestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(userId, trx.account_to_id, newBalance, prismaTx);
        break;
      case MYFIN.TRX_TYPES.EXPENSE:
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          trx.account_from_id,
          trx.date_timestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(
          userId,
          trx.account_from_id,
          newBalance,
          prismaTx
        );
        break;
      case MYFIN.TRX_TYPES.TRANSFER:
      default:
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          trx.account_to_id,
          trx.date_timestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(userId, trx.account_to_id, newBalance, prismaTx);
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          trx.account_from_id,
          trx.date_timestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(
          userId,
          trx.account_from_id,
          newBalance,
          prismaTx
        );
        break;
    }
  });
};

const deleteTransaction = async (userId: number, transactionId: number) => {
  await setupPrismaTransaction(async (prismaTx) => {
    const trx = await prismaTx.transactions
      .findUniqueOrThrow({
        where: {
          transaction_id: transactionId
        }
      })
      .catch((err) => {
        throw APIError.notFound(`Transaction could not be found.`);
      });

    const oldTimestamp = parseInt(trx.date_timestamp, 10);
    const oldType = trx.type;
    const oldAccountTo = trx.accounts_account_to_id;
    const oldAccountFrom = trx.accounts_account_from_id;
    Logger.addStringifiedLog(trx);
    // Make sure account belongs to user
    const accountsCount = await prismaTx.accounts.count({
      where: {
        account_id: { in: [oldAccountTo || -1, oldAccountFrom || -1] },
        users_user_id: userId
      }
    });
    if (accountsCount === 0) {
      throw APIError.notFound(`Account could not be found.`);
    }

    // Delete transaction
    await prismaTx.transactions.delete({
      where: {
        transaction_id: transactionId
      }
    });

    await UserService.setupLastUpdateTimestamp(
      userId,
      DateTimeUtils.getCurrentUnixTimestamp(),
      prismaTx
    );

    // Rollback the effect of oldAmount
    let newBalance;
    switch (oldType) {
      case MYFIN.TRX_TYPES.INCOME:
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          oldAccountTo,
          oldTimestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(userId, oldAccountTo, newBalance, prismaTx);
        break;
      case MYFIN.TRX_TYPES.EXPENSE:
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          oldAccountFrom,
          oldTimestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(userId, oldAccountFrom, newBalance, prismaTx);
        break;
      case MYFIN.TRX_TYPES.TRANSFER:
      default:
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          oldAccountTo,
          oldTimestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(userId, oldAccountTo, newBalance, prismaTx);
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          oldAccountFrom,
          oldTimestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(userId, oldAccountFrom, newBalance, prismaTx);
        break;
    }
  });
};

export type UpdatedTrxType = {
  new_amount: number,
  new_type: string
  new_description: string,
  new_entity_id: number,
  new_account_from_id: number,
  new_account_to_id: number,
  new_category_id: number,
  new_date_timestamp: number,
  new_is_essential: boolean,
  transaction_id: number,
  /* SPLIT TRX */
  is_split: boolean,
  split_amount?: number,
  split_category?: number,
  split_entity?: number,
  split_type?: string,
  split_account_from?: number,
  split_account_to?: number,
  split_description?: string,
  split_is_essential?: boolean
};
const updateTransaction = async (userId: number, updatedTrx: UpdatedTrxType) => {
  const trx = {
    ...updatedTrx,
    ...{
      new_amount: ConvertUtils.convertFloatToBigInteger(updatedTrx.new_amount)
    }
  };
  /* trx.amount = ConvertUtils.convertFloatToBigInteger(trx.amount); */
  await setupPrismaTransaction(async (prismaTx) => {
    const outdatedTrx = await prismaTx.transactions.findUniqueOrThrow({
      where: { transaction_id: trx.transaction_id }
    });

    const oldAmount = outdatedTrx.amount;
    const oldType = outdatedTrx.type;
    const oldTimestamp = parseInt(outdatedTrx.date_timestamp, 10);
    const oldAccountTo = outdatedTrx.accounts_account_to_id;
    const oldAccountFrom = outdatedTrx.accounts_account_from_id;

    // Make sure account(s) belong to user
    if (trx.new_account_from_id) {
      await AccountService.doesAccountBelongToUser(userId, trx.new_account_from_id).catch((err) => {
        throw APIError.notAuthorized();
      });
    }

    if (trx.new_account_to_id) {
      await AccountService.doesAccountBelongToUser(userId, trx.new_account_to_id).catch((err) => {
        throw APIError.notAuthorized();
      });
    }

    if (trx.split_account_from) {
      await AccountService.doesAccountBelongToUser(userId, trx.split_account_from).catch((err) => {
        throw APIError.notAuthorized();
      });
    }
    if (trx.split_account_to) {
      await AccountService.doesAccountBelongToUser(userId, trx.split_account_to).catch((err) => {
        throw APIError.notAuthorized();
      });
    }

    await prismaTx.transactions.update({
      where: { transaction_id: trx.transaction_id },
      data: {
        date_timestamp: trx.new_date_timestamp,
        amount: trx.new_amount,
        type: trx.new_type,
        description: trx.new_description,
        entities_entity_id: trx.new_entity_id,
        accounts_account_from_id: trx.new_account_from_id,
        accounts_account_to_id: trx.new_account_to_id,
        categories_category_id: trx.new_category_id,
        is_essential: trx.new_is_essential
      }
    });

    await UserService.setupLastUpdateTimestamp(
      userId,
      DateTimeUtils.getCurrentUnixTimestamp(),
      prismaTx
    );

    // Remove the effect of outdated amount
    let newBalance;
    switch (oldType) {
      case MYFIN.TRX_TYPES.INCOME:
        await AccountService.changeBalance(userId, oldAccountTo, -oldAmount, prismaTx);
        await AccountService.recalculateBalanceForAccountIncrementally(
          oldAccountTo,
          oldTimestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        break;
      case MYFIN.TRX_TYPES.EXPENSE:
        await AccountService.changeBalance(userId, oldAccountFrom, -oldAmount, prismaTx);
        await AccountService.recalculateBalanceForAccountIncrementally(
          oldAccountFrom,
          oldTimestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        break;
      case MYFIN.TRX_TYPES.TRANSFER:
      default:
        await AccountService.changeBalance(userId, oldAccountTo, -oldAmount, prismaTx);
        await AccountService.recalculateBalanceForAccountIncrementally(
          oldAccountTo,
          oldTimestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.changeBalance(userId, oldAccountTo, -oldAmount, prismaTx);
        await AccountService.recalculateBalanceForAccountIncrementally(
          oldAccountTo,
          oldTimestamp - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        break;
    }

    // Add the effect of updated amount
    Logger.addLog(`New type: ${trx.new_type}`);
    switch (trx.new_type) {
      case MYFIN.TRX_TYPES.INCOME:
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          trx.new_account_to_id,
          Math.min(trx.new_date_timestamp, oldTimestamp) - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(
          userId,
          trx.new_account_to_id,
          newBalance,
          prismaTx
        );
        break;
      case MYFIN.TRX_TYPES.EXPENSE:
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          trx.new_account_from_id,
          Math.min(trx.new_date_timestamp, oldTimestamp) - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(
          userId,
          trx.new_account_from_id,
          newBalance,
          prismaTx
        );
        break;
      case MYFIN.TRX_TYPES.TRANSFER:
      default:
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          trx.new_account_to_id,
          Math.min(trx.new_date_timestamp, oldTimestamp) - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(
          userId,
          trx.new_account_to_id,
          newBalance,
          prismaTx
        );
        newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
          trx.new_account_from_id,
          Math.min(trx.new_date_timestamp, oldTimestamp) - 1,
          DateTimeUtils.getCurrentUnixTimestamp() + 1,
          prismaTx
        );
        await AccountService.setNewAccountBalance(
          userId,
          trx.new_account_from_id,
          newBalance,
          prismaTx
        );
        break;
    }

    // SPLIT HANDLING
    if (trx.is_split === true) {
      await createTransaction(
        userId,
        {
          date_timestamp: trx.new_date_timestamp,
          amount: trx.split_amount,
          type: trx.split_type,
          description: trx.split_description,
          entity_id: trx.split_entity,
          category_id: trx.split_category,
          account_from_id: trx.split_account_from,
          account_to_id: trx.split_account_to,
          is_essential: trx.split_is_essential
        },
        prismaTx
      );
    }
  });
};
export default {
  getTransactionsForUser,
  getFilteredTransactionsByForUser,
  createTransactionStep0,
  createTransaction,
  deleteTransaction,
  updateTransaction
};
