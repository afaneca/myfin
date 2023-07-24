import prisma from '../config/prisma.js';
import ConvertUtils from '../utils/convertUtils.js';
import { MYFIN } from '../consts.js';

const Account = prisma.accounts;

const accountService = {
  createAccount: async (account, userId) => {
    // eslint-disable-next-line no-param-reassign
    account.users_user_id = userId;
    // eslint-disable-next-line no-param-reassign
    account.current_balance = ConvertUtils.convertFloatToBigInteger(account.current_balance);
    const result = Account.create({
      data: account
    })

    return result

  },
  getAccountsForUser: async (userId) => Account.findMany({
    where: {
      users_user_id: userId
    }
  }),
  getAccountsForUserWithAmounts: async (userId, onlyActive = false) => {

    let rawSql =
      `SELECT a.account_id, a.name, a.type, a.description, a.status, a.color_gradient, a.exclude_from_budgets, (a.current_balance / 100) as 'balance', a.users_user_id
      FROM accounts a
      WHERE users_user_id = ${userId} 
      ${onlyActive ? `AND a.status = ${MYFIN.ACCOUNT_STATUS.ACTIVE} ` : ' '}
      ORDER BY abs(balance) DESC, case when a.status = '" .
            ${MYFIN.TRX_TYPES.EXPENSE} . "' then 1 else 0 end
      `;
  }
};

export default accountService;
