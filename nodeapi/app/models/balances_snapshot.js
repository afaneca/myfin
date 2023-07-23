import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class balances_snapshot extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    accounts_account_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    balance: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    created_timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    updated_timestamp: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'balances_snapshot',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "accounts_account_id" },
          { name: "month" },
          { name: "year" },
        ]
      },
      {
        name: "fk_balances_snapshot_accounts1_idx",
        using: "BTREE",
        fields: [
          { name: "accounts_account_id" },
        ]
      },
    ]
  });
  }
}
