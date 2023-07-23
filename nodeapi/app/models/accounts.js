import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class accounts extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    account_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    exclude_from_budgets: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    users_user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    current_balance: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    created_timestamp: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    updated_timestamp: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    color_gradient: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'accounts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "account_id" },
        ]
      },
      {
        name: "account_id_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "account_id" },
        ]
      },
      {
        name: "name_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
          { name: "users_user_id" },
        ]
      },
      {
        name: "fk_accounts_users1_idx",
        using: "BTREE",
        fields: [
          { name: "users_user_id" },
        ]
      },
    ]
  });
  }
}
