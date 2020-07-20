<?php

/* TYPES OF ACCOUNTS:
- Checking Accounts (CHEAC)
- Saving Accounts (SAVAC)
- Investment Accounts (INVAC)
- Credit Accounts (CREAC)
- Other Accounts (OTHAC) */
require_once 'consts.php';

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
            //AccountModel::addBalanceSnapshotToAllAccounts($id_user, $currentMonth, $currentYear, $transactional);
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

    public static function addCustomBalanceSnapshot($id_account, $month, $year, $newBalance, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "INSERT INTO balances_snapshot (accounts_account_id, month, year, balance, created_timestamp) " .
            "VALUES (:accID, :month, :year, :new_balance, :timestamp) " .
            "ON DUPLICATE KEY UPDATE balance = :new_balance, updated_timestamp = :timestamp;";

        $values = array();
        $values[':accID'] = $id_account;
        $values[':month'] = $month;
        $values[':year'] = $year;
        $values[':timestamp'] = time();
        $values[':new_balance'] = $newBalance;

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
    static function getBalanceSnapshotAtMonth($accID, $month, $year, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT truncate((coalesce(balance, 0) / 100), 2) as 'balance' " .
            "FROM balances_snapshot " .
            "WHERE accounts_account_id = :accID " .
            "AND month = :month " .
            "AND year = :year " .
            "ORDER BY year ASC, month ASC " .
            "LIMIT 1";

        $values = array();
        $values[':accID'] = $accID;
        $values[':month'] = $month;
        $values[':year'] = $year;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetch();
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

    public static function recalculateIterativelyBalanceForAccount($accountID, $fromDate, $toDate, $transactional = false)
    {
        /*
         * Given that I'm unable to know the balance of an account at a specific time (only at the end of each month),
         * I will need to recalculate from the beginning of the month relative to $fromDate all the way to the end of
         * month associated with $toDate.
        */

        $beginMonth = date('m', $fromDate);
        $beginYear = date('Y', $fromDate);

        $priorMonthsBalance = Input::convertFloatToInteger(AccountModel::getBalanceSnapshotAtMonth($accountID, ($beginMonth > 2) ? ($beginMonth - 2) : 1,
            ($beginMonth > 2) ? $beginYear : ($beginYear - 1), $transactional)["balance"]);

        if (!$priorMonthsBalance)
            $priorMonthsBalance = 0;

        /*echo("\nprior months balance: $priorMonthsBalance\n");*/

        AccountModel::addCustomBalanceSnapshot($accountID, $beginMonth, $beginYear,
            $priorMonthsBalance, $transactional);

        //Reset balance for next 2 months (in case there are no transactions in these months and the balance doesn't get recalculated
        AccountModel::addCustomBalanceSnapshot($accountID, ($beginMonth < 12) ? $beginMonth + 1 : 1, ($beginMonth < 12) ? $beginYear : $beginYear + 1, $priorMonthsBalance, $transactional);
        AccountModel::addCustomBalanceSnapshot($accountID, ($beginMonth < 11) ? $beginMonth + 2 : 1, ($beginMonth < 11) ? $beginYear : $beginYear + 1, $priorMonthsBalance, $transactional);

        if ($beginMonth > 1) $beginMonth--;
        else {
            $beginMonth = 1;
            $beginYear--;
        }

        $endMonth = date('m', $toDate);
        $endYear = date('Y', $toDate);

        if ($endMonth < 12) $endMonth++;
        else {
            $endMonth = 1;
            $endYear++;
        }

        $fromDate = $timestamp = strtotime("1-$beginMonth-$beginYear");
        $toDate = $timestamp = strtotime("1-$endMonth-$endYear");
        /*echo("$fromDate\n");
        echo($toDate);
        die();*/
        $trxList = AccountModel::getAllTransactionsForAccountBetweenDates($accountID, $fromDate, $toDate, $transactional);
        /*print_r($trxList);
        die();*/
        $initialBalance = $priorMonthsBalance;//AccountModel::getBalanceSnapshotAtMonth($accountID, $beginMonth, $beginYear, $transactional)["balance"];
        if (!$initialBalance) $initialBalance = 0;

        /*echo($initialBalance);
        die();*/
        foreach ($trxList as $trx) {
            $trxDate = $trx["date_timestamp"];
            $month = date('m', $trxDate);
            $year = date('Y', $trxDate);

            $trxType = $trx["type"];
            $trxAmount = Input::convertFloatToInteger($trx["amount"]);

            if ($trxType == DEFAULT_TYPE_EXPENSE_TAG
                || ($trxType == DEFAULT_TYPE_TRANSFER_TAG && $trx["accounts_account_from_id"])) {
                $trxAmount *= -1;
            }
            //print_r($trxList);
            /*echo("\n\n");
            echo("\ninitial balance before: $initialBalance");*/
            $initialBalance += $trxAmount;
            /*echo("\ninitial balance after: $initialBalance");
            //die();
            //AccountModel::addBalanceSnapshot($accountID, $month, $year, $transactional);
            echo("\n\n--- adding custom balance snapshot to account $accountID, for month $month & year $year, with balance $initialBalance");*/
            AccountModel::addCustomBalanceSnapshot($accountID, $month, $year, $initialBalance, $transactional);
            AccountModel::addCustomBalanceSnapshot($accountID, ($month < 12) ? $month + 1 : 1, ($month < 12) ? $year : $year + 1, $initialBalance, $transactional);
            AccountModel::addCustomBalanceSnapshot($accountID, ($month < 11) ? $month + 2 : 1, ($month < 11) ? $year : $year + 1, $initialBalance, $transactional);
        }
        /*die();*/
    }

    private static function getAllTransactionsForAccountBetweenDates($accountID, $fromDate, $toDate, bool $transactional)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT transaction_id, transactions.date_timestamp, (transactions.amount / 100) as amount, transactions.type, transactions.description, accounts_account_from_id, accounts_account_to_id " .
            "FROM transactions " .
            "WHERE date_timestamp BETWEEN :fromDate AND :toDate " .
            "AND( accounts_account_from_id = :accID OR accounts_account_to_id = :accID) " .
            "ORDER BY date_timestamp ASC";

        $values = array();
        $values[':accID'] = $accountID;
        $values[':fromDate'] = $fromDate;
        $values[':toDate'] = $toDate;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

}
