import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class transactions extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    transaction_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    date_timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    type: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    entities_entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'entities',
        key: 'entity_id'
      }
    },
    accounts_account_from_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    accounts_account_to_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    categories_category_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'category_id'
      }
    },
    is_essential: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'transactions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "transaction_id" },
        ]
      },
      {
        name: "transaction_id_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "transaction_id" },
        ]
      },
      {
        name: "fk_transactions_accounts1_idx",
        using: "BTREE",
        fields: [
          { name: "accounts_account_from_id" },
        ]
      },
      {
        name: "fk_transactions_categories1_idx",
        using: "BTREE",
        fields: [
          { name: "categories_category_id" },
        ]
      },
      {
        name: "fk_transactions_entities2_idx",
        using: "BTREE",
        fields: [
          { name: "entities_entity_id" },
        ]
      },
    ]
  });
  }
}
