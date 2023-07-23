import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class invest_transactions extends Model {
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
    type: {
      type: DataTypes.ENUM('B','S'),
      allowNull: false
    },
    note: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    total_price: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    units: {
      type: DataTypes.DECIMAL(16,6),
      allowNull: false
    },
    fees_taxes: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    invest_assets_asset_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'invest_transactions',
    timestamps: true,
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
        name: "fk_invest_transactions_invest_assets1_idx",
        using: "BTREE",
        fields: [
          { name: "invest_assets_asset_id" },
        ]
      },
    ]
  });
  }
}
