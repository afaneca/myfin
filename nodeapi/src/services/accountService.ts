import { prisma } from "../config/prisma.js";
import ConvertUtils from "../utils/convertUtils.js";
import convertUtils from "../utils/convertUtils.js";
import { MYFIN } from "../consts.js";
import Logger from "../utils/Logger.js";
import DateTimeUtils from "../utils/DateTimeUtils.js";

const Account = prisma.accounts;
const Transaction = prisma.transactions;
const BalanceSnapshot = prisma.balances_snapshot;

export type AccountType = {
  account_id: number,
  name: string,
  type: string,
  description: string,
  status: string,
  exclude_from_budgets: boolean,
  current_balance: number,
  color_gradient?: string,
  users_user_id: number,
}

export type CreateAccountType = {
  name: string,
  type: string,
  description: string,
  status: string,
  exclude_from_budgets: boolean,
  current_balance: number,
  color_gradient?: string,
  users_user_id: bigint,
}

export type UpdateAccountType = {
  account_id: bigint,
  new_name: string,
  new_type: string,
  new_description: string,
  new_status: string,
  exclude_from_budgets: boolean,
  current_balance: number,
  color_gradient?: string,
  users_user_id: bigint,
}
const accountService = {
  createAccount: async (account: CreateAccountType, userId: bigint) => {
    const accountObj = {
      ...account
    };
    // eslint-disable-next-line no-param-reassign
    accountObj.users_user_id = userId;
    // eslint-disable-next-line no-param-reassign
    accountObj.current_balance = ConvertUtils.convertFloatToBigInteger(account.current_balance);
    return Account.create({
      data: accountObj
    });
  },
  getAccountsForUser: async (userId: bigint) =>
    Account.findMany({
      where: {
        users_user_id: userId
      }
    }),
  getActiveAccountsForUser: async (userId: bigint) =>
    Account.findMany({
      where: {
        users_user_id: userId,
        status: MYFIN.ACCOUNT_STATUS.ACTIVE
      }
    }),
  getAccountsForUserWithAmounts: async (userId: bigint, onlyActive = false) => {
    const onlyActiveExcerpt = onlyActive ? `AND a.status = ${MYFIN.ACCOUNT_STATUS.ACTIVE}` : "";

    return prisma.$queryRaw`SELECT a.account_id,
                                   a.name,
                                   a.type,
                                   a.description,
                                   a.status,
                                   a.color_gradient,
                                   a.exclude_from_budgets,
                                   (a.current_balance / 100) as 'balance',
                                   a.users_user_id
                            FROM accounts a
                            WHERE users_user_id = ${userId} || ${onlyActiveExcerpt}
                            ORDER BY abs(balance) DESC, case when a.status = ${MYFIN.TRX_TYPES.EXPENSE} then 1 else 0 end`;
  },
  doesAccountBelongToUser: async (userId: bigint, accountId: bigint) => {
    const result = await Account.findUnique({
      where: {
        users_user_id: userId,
        account_id: accountId
      }
    });

    return result !== null;
  },
  deleteAccount: async (accountId: bigint) => {
    const deleteTransactions = Transaction.deleteMany({
      where: {
        OR: [{ accounts_account_from_id: accountId }, { accounts_account_to_id: accountId }]
      }
    });

    const deleteBalanceSnapshots = BalanceSnapshot.deleteMany({
      where: { accounts_account_id: accountId }
    });

    const deleteAccount = Account.delete({
      where: { account_id: accountId }
    });

    await prisma.$transaction([deleteTransactions, deleteBalanceSnapshots, deleteAccount]);
  },
  updateAccount: async (account: UpdateAccountType, userId: bigint) => {
    const accountObj = {
      ...account,
      users_user_id: userId,
      current_balance: ConvertUtils.convertFloatToBigInteger(account.current_balance)
    };


    return Account.update({
      where: { account_id: accountObj.account_id },
      data: {
        name: accountObj.new_name,
        type: accountObj.new_type,
        description: accountObj.new_description,
        exclude_from_budgets: accountObj.exclude_from_budgets,
        status: accountObj.new_status,
        current_balance: accountObj.current_balance,
        color_gradient: accountObj.color_gradient,
        updated_timestamp: DateTimeUtils.getCurrentUnixTimestamp()
      }
    });
  },
  setNewAccountBalance: async (userId: bigint, accountId: bigint, newBalance: number, prismaClient = prisma) =>
    prismaClient.accounts.update({
      where: {
        users_user_id: userId,
        account_id: accountId
      },
      data: { current_balance: newBalance }
    }),
  removeBalanceSnapshotsForAccountBetweenMonths: async (
    accountId: bigint,
    month1: number,
    year1: number,
    month2: number,
    year2: number,
    prismaClient = prisma
  ) => {
    if (year2 !== year1) {
      return prismaClient.$queryRaw`DELETE
                                    FROM balances_snapshot
                                    WHERE accounts_account_id = ${accountId}
                                      AND ((year > ${year1} AND year < ${year2}) OR
                                           (year = ${year1} AND month >= ${month1}) OR
                                           (year = ${year2} AND month <= ${month2})) `;
    }

    return prismaClient.$queryRaw`DELETE
                                  FROM balances_snapshot
                                  WHERE accounts_account_id = ${accountId}
                                    AND month >= ${month1}
                                    AND month <= ${month2} `;
  },
  getBalanceSnapshotAtMonth: async (
    accId: bigint,
    month: number,
    year: number,
    prismaClient = prisma
  ) : Promise<any> => prismaClient.$queryRaw`SELECT truncate((coalesce(balance, 0) / 100), 2) as 'balance'
                              FROM balances_snapshot
                              WHERE accounts_account_id = ${accId}
                                AND ((year = ${year} AND month <= ${month})
                                  OR (year < ${year}))
                              ORDER BY year DESC, month DESC
                              LIMIT 1`,
  addCustomBalanceSnapshot: async (accountId: bigint, month: number, year: number, newBalance: number, prismaClient = prisma) => {
    const currentTimestamp = DateTimeUtils.getCurrentUnixTimestamp();
    return prismaClient.$queryRaw`INSERT INTO balances_snapshot (accounts_account_id, month, year, balance, created_timestamp)
                                  VALUES (${accountId}, ${month}, ${year},
                                          ${newBalance},
                                          ${currentTimestamp})
                                  ON DUPLICATE KEY UPDATE balance           = ${newBalance},
                                                          updated_timestamp = ${currentTimestamp};`;
  },
  getAllTransactionsForAccountBetweenDates: async (
    accountId: bigint,
    fromDate: number,
    toDate: number,
    prismaClient = prisma
  ): Promise<any[]> => prismaClient.$queryRaw`SELECT transaction_id,
                                     transactions.date_timestamp,
                                     transactions.amount as amount,
                                     transactions.type,
                                     transactions.description,
                                     accounts_account_from_id,
                                     accounts_account_to_id
                              FROM transactions
                              WHERE date_timestamp BETWEEN ${fromDate} AND ${toDate}
                                AND (accounts_account_from_id = ${accountId} OR
                                     accounts_account_to_id = ${accountId})
                              ORDER BY date_timestamp ASC`,
  recalculateBalanceForAccountIncrementally: async (
    accountId: bigint,
    fromDate: number,
    toDate: number,
    prismaClient = prisma
  ) => {
    /* Logger.addLog(`account: ${accountId} | fromDate: ${fromDate} | toDate: ${toDate}`); */
    /*
     * Given that I'm unable to know the balance of an account at any specific time (only at the end of each month),
     * I will need to recalculate from the beginning of the previous month relative to $fromDate all the way to the end of
     * month after associated with $toDate.
     */

    /*
     * Loop through all the months that are being recalculated to clean up the data
     * Very important in case there are months with no transactions at all
     */
    const month1 = DateTimeUtils.getMonthNumberFromTimestamp(fromDate);
    const year1 = DateTimeUtils.getYearFromTimestamp(fromDate);
    const month2 = DateTimeUtils.getMonthNumberFromTimestamp(toDate);
    const year2 = DateTimeUtils.getYearFromTimestamp(toDate);

    await accountService.removeBalanceSnapshotsForAccountBetweenMonths(
      accountId,
      month1,
      year1,
      month2,
      year2,
      prismaClient
    );

    let beginMonth = month1;
    let beginYear = year1;

    let priorMonthsBalance =
      await accountService.getBalanceSnapshotAtMonth(
        accountId,
        beginMonth > 2 ? beginMonth - 2 : 12 - 2 + beginMonth,
        beginMonth > 2 ? beginYear : (beginYear - 1),
        prismaClient
      );
    priorMonthsBalance = convertUtils.convertFloatToBigInteger(priorMonthsBalance.balance || "0");

    if (!priorMonthsBalance) {
      priorMonthsBalance = 0;
    }

    await accountService.addCustomBalanceSnapshot(
      accountId,
      beginMonth,
      beginYear,
      priorMonthsBalance,
      prismaClient
    );

    /* Reset balance for next 2 months (in case there are no transactions in
    these months and the balance doesn't get recalculated */
    await accountService.addCustomBalanceSnapshot(
      accountId,
      beginMonth < 12 ? beginMonth + 1 : 1,
      beginMonth < 12 ? beginYear : beginYear + 1,
      priorMonthsBalance,
      prismaClient
    );
    await accountService.addCustomBalanceSnapshot(
      accountId,
      beginMonth < 11 ? beginMonth + 2 : 1,
      beginMonth < 11 ? beginYear : beginYear + 1,
      priorMonthsBalance,
      prismaClient
    );

    // Decrease begin month by 1
    if (beginMonth > 1) {
      beginMonth -= 1;
    } else {
      beginMonth = 12;
      beginYear -= 1;
    }

    let endMonth = DateTimeUtils.getMonthNumberFromTimestamp(toDate);
    let endYear = DateTimeUtils.getYearFromTimestamp(toDate);

    // Increase end month by 1
    if (endMonth < 12) {
      endMonth += 1;
    } else {
      endMonth = 1;
      endYear += 1;
    }

    fromDate = new Date(`${beginYear}-${beginMonth}-1`).getTime() / 1000;
    toDate = new Date(`${endYear}-${endMonth}-1`).getTime() / 1000;
    const trxList = await accountService.getAllTransactionsForAccountBetweenDates(
      accountId,
      fromDate,
      toDate,
      prismaClient
    );

    let initialBalance = priorMonthsBalance;
    if (!initialBalance) {
      initialBalance = 0;
    }

    for (const trx of trxList) {
      Logger.addStringifiedLog(trx);
      const trxDate = parseInt(trx.date_timestamp, 10);
      const month = DateTimeUtils.getMonthNumberFromTimestamp(trxDate);
      const year = DateTimeUtils.getYearFromTimestamp(trxDate);

      const trxType = trx.type;
      let trxAmount = parseInt(trx.amount, 10);

      if (
        trxType === MYFIN.TRX_TYPES.EXPENSE ||
        (trxType === MYFIN.TRX_TYPES.TRANSFER &&
          trx.accounts_account_from_id &&
          trx.accounts_account_from_id == accountId)
      ) {
        trxAmount *= -1;
        /* Logger.addLog(`Trx type is ${trxType}, trxAmmount: ${trxAmount}`); */
      }

      initialBalance += trxAmount;

      await accountService.addCustomBalanceSnapshot(
        accountId,
        month,
        year,
        initialBalance,
        prismaClient
      );
      await accountService.addCustomBalanceSnapshot(
        accountId,
        month < 12 ? month + 1 : 1,
        month < 12 ? year : year + 1,
        initialBalance,
        prismaClient
      );
      await accountService.addCustomBalanceSnapshot(
        accountId,
        month < 11 ? month + 2 : 1,
        month < 11 ? year : year + 1,
        initialBalance,
        prismaClient
      );
    }

    /* for (const trx in trxList) {

    } */
    /* Logger.addLog(`FINAL BALANCE: ${initialBalance}`); */
    return initialBalance;
  },
  changeBalance: async (
    userId: bigint,
    accountId: number,
    offsetAmount: number,
    prismaClient = prisma
  ) => prismaClient.$queryRaw`UPDATE accounts
                              SET current_balance   = current_balance + ${offsetAmount},
                                  updated_timestamp = ${DateTimeUtils.getCurrentUnixTimestamp()}
                              WHERE account_id = ${accountId}`,
  getAmountForInvestmentAccountsInMonth: async (categoryId: bigint, month: number, year: number, dbClient = prisma) : Promise<Array<{account_balance_credit: number, account_balance_debit: number}>> => {
    const fromDate = new Date(year, month, 1).getTime() / 1000;
    const toDate = new Date(year, month, 0, 23, 59, 59).getTime() / 1000;

    return dbClient.$queryRaw`SELECT sum(if(transactions.type = 'I', amount, 0))                              as 'account_balance_credit',
                                     sum(if(transactions.type = 'E' OR (transactions.type = 'T'), amount, 0)) as 'account_balance_debit'
                              FROM transactions
                                       INNER JOIN accounts
                                                  on accounts.account_id =
                                                     transactions.accounts_account_from_id OR
                                                     accounts.account_id =
                                                     transactions.accounts_account_to_id
                              WHERE date_timestamp between ${fromDate} AND ${toDate}
                                AND categories_category_id = ${categoryId}
                                AND (accounts.type = 'INVAC' AND transactions.type != 'T') `;
  },
  getBalancesSnapshotForMonthForUser: async (
    userId: bigint,
    month: number,
    year: number,
    includeInvestmentAccounts = true,
    dbClient = prisma
  ): Promise<any> => {
    const accsArr = await dbClient.accounts.findMany({
      where: {
        users_user_id: userId
      },
      select: {
        account_id: true,
        type: true
      }
    });

    return accsArr.reduce(async (acc: any, account: any) => {
      let balanceSnapshotAtMonth = 0;
      if (includeInvestmentAccounts || account.type !== MYFIN.ACCOUNT_TYPES.INVESTING) {
        const snapshotAtMonth = await accountService.getBalanceSnapshotAtMonth(
          account.account_id,
          month,
          year,
          dbClient
        );
        balanceSnapshotAtMonth = parseFloat(snapshotAtMonth.balance || "0");
      }
      if (balanceSnapshotAtMonth) {
        return acc + balanceSnapshotAtMonth;
      }

      return acc;
    }, Promise.resolve(0));
  }
};

export default accountService;
