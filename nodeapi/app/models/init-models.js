import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _accounts from  "./accounts.js";
import _balances from  "./balances.js";
import _balances_snapshot from  "./balances_snapshot.js";
import _budgets from  "./budgets.js";
import _budgets_has_categories from  "./budgets_has_categories.js";
import _categories from  "./categories.js";
import _entities from  "./entities.js";
import _invest_asset_evo_snapshot from  "./invest_asset_evo_snapshot.js";
import _invest_assets from  "./invest_assets.js";
import _invest_desired_allocations from  "./invest_desired_allocations.js";
import _invest_transactions from  "./invest_transactions.js";
import _rules from  "./rules.js";
import _transactions from  "./transactions.js";
import _users from  "./users.js";

export default function initModels(sequelize) {
  const accounts = _accounts.init(sequelize, DataTypes);
  const balances = _balances.init(sequelize, DataTypes);
  const balances_snapshot = _balances_snapshot.init(sequelize, DataTypes);
  const budgets = _budgets.init(sequelize, DataTypes);
  const budgets_has_categories = _budgets_has_categories.init(sequelize, DataTypes);
  const categories = _categories.init(sequelize, DataTypes);
  const entities = _entities.init(sequelize, DataTypes);
  const invest_asset_evo_snapshot = _invest_asset_evo_snapshot.init(sequelize, DataTypes);
  const invest_assets = _invest_assets.init(sequelize, DataTypes);
  const invest_desired_allocations = _invest_desired_allocations.init(sequelize, DataTypes);
  const invest_transactions = _invest_transactions.init(sequelize, DataTypes);
  const rules = _rules.init(sequelize, DataTypes);
  const transactions = _transactions.init(sequelize, DataTypes);
  const users = _users.init(sequelize, DataTypes);

  transactions.belongsTo(categories, { as: "categories_category", foreignKey: "categories_category_id"});
  categories.hasMany(transactions, { as: "transactions", foreignKey: "categories_category_id"});
  transactions.belongsTo(entities, { as: "entities_entity", foreignKey: "entities_entity_id"});
  entities.hasMany(transactions, { as: "transactions", foreignKey: "entities_entity_id"});

  return {
    accounts,
    balances,
    balances_snapshot,
    budgets,
    budgets_has_categories,
    categories,
    entities,
    invest_asset_evo_snapshot,
    invest_assets,
    invest_desired_allocations,
    invest_transactions,
    rules,
    transactions,
    users,
  };
}
