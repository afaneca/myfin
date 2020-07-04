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

    public static function changeBalance($id_user, $id_account, $offsetAmount, $transactional = false)
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
            $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        } finally {
            $currentMonth = date("n");
            $currentYear = date("Y");

            //AccountModel::addBalanceSnapshot($id_account, $currentMonth, $currentYear, $transactional);
            AccountModel::addBalanceSnapshotToAllAccounts($id_user, $currentMonth, $currentYear, $transactional);
        }
    }


    public static function addBalanceSnapshotToAllAccounts($id_user, $month, $year, $transactional = false)
    {

        $accsArr = AccountModel::getWhere(["users_user_id"], ["account_id"]);

        foreach ($accsArr as $acc) {
            AccountModel::addBalanceSnapshot($acc["account_id"], $month, $year);
            if ($month < 12) {
                $month2 = $month + 1;
                $year2 = $year;
            } else {
                $year2 = $year + 1;
                $month2 = 1;
            }
            AccountModel::addBalanceSnapshot($acc["account_id"], $month2, $year2);
        }
    }

    public static function addBalanceSnapshot($id_account, $month, $year, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "INSERT INTO balances_snapshot (accounts_account_id, month, year, balance, created_timestamp) " .
            "VALUES (:accID, :month, :year, (SELECT current_balance FROM accounts WHERE account_id=:accID), :timestamp) " .
            "ON DUPLICATE KEY UPDATE balance = (SELECT current_balance FROM accounts WHERE account_id=:accID), updated_timestamp = :timestamp;";

        $values = array();
        $values[':accID'] = $id_account;
        $values[':month'] = $month;
        $values[':year'] = $year;
        $values[':timestamp'] = time();

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public
    static function removeBalanceSnapshotsForAccount($id_account, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM balances_snapshot " .
            "WHERE accounts_account_id = :accID";

        $values = array();
        $values[':accID'] = $id_account;


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public
    static function getBalancesSnapshotForUser($userID, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT account_id, month, year, truncate((coalesce(balance, 0) / 100), 2) as 'balance', users_user_id " .
            "FROM balances_snapshot " .
            "LEFT JOIN accounts ON accounts.account_id = balances_snapshot.accounts_account_id " .
            "WHERE users_user_id = :userID " .
            "ORDER BY year ASC, month ASC";

        $values = array();
        $values[':userID'] = $userID;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public
    static function getBalancesSnapshotForMonthForUser($userID, $month, $year, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT sum(balance) as 'totalBalance' " .
            "FROM(SELECT account_id, month, year, truncate((coalesce(balance, 0) / 100), 2) as 'balance', users_user_id " .
            "FROM balances_snapshot " .
            "LEFT JOIN accounts ON accounts.account_id = balances_snapshot.accounts_account_id " .
            "WHERE users_user_id = :userID AND month = :month AND year = :year " .
            "ORDER BY year ASC, month ASC) accs;";

        $values = array();
        $values[':userID'] = $userID;
        $values[':month'] = $month;
        $values[':year'] = $year;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetch(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            return $e;
        }
    }
}
