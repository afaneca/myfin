import ConvertUtils from '../utils/convertUtils.js';
import { MYFIN } from '../consts.js';

/* const Transaction = db.transaction; */

const transactionService = {
  /* getTransactionsForUser: async (userId, trxLimit = 99999999999) => db.sequelize.query(
    `SELECT transaction_id,
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
              LEFT JOIN categories ON categories.category_id = transactions.categories_category_id
              LEFT JOIN entities ON entities.entity_id = transactions.entities_entity_id
              LEFT JOIN accounts acc_to ON acc_to.account_id = transactions.accounts_account_to_id
              LEFT JOIN accounts acc_from
                        ON acc_from.account_id = transactions.accounts_account_from_id
     WHERE acc_to.users_user_id = :userId
        OR acc_from.users_user_id = :userId
     GROUP BY transaction_id
     ORDER BY transactions.date_timestamp DESC
     LIMIT :trxLimit`,
    {
      replacements: {
        userId,
        trxLimit
      },
      type: db.sequelize.QueryTypes.SELECT,
    },
  ), */
};

export default transactionService;
