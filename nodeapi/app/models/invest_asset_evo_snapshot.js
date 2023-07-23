import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class invest_asset_evo_snapshot extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
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
    units: {
      type: DataTypes.DECIMAL(16,6),
      allowNull: false
    },
    invested_amount: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    current_value: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    invest_assets_asset_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    withdrawn_amount: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'invest_asset_evo_snapshot',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "month" },
          { name: "year" },
          { name: "invest_assets_asset_id" },
        ]
      },
      {
        name: "uq_month_year_invest_assets_asset_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "month" },
          { name: "year" },
          { name: "invest_assets_asset_id" },
        ]
      },
      {
        name: "fk_invest_asset_evo_snapshot_invest_assets1_idx",
        using: "BTREE",
        fields: [
          { name: "invest_assets_asset_id" },
        ]
      },
    ]
  });
  }
}
