<?php

/* TYPES OF ACCOUNTS:
- Checking Accounts (CHEAC)
- Saving Accounts (SAVAC)
- Investment Accounts (INVAC)
- Credit Accounts (CREAC)
- Other Accounts (OTHAC) */

class BalanceModel extends Entity
{
    protected static $table = "balances";

    protected static $columns = [
        "balance_id",
        "date_timestamp",
        "amount",
        "accounts_account_id",
    ];

    public static function changeBalance($account_id, $offsetAmount, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT a.account_id, a.name, a.type, a.description, b.amount, b.date_timestamp, a.users_user_id " .
            "FROM accounts a " .
            "LEFT JOIN (SELECT c.accounts_account_id, d.amount, c.date_timestamp " .
            "FROM (SELECT accounts_account_id, MAX(date_timestamp) date_timestamp " .
            "FROM balances GROUP BY accounts_account_id) c " .
            "JOIN balances d ON c.accounts_account_id = d.accounts_account_id AND d.date_timestamp = c.date_timestamp) b " .
            "ON a.account_id = b.accounts_account_id " .
            "where users_user_id = :userID ";

        $values = array();
        $values[':userID'] = $id_user;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }
}
