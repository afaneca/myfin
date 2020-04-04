<?php


class BudgetModel extends Entity
{
    protected static $table = "budgets";

    protected static $columns = [
        "budget_id",
        "monty",
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
}
