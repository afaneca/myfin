export default function (sequelize, Sequelize) {
  const Transaction = sequelize.define('transactions', {
    transaction_id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    date_timestamp: {
      type: Sequelize.BIGINT,
    },
    amount: {
      type: Sequelize.BIGINT,
    },
    type: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    entities_entity_id: {
      type: Sequelize.BIGINT,
      references: {
        model: 'entities',
        key: 'entity_id',
      },
    },
    accounts_accont_from_id: {
      type: Sequelize.BIGINT,
      references: {
        model: 'accounts',
        key: 'account_id',
      },
    },
    accounts_accont_to_id: {
      type: Sequelize.BIGINT,
      references: {
        model: 'accounts',
        key: 'account_id',
      },
    },
    categories_category_id: {
      type: Sequelize.BIGINT,
      references: {
        model: 'categories',
        key: 'category_id',
      },
    },
  });

  return Transaction;
}
