<?php

use Phinx\Db\Adapter\MysqlAdapter;

class AddsIsEssentialAttrToTransaction extends Phinx\Migration\AbstractMigration
{
    public function change()
    {
        $this->table('rules', [
                'id' => false,
                'primary_key' => ['rule_id', 'users_user_id'],
                'engine' => 'InnoDB',
                'encoding' => 'utf8',
                'collation' => 'utf8_general_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('assign_is_essential', 'boolean', [
                'null' => false,
                'default' => '0',
                'limit' => MysqlAdapter::INT_TINY,
                'after' => 'users_user_id',
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
            ->addColumn('is_essential', 'boolean', [
                'null' => false,
                'default' => '0',
                'limit' => MysqlAdapter::INT_TINY,
                'after' => 'categories_category_id',
            ])
            ->save();
    }
}
