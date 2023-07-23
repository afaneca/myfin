import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class balances extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    balance_id: {
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
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    accounts_account_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'balances',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "balance_id" },
        ]
      },
      {
        name: "fk_balances_accounts1_idx",
        using: "BTREE",
        fields: [
          { name: "accounts_account_id" },
        ]
      },
    ]
  });
  }
}
