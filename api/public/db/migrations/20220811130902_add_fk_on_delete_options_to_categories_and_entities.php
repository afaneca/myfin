<?php

use Phinx\Db\Adapter\MysqlAdapter;

class AddFkOnDeleteOptionsToCategoriesAndEntities extends Phinx\Migration\AbstractMigration
{
    public function change()
    {
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
