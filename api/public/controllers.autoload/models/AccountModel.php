<?php

/* TYPES OF ACCOUNTS:
- Checking Accounts (CHEAC)
- Saving Accounts (SAVAC)
- Investment Accounts (INVAC)
- Credit Accounts (CREAC)
- Meal Accounts (MEALAC)
- WALLETS (WALLET)
- Other Accounts (OTHAC)
*/
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
        "updated_timestamp",
        "color_gradient"
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

    public static function getAllAccountsForUserWithAmounts($id_user, $onlyActive = false, $transactional = false)
    {
        $db = new EnsoDB($transactional);
        $sql = "SELECT a.account_id, a.name, a.type, a.description, a.status, a.color_gradient, a.exclude_from_budgets, (a.current_balance / 100) as 'balance', a.users_user_id " .
            "FROM accounts a " .
            "WHERE users_user_id = :userID ";
        if ($onlyActive) {
            $sql .= "AND a.status = :accStatus ";
        }
        $sql .= "ORDER BY abs(balance) DESC, case when a.status = '" .
            DEFAULT_ACCOUNT_INACTIVE_STATUS . "' then 1 else 0 end";

        $values = array();
        $values[':userID'] = $id_user;
        if ($onlyActive)
            $values[':accStatus'] = DEFAULT_ACCOUNT_ACTIVE_STATUS;

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
    static function removeBalanceSnapshotsForUser($userId, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE balances_snapshot FROM balances_snapshot " .
            "LEFT JOIN accounts ON accounts.account_id = balances_snapshot.accounts_account_id " .
            "WHERE users_user_id = :userID ";

        $values = array();
        $values[':userID'] = $userId;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public
    static function deprecated_getBalancesSnapshotForUser($userID, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT account_id, month, year, truncate((coalesce(balance, 0) / 100), 2) as 'balance', users_user_id " .
            "FROM balances_snapshot " .
            "LEFT JOIN accounts ON accounts.account_id = balances_snapshot.accounts_account_id " .
            "WHERE users_user_id = :userID " .
            /*"AND month <= :month " .
            "AND year <= :year " .*/
            "AND ((year = :year AND month <= :month) " .
            "OR (year < :year)) " .
            "ORDER BY year ASC, month ASC";

        $values = array();
        $values[':userID'] = $userID;
        $values[':month'] = date('m');
        $values[':year'] = date("Y");

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
        $firstUserTransactionDate = self::getFirstUserTransactionDate($userID, $transactional);
        $firstMonth = intval($firstUserTransactionDate["month"]);
        $firstYear = intval($firstUserTransactionDate["year"]);


        $currentMonth = date('m');
        $currentYear = date('Y');

        $monthsArr = array();
        $accsArr = AccountModel::getWhere(["users_user_id" => $userID], ["account_id"], false);
        while (AccountModel::monthIsEqualOrPriorTo($firstMonth, $firstYear, $currentMonth, $currentYear)) {
            array_push($monthsArr, [
                "month" => $firstMonth,
                "year" => $firstYear,
                "account_snapshots" => AccountModel::getAllBalancesSnapshotsForMonthForUser($userID, $firstMonth, $firstYear, $accsArr, $transactional)
            ]);


            // increment month
            if ($firstMonth < 12) {
                $firstMonth++;
            } else {
                $firstMonth = 1;
                $firstYear++;
            }
            /*if (!AccountModel::monthIsEqualOrPriorTo($firstMonth, $firstYear, $currentMonth, $currentYear)) {
                break;
            }*/
        }

        return $monthsArr;


        /*$db = new EnsoDB($transactional);

        $sql = "SELECT date_timestamp, MONTH(FROM_UNIXTIME(date_timestamp)) as 'month', YEAR(FROM_UNIXTIME(date_timestamp)) as 'year', entities.users_user_id" .
            "FROM myfin_prod.transactions left join entities " .
            "on entities_entity_id = entities.entity_id " .
            "where users_user_id = :userId " .
            "order by date_timestamp ASC LIMIT 1";


        $values = array();
        $values[':userID'] = $userID;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return self::transformBalanceSnapshotsList($db->fetchAll());
        } catch (Exception $e) {
            return $e;
        }*/
    }

    private static function getAllBalancesSnapshotsForMonthForUser($userID, $month, $year, $accsArr, $transactional = false)
    {
        $accSnapshots = array();
        foreach ($accsArr as $acc) {
            $balance = AccountModel::getBalanceSnapshotAtMonth($acc["account_id"], $month, $year, $transactional);
            array_push($accSnapshots, [
                "account_id" => $acc["account_id"],
                "balance" => ($balance["balance"]) ?? "0"
            ]);
        }

        return $accSnapshots;
    }


    private static function monthIsEqualOrPriorTo(int $firstMonth, int $firstYear, int $currentMonth, int $currentYear): bool
    {
        return ($currentYear > $firstYear || ($firstYear == $currentYear && $currentMonth >= $firstMonth));
    }

    public static function getFirstUserTransactionDate($userID, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT date_timestamp, MONTH(FROM_UNIXTIME(date_timestamp)) as 'month', YEAR(FROM_UNIXTIME(date_timestamp)) as 'year', entities.users_user_id " .
            "FROM transactions left join entities " .
            "on entities_entity_id = entities.entity_id " .
            "where users_user_id = :userID " .
            "order by date_timestamp ASC LIMIT 1";


        $values = array();
        $values[':userID'] = $userID;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetch();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getAmountForInvestmentAccountsInMonth($categoryId, $month, $year, $transactional = false)
    {

        $db = new EnsoDB($transactional);

        $sql = "SELECT sum(if(transactions.type = 'I', amount, 0)) as 'account_balance_credit', sum(if(transactions.type = 'E' OR (transactions.type = 'T'), amount, 0)) as 'account_balance_debit' " .
            "FROM transactions INNER JOIN accounts on accounts.account_id = transactions.accounts_account_from_id OR accounts.account_id = transactions.accounts_account_to_id " .
            "WHERE date_timestamp between :beginTimestamp AND :endTimestamp " .
            " AND categories_category_id = :categoryId " .
            "AND (accounts.type = 'INVAC' AND transactions.type != 'T') ";

        $tz = new DateTimeZone('UTC');
        $beginTimestamp = new DateTime("$year-$month-01", $tz);
        $endTimestamp = new DateTime($beginTimestamp->format('Y-m-t 23:59:59'), $tz);

        $values = array();
        /*$values[':invac'] = "INVAC";
        $values[':transferTag'] = DEFAULT_TYPE_TRANSFER_TAG;*/
        $values[':categoryId'] = $categoryId;
        $values[':beginTimestamp'] = $beginTimestamp->getTimestamp();
        $values[':endTimestamp'] = $endTimestamp->getTimestamp();


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    private static function transformBalanceSnapshotsList($fetchAll)
    {
    }

    public
    static function getBalanceSnapshotAtMonth($accID, $month, $year, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT truncate((coalesce(balance, 0) / 100), 2) as 'balance' " .
            "FROM balances_snapshot " .
            "WHERE accounts_account_id = :accID " .
            "AND ((year = :year AND month <= :month) " .
            "OR (year < :year)) " .
            "ORDER BY year DESC, month DESC " .
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
    static function getBalancesSnapshotForMonthForUser($userID, $month, $year, $includeInvestmentAccounts = true, $transactional = false)
    {
        /*echo "Get balance snapshot for month $month and year $year for user $userID";*/
        /*$db = new EnsoDB($transactional);

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
        }*/

        $totalBalance = 0;
        $accsArr = AccountModel::getWhere(["users_user_id" => $userID], ["account_id", "type"]);
        /*$accsArr = AccountModel::getAllAccountsForUserWithAmounts($userID, false, $transactional);*/


        foreach ($accsArr as $acc) {
            if ($includeInvestmentAccounts || $acc["type"] != "INVAC") {
                $snapshotAtMonth = AccountModel::getBalanceSnapshotAtMonth($acc["account_id"], $month, $year, $transactional);
                $balanceSnapshotAtMonth = floatval($snapshotAtMonth["balance"] ?? 0);
            } else
                $balanceSnapshotAtMonth = 0;
            /*echo "\n-> balance snapshot at month for account " . $acc["account_id"] . ": $balanceSnapshotAtMonth";*/
            if ($balanceSnapshotAtMonth)
                $totalBalance += $balanceSnapshotAtMonth;

            /* echo "\n-> total balance: $totalBalance";*/
        }
        /*die();*/
        return $totalBalance;
    }

    public static function recalculateBalanceForAccountIncrementally($accountID, $fromDate, $toDate, $transactional = false)
    {
        /*
         * Given that I'm unable to know the balance of an account at any specific time (only at the end of each month),
         * I will need to recalculate from the beginning of the previous month relative to $fromDate all the way to the end of
         * month after associated with $toDate.
        */

        /*
         * Loop through all the months that are being recalculated to clean up the data
         * Very important in case there are months with no transactions at all
         */
        $month1 = date("m", $fromDate);
        $year1 = date("Y", $fromDate);
        $month2 = date("m", $toDate);
        $year2 = date("Y", $toDate);
        AccountModel::removeBalanceSnapshotsForAccountBetweenMonths($accountID, $month1, $year1, $month2, $year2, $transactional);

        $beginMonth = date('m', $fromDate);
        $beginYear = date('Y', $fromDate);

        /*echo "begin month & year::\n$beginMonth\t$beginYear\n";*/
        $priorMonthsBalance = Input::convertFloatToIntegerAmount(AccountModel::getBalanceSnapshotAtMonth($accountID, ($beginMonth > 2) ? ($beginMonth - 2) : 12 - 2 + (int)$beginMonth,
            ($beginMonth > 2) ? $beginYear : ($beginYear - 1), $transactional)["balance"] ?? 0);
        if (!$priorMonthsBalance)
            $priorMonthsBalance = 0;

        /*echo("\nprior months balance: $priorMonthsBalance\n");*/
        /*die();*/

        AccountModel::addCustomBalanceSnapshot($accountID, $beginMonth, $beginYear,
            $priorMonthsBalance, $transactional);

        //Reset balance for next 2 months (in case there are no transactions in these months and the balance doesn't get recalculated
        AccountModel::addCustomBalanceSnapshot($accountID, ($beginMonth < 12) ? $beginMonth + 1 : 1, ($beginMonth < 12) ? $beginYear : $beginYear + 1, $priorMonthsBalance, $transactional);
        AccountModel::addCustomBalanceSnapshot($accountID, ($beginMonth < 11) ? $beginMonth + 2 : 1, ($beginMonth < 11) ? $beginYear : $beginYear + 1, $priorMonthsBalance, $transactional);

        // Decrease begin month by 1
        if ($beginMonth > 1) $beginMonth--;
        else {
            $beginMonth = 12;
            $beginYear--;
        }

        $endMonth = date('m', $toDate);
        $endYear = date('Y', $toDate);
        /*echo "end month & year::\n$endMonth\t$endYear\n";*/

        // Increase end month by 1
        if ($endMonth < 12) $endMonth++;
        else {
            $endMonth = 1;
            $endYear++;
        }
        /*echo "beginMonth - 1 = $beginMonth/$beginYear\n";
        echo "endMonth + 1  = $endMonth/$endYear\n";*/
        $fromDate = strtotime("1-$beginMonth-$beginYear");
        $toDate = strtotime("1-$endMonth-$endYear");
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
            $trxAmount = $trx["amount"];

            if ($trxType == DEFAULT_TYPE_EXPENSE_TAG
                || ($trxType == DEFAULT_TYPE_TRANSFER_TAG && $trx["accounts_account_from_id"]
                    && $trx["accounts_account_from_id"] == $accountID)) {
                $trxAmount *= -1;
            }
            //print_r($trxList);
            /*echo("\n#### new transaction of " . Input::convertIntegerToFloatAmount($trxAmount) . " € on " . gmdate("Y-m-d", $trxDate) . " (type: $trxType)\n");
            echo("\ninitial balance before:  " . Input::convertIntegerToFloatAmount($initialBalance));*/
            $initialBalance += $trxAmount;

            /*echo("\ninitial balance after: " . Input::convertIntegerToFloatAmount($initialBalance));
            echo("\n\n--- adding custom balance snapshot to account $accountID, for month $month & year $year, with balance " . Input::convertIntegerToFloatAmount($initialBalance));
            echo("\n\n----------------------------------------------------------------------\n\n");*/
            AccountModel::addCustomBalanceSnapshot($accountID, $month, $year, $initialBalance, $transactional);
            AccountModel::addCustomBalanceSnapshot($accountID, ($month < 12) ? $month + 1 : 1, ($month < 12) ? $year : $year + 1, $initialBalance, $transactional);
            AccountModel::addCustomBalanceSnapshot($accountID, ($month < 11) ? $month + 2 : 1, ($month < 11) ? $year : $year + 1, $initialBalance, $transactional);
        }
        /*die();*/

        return $initialBalance;
    }

    private static function getAllTransactionsForAccountBetweenDates($accountID, $fromDate, $toDate, bool $transactional)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT transaction_id, transactions.date_timestamp, transactions.amount as amount, transactions.type, transactions.description, accounts_account_from_id, accounts_account_to_id " .
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

    public static function setNewAccountBalance($accountId, $balance, bool $transactional = false)
    {

        AccountModel::editWhere([
            "account_id" => $accountId
        ], [
            "current_balance" => (int)$balance
        ], $transactional);
    }

    private static function removeBalanceSnapshotsForAccountBetweenMonths($accountID, string $month1, string $year1, string $month2, string $year2, bool $transactional)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM balances_snapshot " .
            "WHERE accounts_account_id = :accID " .
            "AND ((year > :year1 AND year < :year2) OR (year = :year1 AND month >= :month1) OR (year = :year2 AND month <= :month2))";

        $values = array();
        $values[':accID'] = $accountID;
        $values[':month1'] = $month1;
        $values[':year1'] = $year1;
        $values[':month2'] = $month2;
        $values[':year2'] = $year2;


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function createAccount($userId, $name, $description, $type, $excludeFromBudgets, $status, $colorGradient, $transactional = false)
    {
        if (!AccountModel::exists([
            "name" => $name,
            "users_user_id" => $userId,
        ])) {
            return AccountModel::insert([
                "name" => $name,
                "type" => $type,
                "description" => $description,
                "exclude_from_budgets" => $excludeFromBudgets,
                "status" => $status,
                "users_user_id" => $userId,
                "current_balance" => 0,
                "created_timestamp" => time(),
                "color_gradient" => $colorGradient,
            ], $transactional);
        } else return null;
    }

}
