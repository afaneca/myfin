import db from '../models/index.js';
import ConvertUtils from '../utils/convertUtils.js';
import { MYFIN } from '../consts.js';

const Account = db.accounts;

const accountService = {
  createAccount: async (account, userId) => {
    // eslint-disable-next-line no-param-reassign
    account.users_user_id = userId;
    // eslint-disable-next-line no-param-reassign
    account.current_balance = ConvertUtils.convertFloatToBigInteger(account.current_balance);
    return Account.create(account)
      .then((data) => data);
  },
  getAccountsForUser: async (userId) => Account.findAll({
    where: {
      users_user_id: parseInt(userId, 10),
    },
  }),
  getAccountsForUserWithAmounts: async (userId) => Account.findAll({
    attributes: ['account_id', 'name', 'type', 'description', 'status', 'color_gradient', 'exclude_from_budgets', [db.sequelize.literal('current_balance / 100'), 'balance'], 'users_user_id'],
    where: { users_user_id: parseInt(userId, 10) },
    order: [
      [db.sequelize.fn('abs', db.sequelize.col('balance')), 'DESC'],
      [db.sequelize.literal(`case when status='${MYFIN.ACCOUNT_STATUS.INACTIVE}' then 1 else 0 end`)],
    ],
  }),
};

export default accountService;
