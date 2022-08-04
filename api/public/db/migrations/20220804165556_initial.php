<?php

use Phinx\Db\Adapter\MysqlAdapter;

class Initial extends Phinx\Migration\AbstractMigration
{
    public function change()
    {
        $this->execute("ALTER DATABASE CHARACTER SET 'utf8mb4';");
        $this->execute("ALTER DATABASE COLLATE='utf8mb4_0900_ai_ci';");
        $this->table('accounts', [
                'id' => false,
                'primary_key' => ['account_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('account_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'identity' => 'enable',
            ])
            ->addColumn('name', 'string', [
                'null' => false,
                'limit' => 255,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'account_id',
            ])
            ->addColumn('type', 'string', [
                'null' => false,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'name',
            ])
            ->addColumn('description', 'text', [
                'null' => true,
                'limit' => MysqlAdapter::TEXT_MEDIUM,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'type',
            ])
            ->addColumn('exclude_from_budgets', 'boolean', [
                'null' => false,
                'limit' => MysqlAdapter::INT_TINY,
                'after' => 'description',
            ])
            ->addColumn('status', 'string', [
                'null' => false,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'exclude_from_budgets',
            ])
            ->addColumn('users_user_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'status',
            ])
            ->addColumn('current_balance', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'users_user_id',
            ])
            ->addColumn('created_timestamp', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'current_balance',
            ])
            ->addColumn('updated_timestamp', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'created_timestamp',
            ])
            ->addColumn('color_gradient', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'updated_timestamp',
            ])
            ->addIndex(['account_id'], [
                'name' => 'account_id_UNIQUE',
                'unique' => true,
            ])
            ->addIndex(['users_user_id'], [
                'name' => 'fk_accounts_users1_idx',
                'unique' => false,
            ])
            ->addIndex(['name', 'users_user_id'], [
                'name' => 'name_UNIQUE',
                'unique' => true,
            ])
            ->create();
        $this->table('balances', [
                'id' => false,
                'primary_key' => ['balance_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('balance_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'identity' => 'enable',
            ])
            ->addColumn('date_timestamp', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'balance_id',
            ])
            ->addColumn('amount', 'double', [
                'null' => false,
                'after' => 'date_timestamp',
            ])
            ->addColumn('accounts_account_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'amount',
            ])
            ->addIndex(['accounts_account_id'], [
                'name' => 'fk_balances_accounts1_idx',
                'unique' => false,
            ])
            ->create();
        $this->table('balances_snapshot', [
                'id' => false,
                'primary_key' => ['accounts_account_id', 'month', 'year'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('accounts_account_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
            ])
            ->addColumn('month', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'accounts_account_id',
            ])
            ->addColumn('year', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'month',
            ])
            ->addColumn('balance', 'integer', [
                'null' => false,
                'default' => '0',
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'year',
            ])
            ->addColumn('created_timestamp', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'balance',
            ])
            ->addColumn('updated_timestamp', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'created_timestamp',
            ])
            ->addIndex(['accounts_account_id'], [
                'name' => 'fk_balances_snapshot_accounts1_idx',
                'unique' => false,
            ])
            ->create();
        $this->table('budgets', [
                'id' => false,
                'primary_key' => ['budget_id', 'users_user_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('budget_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'identity' => 'enable',
            ])
            ->addColumn('month', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'budget_id',
            ])
            ->addColumn('year', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'month',
            ])
            ->addColumn('observations', 'text', [
                'null' => true,
                'limit' => MysqlAdapter::TEXT_MEDIUM,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'year',
            ])
            ->addColumn('is_open', 'boolean', [
                'null' => false,
                'limit' => MysqlAdapter::INT_TINY,
                'after' => 'observations',
            ])
            ->addColumn('initial_balance', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'is_open',
            ])
            ->addColumn('users_user_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'initial_balance',
            ])
            ->addIndex(['budget_id'], [
                'name' => 'budget_id_UNIQUE',
                'unique' => true,
            ])
            ->addIndex(['users_user_id'], [
                'name' => 'fk_budgets_users1_idx',
                'unique' => false,
            ])
            ->addIndex(['month', 'year', 'users_user_id'], [
                'name' => 'uq_month_year_user',
                'unique' => true,
            ])
            ->create();
        $this->table('budgets_has_categories', [
                'id' => false,
                'primary_key' => ['budgets_budget_id', 'budgets_users_user_id', 'categories_category_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('budgets_budget_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
            ])
            ->addColumn('budgets_users_user_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'budgets_budget_id',
            ])
            ->addColumn('categories_category_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'budgets_users_user_id',
            ])
            ->addColumn('planned_amount_credit', 'integer', [
                'null' => false,
                'default' => '0',
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'categories_category_id',
            ])
            ->addColumn('current_amount', 'integer', [
                'null' => false,
                'default' => '0',
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'planned_amount_credit',
            ])
            ->addColumn('planned_amount_debit', 'integer', [
                'null' => false,
                'default' => '0',
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'current_amount',
            ])
            ->addIndex(['budgets_budget_id', 'budgets_users_user_id'], [
                'name' => 'fk_budgets_has_categories_budgets1_idx',
                'unique' => false,
            ])
            ->addIndex(['categories_category_id'], [
                'name' => 'fk_budgets_has_categories_categories1_idx',
                'unique' => false,
            ])
            ->create();
        $this->table('categories', [
                'id' => false,
                'primary_key' => ['category_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('category_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'identity' => 'enable',
            ])
            ->addColumn('name', 'string', [
                'null' => false,
                'limit' => 255,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'category_id',
            ])
            ->addColumn('type', 'char', [
                'null' => false,
                'limit' => 1,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'name',
            ])
            ->addColumn('users_user_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'type',
            ])
            ->addColumn('description', 'text', [
                'null' => true,
                'limit' => MysqlAdapter::TEXT_MEDIUM,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'users_user_id',
            ])
            ->addColumn('color_gradient', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'description',
            ])
            ->addColumn('status', 'string', [
                'null' => false,
                'default' => 'Ativa',
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'color_gradient',
            ])
            ->addIndex(['users_user_id'], [
                'name' => 'fk_category_users_idx',
                'unique' => false,
            ])
            ->addIndex(['users_user_id', 'type', 'name'], [
                'name' => 'uq_name_type_user_id',
                'unique' => true,
            ])
            ->create();
        $this->table('entities', [
                'id' => false,
                'primary_key' => ['entity_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('entity_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('name', 'string', [
                'null' => false,
                'limit' => 255,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'entity_id',
            ])
            ->addColumn('users_user_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'name',
            ])
            ->addIndex(['entity_id'], [
                'name' => 'entity_id_UNIQUE',
                'unique' => true,
            ])
            ->addIndex(['users_user_id'], [
                'name' => 'fk_entities_users1_idx',
                'unique' => false,
            ])
            ->addIndex(['name'], [
                'name' => 'name',
                'unique' => false,
            ])
            ->addIndex(['name', 'users_user_id'], [
                'name' => 'name_UNIQUE',
                'unique' => true,
            ])
            ->create();
        $this->table('invest_asset_evo_snapshot', [
                'id' => false,
                'primary_key' => ['month', 'year', 'invest_assets_asset_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('month', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
            ])
            ->addColumn('year', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'month',
            ])
            ->addColumn('units', 'decimal', [
                'null' => false,
                'precision' => '16',
                'scale' => '6',
                'after' => 'year',
            ])
            ->addColumn('invested_amount', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'units',
            ])
            ->addColumn('current_value', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'invested_amount',
            ])
            ->addColumn('invest_assets_asset_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'current_value',
            ])
            ->addColumn('created_at', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'invest_assets_asset_id',
            ])
            ->addColumn('updated_at', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'created_at',
            ])
            ->addColumn('withdrawn_amount', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'updated_at',
            ])
            ->addIndex(['invest_assets_asset_id'], [
                'name' => 'fk_invest_asset_evo_snapshot_invest_assets1_idx',
                'unique' => false,
            ])
            ->addIndex(['month', 'year', 'invest_assets_asset_id'], [
                'name' => 'uq_month_year_invest_assets_asset_id',
                'unique' => true,
            ])
            ->create();
        $this->table('invest_assets', [
                'id' => false,
                'primary_key' => ['asset_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('asset_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'identity' => 'enable',
            ])
            ->addColumn('name', 'string', [
                'null' => false,
                'limit' => 75,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'asset_id',
            ])
            ->addColumn('ticker', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'name',
            ])
            ->addColumn('units', 'decimal', [
                'null' => false,
                'precision' => '16',
                'scale' => '6',
                'after' => 'ticker',
            ])
            ->addColumn('type', 'string', [
                'null' => false,
                'limit' => 75,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'units',
            ])
            ->addColumn('broker', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'type',
            ])
            ->addColumn('created_at', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'broker',
            ])
            ->addColumn('updated_at', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'created_at',
            ])
            ->addColumn('users_user_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'updated_at',
            ])
            ->addIndex(['asset_id'], [
                'name' => 'asset_id_UNIQUE',
                'unique' => true,
            ])
            ->addIndex(['users_user_id'], [
                'name' => 'fk_invest_assets_users1_idx',
                'unique' => false,
            ])
            ->addIndex(['name', 'type', 'users_user_id'], [
                'name' => 'users_user_id_type_name_unique',
                'unique' => true,
            ])
            ->create();
        $this->table('invest_desired_allocations', [
                'id' => false,
                'primary_key' => ['desired_allocations_id', 'type'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('desired_allocations_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'identity' => 'enable',
            ])
            ->addColumn('type', 'string', [
                'null' => false,
                'limit' => 75,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'desired_allocations_id',
            ])
            ->addColumn('alloc_percentage', 'float', [
                'null' => true,
                'after' => 'type',
            ])
            ->addColumn('users_user_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'alloc_percentage',
            ])
            ->addIndex(['desired_allocations_id'], [
                'name' => 'desired_allocations_id_UNIQUE',
                'unique' => true,
            ])
            ->addIndex(['users_user_id'], [
                'name' => 'fk_invest_desired_allocations_users1_idx',
                'unique' => false,
            ])
            ->addIndex(['type'], [
                'name' => 'type_UNIQUE',
                'unique' => true,
            ])
            ->create();
        $this->table('invest_transactions', [
                'id' => false,
                'primary_key' => ['transaction_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('transaction_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'identity' => 'enable',
            ])
            ->addColumn('date_timestamp', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'transaction_id',
            ])
            ->addColumn('type', 'enum', [
                'null' => false,
                'limit' => 1,
                'values' => ['B', 'S'],
                'after' => 'date_timestamp',
            ])
            ->addColumn('note', 'string', [
                'null' => true,
                'limit' => 100,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'type',
            ])
            ->addColumn('total_price', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'note',
            ])
            ->addColumn('units', 'decimal', [
                'null' => false,
                'precision' => '16',
                'scale' => '6',
                'after' => 'total_price',
            ])
            ->addColumn('invest_assets_asset_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'units',
            ])
            ->addColumn('created_at', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'invest_assets_asset_id',
            ])
            ->addColumn('updated_at', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'created_at',
            ])
            ->addIndex(['invest_assets_asset_id'], [
                'name' => 'fk_invest_transactions_invest_assets1_idx',
                'unique' => false,
            ])
            ->addIndex(['transaction_id'], [
                'name' => 'transaction_id_UNIQUE',
                'unique' => true,
            ])
            ->create();
        $this->table('rules', [
                'id' => false,
                'primary_key' => ['rule_id', 'users_user_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('rule_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'identity' => 'enable',
            ])
            ->addColumn('matcher_description_operator', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'rule_id',
            ])
            ->addColumn('matcher_description_value', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'matcher_description_operator',
            ])
            ->addColumn('matcher_amount_operator', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'matcher_description_value',
            ])
            ->addColumn('matcher_amount_value', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'matcher_amount_operator',
            ])
            ->addColumn('matcher_type_operator', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'matcher_amount_value',
            ])
            ->addColumn('matcher_type_value', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'matcher_type_operator',
            ])
            ->addColumn('matcher_account_to_id_operator', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'matcher_type_value',
            ])
            ->addColumn('matcher_account_to_id_value', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'matcher_account_to_id_operator',
            ])
            ->addColumn('matcher_account_from_id_operator', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'matcher_account_to_id_value',
            ])
            ->addColumn('matcher_account_from_id_value', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'matcher_account_from_id_operator',
            ])
            ->addColumn('assign_category_id', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'matcher_account_from_id_value',
            ])
            ->addColumn('assign_entity_id', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'assign_category_id',
            ])
            ->addColumn('assign_account_to_id', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'assign_entity_id',
            ])
            ->addColumn('assign_account_from_id', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'assign_account_to_id',
            ])
            ->addColumn('assign_type', 'string', [
                'null' => true,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'assign_account_from_id',
            ])
            ->addColumn('users_user_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'assign_type',
            ])
            ->addIndex(['users_user_id'], [
                'name' => 'fk_rules_users1_idx',
                'unique' => false,
            ])
            ->create();
        $this->table('transactions', [
                'id' => false,
                'primary_key' => ['transaction_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('transaction_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'identity' => 'enable',
            ])
            ->addColumn('date_timestamp', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'transaction_id',
            ])
            ->addColumn('amount', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'date_timestamp',
            ])
            ->addColumn('type', 'char', [
                'null' => false,
                'limit' => 1,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'amount',
            ])
            ->addColumn('description', 'text', [
                'null' => true,
                'limit' => MysqlAdapter::TEXT_MEDIUM,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'type',
            ])
            ->addColumn('entities_entity_id', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'description',
            ])
            ->addColumn('accounts_account_from_id', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'entities_entity_id',
            ])
            ->addColumn('accounts_account_to_id', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'accounts_account_from_id',
            ])
            ->addColumn('categories_category_id', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'accounts_account_to_id',
            ])
            ->addIndex(['accounts_account_from_id'], [
                'name' => 'fk_transactions_accounts1_idx',
                'unique' => false,
            ])
            ->addIndex(['categories_category_id'], [
                'name' => 'fk_transactions_categories1_idx',
                'unique' => false,
            ])
            ->addIndex(['entities_entity_id'], [
                'name' => 'fk_transactions_entities2_idx',
                'unique' => false,
            ])
            ->addIndex(['transaction_id'], [
                'name' => 'transaction_id_UNIQUE',
                'unique' => true,
            ])
            ->create();
        $this->table('users', [
                'id' => false,
                'primary_key' => ['user_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('user_id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_BIG,
                'identity' => 'enable',
            ])
            ->addColumn('username', 'string', [
                'null' => false,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'user_id',
            ])
            ->addColumn('password', 'text', [
                'null' => false,
                'limit' => 65535,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'username',
            ])
            ->addColumn('email', 'string', [
                'null' => false,
                'limit' => 45,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'password',
            ])
            ->addColumn('sessionkey', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'email',
            ])
            ->addColumn('sessionkey_mobile', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'utf8_general_ci',
                'encoding' => 'utf8',
                'after' => 'sessionkey',
            ])
            ->addColumn('trustlimit', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'sessionkey_mobile',
            ])
            ->addColumn('trustlimit_mobile', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'trustlimit',
            ])
            ->addColumn('last_update_timestamp', 'integer', [
                'null' => false,
                'default' => '0',
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'trustlimit_mobile',
            ])
            ->addIndex(['email'], [
                'name' => 'email_UNIQUE',
                'unique' => true,
            ])
            ->addIndex(['username'], [
                'name' => 'username_UNIQUE',
                'unique' => true,
            ])
            ->create();
    }
}
