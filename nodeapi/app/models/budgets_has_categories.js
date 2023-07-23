import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class budgets_has_categories extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    budgets_budget_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    budgets_users_user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    categories_category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    planned_amount_credit: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    current_amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    planned_amount_debit: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'budgets_has_categories',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "budgets_budget_id" },
          { name: "budgets_users_user_id" },
          { name: "categories_category_id" },
        ]
      },
      {
        name: "fk_budgets_has_categories_budgets1_idx",
        using: "BTREE",
        fields: [
          { name: "budgets_budget_id" },
          { name: "budgets_users_user_id" },
        ]
      },
      {
        name: "fk_budgets_has_categories_categories1_idx",
        using: "BTREE",
        fields: [
          { name: "categories_category_id" },
        ]
      },
    ]
  });
  }
}
