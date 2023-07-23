import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class invest_assets extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    asset_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(75),
      allowNull: false
    },
    ticker: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    units: {
      type: DataTypes.DECIMAL(16,6),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(75),
      allowNull: false
    },
    broker: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    users_user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'invest_assets',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "asset_id" },
        ]
      },
      {
        name: "asset_id_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "asset_id" },
        ]
      },
      {
        name: "users_user_id_type_name_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
          { name: "type" },
          { name: "users_user_id" },
        ]
      },
      {
        name: "fk_invest_assets_users1_idx",
        using: "BTREE",
        fields: [
          { name: "users_user_id" },
        ]
      },
    ]
  });
  }
}
