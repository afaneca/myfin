<?php


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


    public static function getBudgetsForUser($userID, $isOpen, $transactional = false)
    {

        $db = new EnsoDB($transactional);

        $sql = "SELECT budget_id, month, year, observations,  is_open, initial_balance, budgets.users_user_id, categories_category_id, categories.name, planned_amount, current_amount " .
            "FROM myfin.budgets " .
            "LEFT JOIN budgets_has_categories " .
            "ON budgets_has_categories.budgets_users_user_id = budgets.users_user_id " .
            "LEFT JOIN categories " .
            "ON categories.category_id = budgets_has_categories.categories_category_id ";

        if ($isOpen !== null)
            $sql .= "WHERE is_open = $isOpen ";

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
}


class BudgetHasCategoriesModel extends Entity
{
    protected static $table = "budgets_has_categories";

    protected static $columns = [
        "budgets_budget_id",
        "budgets_users_user_id",
        "categories_category_id",
        "planned_amount",
        "current_amount"
    ];


    /**
     * Gets all categories for the user, with planned & current amounts related to a specific budget
     */
    public static function getAllCategoriesForBudget($userID, $budgetID, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT users_user_id, category_id, name, type, description, budgets_budget_id, truncate((coalesce(planned_amount, 0) / 100), 2) as planned_amount, truncate((coalesce(current_amount, 0) / 100), 2) as current_amount " .
            "FROM " .
            "(SELECT * FROM budgets_has_categories WHERE budgets_users_user_id = :userID AND (budgets_budget_id = :budgetID)) b " .
            "RIGHT JOIN categories ON categories.category_id = b.categories_category_id ";

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


    public static function addOrUpdateCategoryValueInBudget($userID, $budgetID, $catID, $plannedAmount, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "INSERT INTO budgets_has_categories (budgets_budget_id, budgets_users_user_id, categories_category_id, planned_amount) " .
            " VALUES(:budgetID, :userID, :catID, :pamount) " .
            " ON DUPLICATE KEY UPDATE planned_amount = :pamount";

        $values = array();
        $values[':userID'] = $userID;
        $values[':budgetID'] = $budgetID;
        $values[':catID'] = $catID;
        $values[':pamount'] = $plannedAmount;


        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }
}
