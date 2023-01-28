<?php

/**
 * TYPES:
 * I - Income
 * E - Expense
 * T - Transfer
 */

require_once 'consts.php';

class TransactionModel extends Entity
{
    protected static $table = "transactions";

    protected static $columns = [
        "transaction_id",
        "date_timestamp", // I|E|T
        "amount", // I|E|T
        "type", // I|E|T
        "description", // I|E|T
        "entities_entity_id", // I|E
        "accounts_account_from_id", // I|E|T
        "accounts_account_to_id", // T
        "categories_category_id", // I|E|T
        "is_essential"
    ];

    public static function getYearOfFirstTransactionForUser($id_user, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT YEAR(FROM_UNIXTIME(date_timestamp)) as 'year' FROM transactions " .
            "INNER JOIN accounts account_from ON account_from.account_id = transactions.accounts_account_from_id " .
            "INNER JOIN accounts account_to ON account_to.account_id = transactions.accounts_account_to_id " .
            "WHERE account_from.users_user_id = :userId OR account_to.users_user_id = :userId " .
            "ORDER BY date_timestamp ASC LIMIT 1";

        $values = array();
        $values[':userId'] = $id_user;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll()[0]["year"];
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getAllTransactionsForUser($id_user, $trxLimit, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        /* $sql = "SELECT transaction_id, date_timestamp, amount, transactions.type, transactions.description, entities_entity_id, accounts_account_from_id, accounts_account_to_id, users_user_id, categories_category_id FROM transactions " .
            "LEFT JOIN accounts " .
            "ON accounts.account_id = transactions.accounts_account_from_id " .
            "WHERE users_user_id = :userID "; */

        $sql = "SELECT transaction_id, transactions.date_timestamp, (transactions.amount / 100) as amount, transactions.type, transactions.is_essential, transactions.description, entities.entity_id, entities.name as entity_name, categories_category_id, categories.name as category_name, accounts_account_from_id, acc_to.name as account_to_name, accounts_account_to_id, acc_from.name as account_from_name " .
            "FROM transactions " .
            "LEFT JOIN accounts ON accounts.account_id = transactions.accounts_account_from_id " .
            "LEFT JOIN categories ON categories.category_id = transactions.categories_category_id " .
            "LEFT JOIN entities ON entities.entity_id = transactions.entities_entity_id " .
            "LEFT JOIN accounts acc_to ON acc_to.account_id = transactions.accounts_account_to_id " .
            "LEFT JOIN accounts acc_from ON acc_from.account_id = transactions.accounts_account_from_id " .
            "WHERE acc_to.users_user_id = :userID " .
            "OR acc_from.users_user_id = :userID " .
            "GROUP BY transaction_id " .
            "ORDER BY transactions.date_timestamp DESC " .
            "LIMIT $trxLimit";

        $values = array();
        $values[':userID'] = $id_user;
        /*$values[':trxLimit'] = $trxLimit;*/

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getTransactionsForUserByPage($id_user, $page, $pageSize, $transactional = false)
    {
        $offsetValue = intval($page * $pageSize);
        $db = new EnsoDB($transactional);

        /* $sql = "SELECT transaction_id, date_timestamp, amount, transactions.type, transactions.description, entities_entity_id, accounts_account_from_id, accounts_account_to_id, users_user_id, categories_category_id FROM transactions " .
            "LEFT JOIN accounts " .
            "ON accounts.account_id = transactions.accounts_account_from_id " .
            "WHERE users_user_id = :userID "; */

        $sql = "SELECT transaction_id, transactions.is_essential, transactions.date_timestamp, (transactions.amount / 100) as amount, transactions.type, transactions.description, entities.entity_id, entities.name as entity_name, categories_category_id, categories.name as category_name, accounts_account_from_id, acc_to.name as account_to_name, accounts_account_to_id, acc_from.name as account_from_name " .
            "FROM transactions " .
            "LEFT JOIN accounts ON accounts.account_id = transactions.accounts_account_from_id " .
            "LEFT JOIN categories ON categories.category_id = transactions.categories_category_id " .
            "LEFT JOIN entities ON entities.entity_id = transactions.entities_entity_id " .
            "LEFT JOIN accounts acc_to ON acc_to.account_id = transactions.accounts_account_to_id " .
            "LEFT JOIN accounts acc_from ON acc_from.account_id = transactions.accounts_account_from_id " .
            "WHERE acc_to.users_user_id = :userID " .
            "OR acc_from.users_user_id = :userID " .
            "GROUP BY transaction_id " .
            "ORDER BY transactions.date_timestamp DESC " .
            "LIMIT $pageSize OFFSET $offsetValue";

        $values = array();
        $values[':userID'] = $id_user;
        /*$values[':trxLimit'] = $trxLimit;*/

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getAllTransactionsForUserInMonthAndCategory($id_user, $month, $year, $catID, $type, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT transaction_id, transactions.date_timestamp, transactions.is_essential, (transactions.amount / 100) as amount, transactions.type, transactions.description, entities.entity_id, entities.name as entity_name, categories_category_id, categories.name as category_name, accounts_account_from_id, acc_to.name as account_to_name, accounts_account_to_id, acc_from.name as account_from_name " .
            "FROM transactions " .
            "LEFT JOIN accounts ON accounts.account_id = transactions.accounts_account_from_id " .
            "LEFT JOIN categories ON categories.category_id = transactions.categories_category_id " .
            "LEFT JOIN entities ON entities.entity_id = transactions.entities_entity_id " .
            "LEFT JOIN accounts acc_to ON acc_to.account_id = transactions.accounts_account_to_id " .
            "LEFT JOIN accounts acc_from ON acc_from.account_id = transactions.accounts_account_from_id " .
            "WHERE (acc_to.users_user_id = :userID " .
            "OR acc_from.users_user_id = :userID) " .
            "AND categories.category_id ";
        if ($catID == -1)
            $sql .= " IS NULL ";
        else
            $sql .= " = :catID ";

        $sql .= "AND (transactions.type = :type " .
            " OR transactions.type = 'T') " .
            "AND transactions.date_timestamp >= :minTimestamp " .
            "AND transactions.date_timestamp <= :maxTimestamp " .
            "GROUP BY transaction_id " .
            "ORDER BY transactions.date_timestamp DESC ";

        $minDate = strtotime("01-$month-$year");

        $nextMonth = $month < 12 ? $month + 1 : 1;
        $nextMonthsYear = $month < 12 ? $year : $year + 1;
        $maxDate = strtotime("01-$nextMonth-$nextMonthsYear");

        $values = array();
        $values[':userID'] = $id_user;
        $values[':catID'] = $catID;
        $values[':type'] = $type;
        $values[':minTimestamp'] = $minDate;
        $values[':maxTimestamp'] = $maxDate;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getCounterOfUserTransactions($userID, $transactional = false)
    {
        $db = new EnsoDB($transactional);
        $sql = "SELECT count(DISTINCT(transaction_id)) FROM transactions " .
            "LEFT JOIN accounts ON transactions.accounts_account_from_id = accounts.account_id  or transactions.accounts_account_to_id = accounts.account_id " .
            "WHERE accounts.users_user_id = :userID";

        $values = array();
        $values[':userID'] = $userID;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetch(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function removeAllTransactionsFromUser($userId, $transactional = false)
    {
        $db = new EnsoDB($transactional);


        $sql = "DELETE transactions FROM transactions " .
            "LEFT JOIN accounts ON accounts.account_id = transactions.accounts_account_from_id " .
            "WHERE acc_to.users_user_id = :userID " .
            "OR acc_from.users_user_id = :userID ";

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

    public static function createMockTransactions($userId, $quantity = 100, $transactional = false)
    {
        $userAccounts = AccountModel::getWhere(["users_user_id" => $userId, "status" => DEFAULT_ACCOUNT_ACTIVE_STATUS]);
        $userEntities = EntityModel::getWhere(["users_user_id" => $userId]);
        $userCategories = CategoryModel::getWhere(["users_user_id" => $userId, "status" => DEFAULT_ACCOUNT_ACTIVE_STATUS]);

        $endTimestamp = strtotime("now");
        $startTimestamp = strtotime("-1 year");

        for ($i = 1; $i <= $quantity; $i++) {
            $description = "Transaction n. $i";
            $dateTimestamp = Utils::getRandomDateTimestamp($startTimestamp, $endTimestamp);

            $type = Utils::checkWithProbability(0.8) ? DEFAULT_TYPE_EXPENSE_TAG : DEFAULT_TYPE_INCOME_TAG;
            $categoryID = $userCategories[array_rand($userCategories, 1)]["category_id"];
            $entityID = $userEntities[array_rand($userEntities, 1)]["entity_id"];
            if ($type == DEFAULT_TYPE_EXPENSE_TAG) {
                $amount = rand(0.01, 1000.0);
                $accountFrom = $userAccounts[array_rand($userAccounts, 1)]["account_id"];
                $accountTo = null;
                $isEssential = (int)Utils::checkWithProbability(0.2);
            } else {
                $amount = rand(1000.0, 3000.0);
                $accountTo = $userAccounts[array_rand($userAccounts, 1)]["account_id"];
                $accountFrom = null;
                $isEssential = false;
            }


            if (!TransactionModel::exists([
                "description" => $description,
            ])) {
                TransactionModel::insert([
                    "date_timestamp" => $dateTimestamp,
                    "amount" => $amount,
                    "type" => $type,
                    "description" => $description,
                    "entities_entity_id" => $entityID,
                    "accounts_account_from_id" => $accountFrom,
                    "accounts_account_to_id" => $accountTo,
                    "categories_category_id" => $categoryID,
                    "is_essential" => $isEssential,
                ], $transactional);
            } else {
                TransactionModel::editWhere([
                    "description" => $description,
                ], ["date_timestamp" => $dateTimestamp, "amount" => $amount], $transactional);
            }
        }
    }

}
