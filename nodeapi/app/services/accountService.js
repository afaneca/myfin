import db from '../models/index.js';
import ConvertUtils from '../utils/convertUtils.js';

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
};

export default accountService;
