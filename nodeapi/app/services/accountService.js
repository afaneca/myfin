import prisma from '../config/prisma.js';
import ConvertUtils from '../utils/convertUtils.js';
import { MYFIN } from '../consts.js';
import Logger from '../utils/Logger.js';
import DateTimeUtils from '../utils/DateTimeUtils.js';

const Account = prisma.accounts;
const Transaction = prisma.transactions;
const BalanceSnapshot = prisma.balances_snapshot;

const accountService = {
  createAccount: async (account, userId) => {
    // eslint-disable-next-line no-param-reassign
    account.users_user_id = userId;
    // eslint-disable-next-line no-param-reassign
    account.current_balance = ConvertUtils.convertFloatToBigInteger(account.current_balance);
    const result = Account.create({
      data: account,
    });

    return result;
  },
  getAccountsForUser: async (userId) =>
    Account.findMany({
      where: {
        users_user_id: userId,
      },
    }),
  getAccountsForUserWithAmounts: async (userId, onlyActive = false) => {
    const onlyActiveExcerpt = onlyActive ? `AND a.status = ${MYFIN.ACCOUNT_STATUS.ACTIVE}` : '';

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
  doesAccountBelongToUser: async (userId, accountId) => {
    const result = await Account.findUnique({
      where: {
        users_user_id: userId,
        account_id: accountId,
      },
    });

    return result !== null;
  },
  deleteAccount: async (accountId) => {
    Logger.addLog(`accountID: ${accountId}`);
    const deleteTransactions = Transaction.deleteMany({
      where: {
        OR: [{ accounts_account_from_id: accountId }, { accounts_account_to_id: accountId }],
      },
    });

    const deleteBalanceSnapshots = BalanceSnapshot.deleteMany({
      where: { accounts_account_id: accountId },
    });

    const deleteAccount = Account.delete({
      where: { account_id: accountId },
    });

    await prisma.$transaction([deleteTransactions, deleteBalanceSnapshots, deleteAccount]);
  },
  updateAccount: async (account, userId) => {
    // eslint-disable-next-line no-param-reassign
    account.users_user_id = userId;
    // eslint-disable-next-line no-param-reassign
    account.current_balance = ConvertUtils.convertFloatToBigInteger(account.current_balance);
    Logger.addStringifiedLog(account);
    const result = await Account.update({
      where: { account_id: account.account_id },
      data: {
        name: account.name,
        type: account.type,
        description: account.description,
        exclude_from_budgets: account.exclude_from_budgets,
        status: account.status,
        current_balance: account.current_balance,
        color_gradient: account.color_gradient,
        updated_timestamp: DateTimeUtils.getCurrentUnixTimestamp(),
      },
    });

    return result;
  },
};

export default accountService;
