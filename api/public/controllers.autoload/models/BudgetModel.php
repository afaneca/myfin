<?php

require_once 'consts.php';

class BudgetModel extends Entity
{
    protected static $table = "budgets";

    protected static $columns = [
        "budget_id",
        "month",
        "year",
        "observations",
        "is_open",
        "initial_balance",
        "users_user_id"
    ];


    /*public static function getBudgetsForUser($userID, $isOpen, $transactional = false)
    {

        $db = new EnsoDB($transactional);

        $sql = "SELECT month, year, budget_id,  observations,  is_open, initial_balance, budgets.users_user_id, categories_category_id, categories.name, planned_amount, current_amount " .
            "FROM myfin.budgets " .
            "LEFT JOIN budgets_has_categories " .
            "ON budgets_has_categories.budgets_users_user_id = budgets.users_user_id " .
            "LEFT JOIN categories " .
            "ON categories.category_id = budgets_has_categories.categories_category_id " .
            "WHERE budgets.users_user_id = :userID ";


        if ($isOpen !== null)
            $sql .= "AND is_open = $isOpen ";

        $sql .= "ORDER BY year ASC, month ASC ";
        $values = array();
        $values[':userID'] = $userID;


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }*/
    public static function getBudgetsAfterCertainMonth($userID, int $previousMonth, int $previousMonthsYear, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT month, year, budget_id, users_user_id, observations, is_open, initial_balance " .
            "FROM budgets " .
            "WHERE budgets.users_user_id = :userID " .
            "AND ((year = :year AND month > :month) " .
            "OR (year > :year)) " .
            "ORDER BY year ASC, month ASC";

        $values = array();
        $values[':userID'] = $userID;
        $values[':month'] = $previousMonth;
        $values[':year'] = $previousMonthsYear;


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getBudgetPlannedBalance($budget, $transactional = false)
    {
        $budgetCategoriesArr = BudgetHasCategoriesModel::getAllCategoryPlannedAmountsForBudget($budget["users_user_id"], $budget["budget_id"], $transactional);
        $balance = 0;

        foreach ($budgetCategoriesArr as $budgetCat) {
            $balance += $budgetCat["planned_amount_credit"];
            $balance -= $budgetCat["planned_amount_debit"];
        }

        return Input::convertIntegerToFloatAmount($balance);
    }

    public static function calculateBudgetBalance($userID, $budget, $transactional = false)
    {
        $budgetID = $budget["budget_id"];
        $month = intval($budget["month"]);
        $year = intval($budget["year"]);
        $isOpen = intval($budget["is_open"]);

        $categories = BudgetHasCategoriesModel::getAllCategoriesForBudget($userID, $budgetID, $transactional);

        $balance = 0;

        foreach ($categories as &$category) {
            $monthToUse = $month;
            $yearToUser = $year;

            if ($isOpen) {
                $amount_credit = abs(Input::convertFloatToIntegerAmount($category["planned_amount_credit"]));
                $amount_debit = abs(Input::convertFloatToIntegerAmount($category["planned_amount_debit"]));
            } else {
                $calculatedAmounts = BudgetHasCategoriesModel::getAmountForCategoryInMonth($category["category_id"], $monthToUse, $yearToUser)[0];
                $calculatedAmountsFromInvestmentAccounts = AccountModel::getAmountForInvestmentAccountsInMonth($category["category_id"], $monthToUse, $yearToUser, true)[0];
                $creditFromInvestmentAccounts = $calculatedAmountsFromInvestmentAccounts["account_balance_credit"]; // Unrealized gains
                $expensesFromInvestmentAccounts = $calculatedAmountsFromInvestmentAccounts["account_balance_debit"]; // Unrealized losses
                $amount_credit = abs($calculatedAmounts["category_balance_credit"]) - $creditFromInvestmentAccounts; // remove unrealized gains from budget calcs
                $amount_debit = abs($calculatedAmounts["category_balance_debit"]) - $expensesFromInvestmentAccounts; // remove unrealized losses from budget calcs
            }
            $balance += $amount_credit;
            $balance -= $amount_debit;

            /*if ($budgetID == 2) {
                echo "\n------------------------------------\n";
                echo "Categoria:" . $category["name"] . "\n";
                echo "Crédito: $amount_credit\n";
                echo "Débito: $amount_debit\n";
                echo "Saldo: $balance\n";
                echo "\n------------------------------------\n";
            }*/
        }
        /*if ($budgetID == 2) {
            echo "\n------------------------------------\n";
            echo "Saldo Final: $balance";
            echo "\n------------------------------------\n";
            die();
        }*/
        return Input::convertIntegerToFloatAmount($balance);
    }

    public static function calculateBudgetBalanceChangePercentage($userID, $budget, $budgetBalance, $transactional = false)
    {
        $month = intval($budget["month"]);
        $year = intval($budget["year"]);

        $initialBalance =
            AccountModel::getBalancesSnapshotForMonthForUser($userID, ($month > 1) ? $month - 1 : 12,
                ($month > 1) ? $year : $year - 1, true, $transactional);
        $finalBalance = $initialBalance + $budgetBalance;

        if ($initialBalance == 0) return "NaN";

        /*if ($budget["budget_id"] == 2) {
            echo "Saldo Inicial: $initialBalance\n";
            echo "Saldo Final: $finalBalance\n";
            echo "Percentagem:" . (($finalBalance - $initialBalance) / (abs($initialBalance))* 100) . "\n";
            die();
        }*/
        return (($finalBalance - $initialBalance) / (abs($initialBalance)) * 100);
    }

    public static function getSumAmountsForBudget($userID, $budget, $transactional = false)
    {
        $budgetID = $budget["budget_id"];
        $month = intval($budget["month"]);
        $year = intval($budget["year"]);
        $isOpen = intval($budget["is_open"]);

        $categories = BudgetHasCategoriesModel::getAllCategoriesForBudget($userID, $budgetID, $transactional);

        $balance_credit = $balance_debit = 0;

        foreach ($categories as &$category) {
            $monthToUse = $month;
            $yearToUse = $year;

            if ($isOpen) {
                $amount_credit = abs(Input::convertFloatToIntegerAmount($category["planned_amount_credit"]));
                $amount_debit = abs(Input::convertFloatToIntegerAmount($category["planned_amount_debit"]));
            } else {
                $calculatedAmounts = BudgetHasCategoriesModel::getAmountForCategoryInMonth($category["category_id"], $monthToUse, $yearToUse)[0];
                $calculatedAmountsFromInvestmentAccounts = AccountModel::getAmountForInvestmentAccountsInMonth($category["category_id"], $monthToUse, $yearToUse, true)[0];
                $creditFromInvestmentAccounts = $calculatedAmountsFromInvestmentAccounts["account_balance_credit"]; // Unrealized gains
                $expensesFromInvestmentAccounts = $calculatedAmountsFromInvestmentAccounts["account_balance_debit"]; // Unrealized losses
                $amount_credit = abs($calculatedAmounts["category_balance_credit"] - $creditFromInvestmentAccounts); // remove unrealized gains from budget calcs
                $amount_debit = abs($calculatedAmounts["category_balance_debit"] - $expensesFromInvestmentAccounts); // remove unrealized losses from budget calcs
            }
            if (!$category["exclude_from_budgets"]) {
                $balance_credit += $amount_credit;
                $balance_debit += $amount_debit;
            }
        }

        return ["balance_credit" => Input::convertIntegerToFloatAmount($balance_credit), "balance_debit" => Input::convertIntegerToFloatAmount($balance_debit)];
    }

    public static function getTotalEssentialDebitTransactionsAmountForBudget($userID, $budget, $transactional = false)
    {
        $month = intval($budget["month"]);
        $year = intval($budget["year"]);

        $db = new EnsoDB($transactional);

        $sql = "SELECT sum(amount) as 'amount' FROM transactions " .
            "inner join accounts on transactions.accounts_account_from_id = accounts.account_id " .
            "where users_user_id = :userId " .
            "and date_timestamp between :beginTimestamp AND :endTimestamp " .
            "and transactions.is_essential IS TRUE " .
            "and transactions.type = :type";

        $tz = new DateTimeZone('UTC');
        $beginTimestamp = new DateTime("$year-$month-01", $tz);
        $endTimestamp = new DateTime($beginTimestamp->format('Y-m-t 23:59:59'), $tz);

        $values = array();
        $values[':userId'] = $userID;
        $values[':beginTimestamp'] = $beginTimestamp->getTimestamp();
        $values[':endTimestamp'] = $endTimestamp->getTimestamp();
        $values[':type'] = DEFAULT_TYPE_EXPENSE_TAG;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return Input::convertIntegerToFloatAmount($db->fetch()["amount"] ?? 0);
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getBudgetsUntilCertainMonth($userID, int $nextMonth, int $nextMonthsYear, string $orderByDate = "ASC", $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT month, year, budget_id, users_user_id, observations, is_open, initial_balance " .
            "FROM budgets " .
            "WHERE budgets.users_user_id = :userID " .
            "AND ((year = :year AND month < :month) " .
            "OR (year < :year)) " .
            "ORDER BY year $orderByDate, month $orderByDate";

        $values = array();
        $values[':userID'] = $userID;
        $values[':month'] = $nextMonth;
        $values[':year'] = $nextMonthsYear;


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }
}


class BudgetHasCategoriesModel extends Entity
{
    protected static $table = "budgets_has_categories";

    protected static $columns = [
        "budgets_budget_id",
        "budgets_users_user_id",
        "categories_category_id",
        "planned_amount_credit",
        "planned_amount_debit",
        "current_amount"
    ];


    /**
     * Gets all categories for the user, with planned & current amounts related to a specific budget
     */
    public static function getAllCategoryPlannedAmountsForBudget($userID, $budgetID, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT truncate(coalesce(planned_amount_credit, 0), 2) as planned_amount_credit, truncate(coalesce(planned_amount_debit, 0), 2) as planned_amount_debit " .
            "FROM " .
            "(SELECT * FROM budgets_has_categories WHERE budgets_users_user_id = :userID AND (budgets_budget_id = :budgetID)) b " .
            "RIGHT JOIN categories ON categories.category_id = b.categories_category_id " .
            "WHERE users_user_id = :userID";

        $values = array();
        $values[':userID'] = $userID;
        $values[':budgetID'] = $budgetID;


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    /**
     * Gets all (active) categories for the user, with planned & current amounts related to a specific budget
     */
    public static function getAllCategoriesForBudget($userID, $budgetID, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT users_user_id, category_id, name, status, type, description, color_gradient, budgets_budget_id, exclude_from_budgets, truncate((coalesce(planned_amount_credit, 0) / 100), 2) as planned_amount_credit, truncate((coalesce(planned_amount_debit, 0) / 100), 2) as planned_amount_debit, truncate((coalesce(current_amount, 0) / 100), 2) as current_amount " .
            "FROM " .
            "(SELECT * FROM budgets_has_categories WHERE budgets_users_user_id = :userID AND (budgets_budget_id = :budgetID)) b " .
            "RIGHT JOIN categories ON categories.category_id = b.categories_category_id " .
            "WHERE users_user_id = :userID " .
            "AND status = :status";

        $values = array();
        $values[':userID'] = $userID;
        $values[':budgetID'] = $budgetID;
        $values[':status'] = DEFAULT_CATEGORY_ACTIVE_STATUS;


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }


    public static function addOrUpdateCategoryValueInBudget($userID, $budgetID, $catID, $plannedAmountCredit, $plannedAmountDebit, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "INSERT INTO budgets_has_categories (budgets_budget_id, budgets_users_user_id, categories_category_id, planned_amount_credit, planned_amount_debit) " .
            " VALUES(:budgetID, :userID, :catID, :pamount_credit, :pamount_debit) " .
            " ON DUPLICATE KEY UPDATE planned_amount_credit = :pamount_credit, planned_amount_debit = :pamount_debit";

        $values = array();
        $values[':userID'] = $userID;
        $values[':budgetID'] = $budgetID;
        $values[':catID'] = $catID;
        $values[':pamount_credit'] = $plannedAmountCredit;
        $values[':pamount_debit'] = $plannedAmountDebit;


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }


    /*
   * MYSQL SNIPPET: get balance (income - expense) of a category
      SELECT sum(if(type = "I", amount, -amount)) as 'category_balance'
      FROM transactions
      WHERE date_timestamp between 1 AND 1580806801
      AND categories_category_id IS :cat_id

     * OTHER MYSQL SNIPPET: get income of a category
       SELECT sum(if(type = "I", amount, 0)) as 'category_balance'
       FROM transactions
       WHERE date_timestamp between 1 AND 1580806801
       AND categories_category_id IS :cat_id
   */

    public static function getAmountForCategoryInMonth($category_id, $month, $year, $includeTransfers = true, $transactional = false)
    {
        $tz = new DateTimeZone('UTC');
        $beginTimestamp = new DateTime("$year-$month-01", $tz);
        $endTimestamp = new DateTime($beginTimestamp->format('Y-m-t 23:59:59'), $tz);
        return CategoryModel::getAmountForCategoryInPeriod($category_id, $beginTimestamp->getTimestamp(), $endTimestamp->getTimestamp(), $includeTransfers, $transactional);
    }

    public static function getAverageAmountForCategoryInLast12Months($category_id, $transactional = false)
    {
        $listOfAccountsToExclude = AccountModel::getWhere(["exclude_from_budgets" => true]);
        if (!$listOfAccountsToExclude || sizeof($listOfAccountsToExclude) == 0) {
            $accsExclusionSQLExcerptAccountsTo = " 1 = 1 ";
            $accsExclusionSQLExcerptAccountsFrom = " 1 = 1 ";
        } else {
            $accountsToExcludeListInSQL = BudgetHasCategoriesModel::buildSQLForExcludedAccountsList($listOfAccountsToExclude);
            $accsExclusionSQLExcerptAccountsTo = "accounts_account_to_id NOT IN $accountsToExcludeListInSQL ";
            $accsExclusionSQLExcerptAccountsFrom = "accounts_account_from_id NOT IN $accountsToExcludeListInSQL ";
        }

        $db = new EnsoDB($transactional);

        $sql = "SELECT avg(category_balance_credit) as 'category_balance_credit', avg(category_balance_debit) as 'category_balance_debit' FROM(SELECT sum(if(type = 'I' OR (type = 'T' AND $accsExclusionSQLExcerptAccountsTo), amount, 0)) as 'category_balance_credit', sum(if(type = 'E' OR (type = 'T' AND $accsExclusionSQLExcerptAccountsFrom), amount, 0)) as 'category_balance_debit', MONTH(FROM_UNIXTIME(date_timestamp)) as 'month', YEAR(FROM_UNIXTIME(date_timestamp)) as 'year' " .
            "FROM transactions " .
            "WHERE categories_category_id = :cat_id " .
            /*"AND TIMESTAMPDIFF(MONTH, FROM_UNIXTIME(date_timestamp), FROM_UNIXTIME(UNIX_TIMESTAMP())) < 13 " .*/
            " AND date_timestamp > UNIX_TIMESTAMP(DATE_SUB(DATE_FORMAT(NOW() ,'%Y-%m-01'), INTERVAL 12 month)) " .
            "GROUP BY month, year ) a";

        /*$tz = new DateTimeZone('UTC');
        $previousYear = intval($year - 1);
        $beginTimestamp = new DateTime("$previousYear-$month-01", $tz);
        $endTimestampUnformatted = new DateTime("$year-$month-01", $tz);
        $endTimestamp = new DateTime($endTimestampUnformatted->format('Y-m-t 23:59:59'), $tz);*/

        $values = array();
        $values[':cat_id'] = $category_id;
        /*$values[':beginMonth'] = intval($month);
        $values[':beginYear'] = intval($year);
        $values[':previousYear'] = intval($year) - 1;*/
        /*$values[':beginTimestamp'] = $beginTimestamp->getTimestamp();
        $values[':endTimestamp'] = $endTimestamp->getTimestamp();*/


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getAverageAmountForCategoryInLifetime($category_id, $transactional = false)
    {
        $listOfAccountsToExclude = AccountModel::getWhere(["exclude_from_budgets" => true]);
        if (!$listOfAccountsToExclude || sizeof($listOfAccountsToExclude) == 0) {
            $accsExclusionSQLExcerptAccountsTo = " 1 = 1 ";
            $accsExclusionSQLExcerptAccountsFrom = " 1 = 1 ";
        } else {
            $accountsToExcludeListInSQL = BudgetHasCategoriesModel::buildSQLForExcludedAccountsList($listOfAccountsToExclude);
            $accsExclusionSQLExcerptAccountsTo = "accounts_account_to_id NOT IN $accountsToExcludeListInSQL ";
            $accsExclusionSQLExcerptAccountsFrom = "accounts_account_from_id NOT IN $accountsToExcludeListInSQL ";
        }

        $db = new EnsoDB($transactional);

        $sql = "SELECT avg(category_balance_credit) as 'category_balance_credit', avg(category_balance_debit) as 'category_balance_debit' FROM(SELECT sum(if(type = 'I' OR (type = 'T' AND $accsExclusionSQLExcerptAccountsTo), amount, 0)) as 'category_balance_credit', sum(if(type = 'E' OR (type = 'T' AND $accsExclusionSQLExcerptAccountsFrom), amount, 0)) as 'category_balance_debit', MONTH(FROM_UNIXTIME(date_timestamp)) as 'month', YEAR(FROM_UNIXTIME(date_timestamp)) as 'year' " .
            "FROM transactions " .
            "WHERE categories_category_id = :cat_id " .
            "GROUP BY month, year ) a";

        $values = array();
        $values[':cat_id'] = $category_id;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getAmountForEntityInMonth($entity_id, $month, $year, $transactional = false)
    {
        $listOfAccountsToExclude = AccountModel::getWhere(["exclude_from_budgets" => true]);
        if (!$listOfAccountsToExclude || sizeof($listOfAccountsToExclude) == 0) {
            $accsExclusionSQLExcerptAccountsTo = " 1 = 1 ";
            $accsExclusionSQLExcerptAccountsFrom = " 1 = 1 ";
        } else {
            $accountsToExcludeListInSQL = BudgetHasCategoriesModel::buildSQLForExcludedAccountsList($listOfAccountsToExclude);
            $accsExclusionSQLExcerptAccountsTo = "accounts_account_to_id NOT IN $accountsToExcludeListInSQL ";
            $accsExclusionSQLExcerptAccountsFrom = "accounts_account_from_id NOT IN $accountsToExcludeListInSQL ";
        }

        $db = new EnsoDB($transactional);

        $sql = "SELECT sum(if(type = 'I' OR (type = 'T' AND $accsExclusionSQLExcerptAccountsTo), amount, 0)) as 'entity_balance_credit', sum(if(type = 'E' OR (type = 'T' AND $accsExclusionSQLExcerptAccountsFrom), amount, 0)) as 'entity_balance_debit' " .
            "FROM transactions " .
            "WHERE date_timestamp between :beginTimestamp AND :endTimestamp " .
            "AND entities_entity_id = :ent_id ";

        $tz = new DateTimeZone('UTC');
        $beginTimestamp = new DateTime("$year-$month-01", $tz);
        $endTimestamp = new DateTime($beginTimestamp->format('Y-m-t 23:59:59'), $tz);

        $values = array();
        $values[':ent_id'] = $entity_id;
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

    public static function getAmountForUncategorizedTransactionsInMonth($month, $year, $transactional = false)
    {
        $listOfAccountsToExclude = AccountModel::getWhere(["exclude_from_budgets" => true]);
        if (!$listOfAccountsToExclude || sizeof($listOfAccountsToExclude) == 0) {
            $accsExclusionSQLExcerptAccountsTo = " 1 = 1 ";
            $accsExclusionSQLExcerptAccountsFrom = " 1 = 1 ";
        } else {
            $accountsToExcludeListInSQL = BudgetHasCategoriesModel::buildSQLForExcludedAccountsList($listOfAccountsToExclude);
            $accsExclusionSQLExcerptAccountsTo = "accounts_account_to_id NOT IN $accountsToExcludeListInSQL ";
            $accsExclusionSQLExcerptAccountsFrom = "accounts_account_from_id NOT IN $accountsToExcludeListInSQL ";
        }

        $db = new EnsoDB($transactional);

        $sql = "SELECT sum(if(type = 'I' OR (type = 'T' AND $accsExclusionSQLExcerptAccountsTo), amount, 0)) as 'category_balance_credit', sum(if(type = 'E' OR (type = 'T' AND $accsExclusionSQLExcerptAccountsFrom), amount, 0)) as 'category_balance_debit' " .
            "FROM transactions " .
            "WHERE date_timestamp between :beginTimestamp AND :endTimestamp " .
            "AND categories_category_id IS NULL ";

        $tz = new DateTimeZone('UTC');
        $beginTimestamp = new DateTime("$year-$month-01", $tz);
        $endTimestamp = new DateTime($beginTimestamp->format('Y-m-t 23:59:59'), $tz);

        $values = array();
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

    public static function buildSQLForExcludedAccountsList($excludedAccs)
    {
        if (!$excludedAccs || sizeof($excludedAccs) == 0) return " 1 = 1 ";
        /*print_r($excludedAccs);
        die();*/
        $sql = " (";

        for ($cnt = 0; $cnt < sizeof($excludedAccs); $cnt++) {
            $acc = $excludedAccs[$cnt]["account_id"];
            $sql .= " '$acc'";

            if ($cnt != (sizeof($excludedAccs) - 1)) {
                $sql .= ", ";
            }
        }

        $sql .= ") ";

        return $sql;
    }

}
