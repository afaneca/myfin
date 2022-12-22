<?php

/* TYPES OF CATEGORIES:
    - C - credit
    - D - debit */

class CategoryModel extends Entity
{
    protected static $table = "categories";

    protected static $columns = [
        "category_id",
        "name",
        "type",
        "description",
        "users_user_id",
        "color_gradient",
        "status",
        "exclude_from_budgets"
    ];

    public static function getAmountForCategoryInPeriod($category_id, $startTimestamp, $endTimestamp, $includeTransfers = true, $transactional = false)
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

        if ($includeTransfers) {
            $sql = "SELECT sum(if(type = 'I' OR (type = 'T' AND $accsExclusionSQLExcerptAccountsTo), amount, 0)) as 'category_balance_credit', sum(if(type = 'E' OR (type = 'T' AND $accsExclusionSQLExcerptAccountsFrom), amount, 0)) as 'category_balance_debit' ";
        } else {
            $sql = "SELECT sum(if(type = 'I', amount, 0)) as 'category_balance_credit', sum(if(type = 'E', amount, 0)) as 'category_balance_debit' ";
        }

        $sql .= "FROM transactions " .
            "WHERE date_timestamp between :beginTimestamp AND :endTimestamp " .
            "AND categories_category_id = :cat_id ";

        $values = array();
        $values[':cat_id'] = $category_id;
        $values[':beginTimestamp'] = $startTimestamp;
        $values[':endTimestamp'] = $endTimestamp;


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getAmountForCategoryInYear($category_id, $year, $includeTransfers = true, $transactional = false)
    {
        $tz = new DateTimeZone('UTC');
        $beginTimestamp = new DateTime("$year-01-01", $tz);
        $endTimestamp = new DateTime("$year-12-31", $tz);
        return CategoryModel::getAmountForCategoryInPeriod($category_id, $beginTimestamp->getTimestamp(), $endTimestamp->getTimestamp(), $includeTransfers, $transactional);
    }
}
