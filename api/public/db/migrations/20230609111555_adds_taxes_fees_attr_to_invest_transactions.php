<?php

use Phinx\Db\Adapter\MysqlAdapter;

class AddsTaxesFeesAttrToInvestTransactions extends Phinx\Migration\AbstractMigration
{
    public function change()
    {

        $this->table('invest_transactions', [
            'id' => false,
            'primary_key' => ['transaction_id'],
            'engine' => 'InnoDB',
            'encoding' => 'utf8',
            'collation' => 'utf8_general_ci',
            'comment' => '',
            'row_format' => 'DYNAMIC',
        ])
            ->addColumn('fees_taxes', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => MysqlAdapter::INT_BIG,
                'after' => 'units',
            ])
            ->save();
    }
}
