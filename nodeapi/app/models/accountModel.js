export default function (sequelize, Sequelize) {
  const Account = sequelize.define('accounts', {
    account_id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    exclude_from_budgets: {
      type: Sequelize.BOOLEAN,
    },
    status: {
      type: Sequelize.STRING,
    },
    users_user_id: {
      type: Sequelize.BIGINT,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    current_balance: {
      type: Sequelize.BIGINT,
    },
    created_timestamp: {
      type: Sequelize.BIGINT,
    },
    updated_timestamp: {
      type: Sequelize.BIGINT,
    },
    color_gradient: {
      type: Sequelize.STRING,
    },
  });

  return Account;
}
