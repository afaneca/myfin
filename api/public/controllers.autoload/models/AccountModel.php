<?php

/* TYPES OF ACCOUNTS:
- Checking Accounts (CHEAC)
- Saving Accounts (SAVAC)
- Investment Accounts (INVAC)
- Credit Accounts (CREAC)
- Other Accounts (OTHAC) */

class AccountModel extends Entity
{
    protected static $table = "accounts";

    protected static $columns = [
        "account_id",
        "name",
        "type",
        "description",
        "exclude_from_budgets",
        "status",
        "users_user_id",
        "current_balance",
        "created_timestamp",
        "updated_timestamp"
    ];

    /*
    SELECT account_id, accounts.name, accounts.description, accounts.type, coalesce(balances.amount, 0) as amount, balances.date_timestamp
    FROM accounts
    LEFT JOIN balances
    ON accounts.account_id = balances.accounts_account_id
    ORDER BY date_timestamp DESC
    LIMIT 1
     */

    /*
    SELECT
    a.account_id, a.name, a.type, a.description, b.amount, b.date_timestamp, a.users_user_id
    FROM accounts a
    LEFT JOIN
    (SELECT c.accounts_account_id, d.amount, c.date_timestamp
    FROM
    (SELECT
    accounts_account_id,
    MAX(date_timestamp) date_timestamp
    FROM balances
    GROUP BY accounts_account_id
    ) c
    JOIN
    balances d
    ON c.accounts_account_id = d.accounts_account_id AND d.date_timestamp = c.date_timestamp
    ) b
    ON a.account_id = b.accounts_account_id
    where users_user_id = 1
     */

    public static function getAllAccountsForUserWithAmounts($id_user, $transactional = false)
    {
        $db = new EnsoDB($transactional);
        $sql = "SELECT a.account_id, a.name, a.type, a.description, a.status, a.exclude_from_budgets, (a.current_balance / 100) as 'balance', a.users_user_id " .
            "FROM accounts a " .
            "WHERE users_user_id = :userID";

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

    public static function changeBalance($id_account, $offsetAmount, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "UPDATE accounts " .
            "SET current_balance = current_balance + :offsetAmount, " .
            "updated_timestamp = :timestamp " .
            "WHERE account_id = :accID";

        $values = array();
        $values[':accID'] = $id_account;
        $values[':offsetAmount'] = $offsetAmount;
        $values[':timestamp'] = time();

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }


    public static function DEPRECATED_getAllAccountsForUserWithAmounts($id_user, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT a.account_id, a.name, a.type, a.description, a.status, a.exclude_from_budgets, (b.amount / 100) as 'balance', b.date_timestamp, a.users_user_id " .
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
