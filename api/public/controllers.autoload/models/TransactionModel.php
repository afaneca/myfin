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
        "categories_category_id" // I|E|T
    ];

    public static function getAllTransactionsForUser($id_user, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        /* $sql = "SELECT transaction_id, date_timestamp, amount, transactions.type, transactions.description, entities_entity_id, accounts_account_from_id, accounts_account_to_id, users_user_id, categories_category_id FROM transactions " .
            "LEFT JOIN accounts " .
            "ON accounts.account_id = transactions.accounts_account_from_id " .
            "WHERE users_user_id = :userID "; */

        $sql = "SELECT transaction_id, transactions.date_timestamp, (transactions.amount / 100) as amount, transactions.type, transactions.description, entities.entity_id, entities.name as entity_name, categories_category_id, categories.name as category_name, accounts_account_from_id, acc_to.name as account_to_name, accounts_account_to_id, acc_from.name as account_from_name " .
            "FROM transactions " .
            "LEFT JOIN accounts ON accounts.account_id = transactions.accounts_account_from_id " .
            "LEFT JOIN categories ON categories.category_id = transactions.categories_category_id " .
            "LEFT JOIN entities ON entities.entity_id = transactions.entities_entity_id " .
            "LEFT JOIN accounts acc_to ON acc_to.account_id = transactions.accounts_account_to_id " .
            "LEFT JOIN accounts acc_from ON acc_from.account_id = transactions.accounts_account_from_id " .
            "WHERE acc_to.users_user_id = :userID " .
            "OR acc_from.users_user_id = :userID " .
            "GROUP BY transaction_id " .
            "ORDER BY transactions.date_timestamp DESC";

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
