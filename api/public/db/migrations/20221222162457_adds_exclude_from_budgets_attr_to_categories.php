<?php

use Phinx\Db\Adapter\MysqlAdapter;

class AddsExcludeFromBudgetsAttrToCategories extends Phinx\Migration\AbstractMigration
{
    public function change()
    {
        $this->execute("ALTER DATABASE COLLATE='utf8mb4_0900_ai_ci';");
        $this->table('categories', [
                'id' => false,
                'primary_key' => ['category_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('exclude_from_budgets', 'integer', [
                'null' => false,
                'default' => '0',
                'limit' => MysqlAdapter::INT_TINY,
                'after' => 'status',
            ])
            ->save();
        $this->table('invest_asset_evo_snapshot', [
                'id' => false,
                'primary_key' => ['month', 'year', 'invest_assets_asset_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->changeColumn('units', 'decimal', [
                'null' => false,
                'precision' => '16',
                'scale' => '6',
                'after' => 'year',
            ])
            ->save();
        $this->table('invest_assets', [
                'id' => false,
                'primary_key' => ['asset_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->changeColumn('units', 'decimal', [
                'null' => false,
                'precision' => '16',
                'scale' => '6',
                'after' => 'ticker',
            ])
            ->save();
        $this->table('transactions', [
                'id' => false,
                'primary_key' => ['transaction_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->save();
    }
}
