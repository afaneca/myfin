<?php

/**
 * TYPES:
 * I - Income
 * E - Expense
 * T - Transfer
 */
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

}
