import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class budgets extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    budget_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_open: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    initial_balance: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    users_user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'budgets',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "budget_id" },
          { name: "users_user_id" },
        ]
      },
      {
        name: "budget_id_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "budget_id" },
        ]
      },
      {
        name: "uq_month_year_user",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "month" },
          { name: "year" },
          { name: "users_user_id" },
        ]
      },
      {
        name: "fk_budgets_users1_idx",
        using: "BTREE",
        fields: [
          { name: "users_user_id" },
        ]
      },
    ]
  });
  }
}
