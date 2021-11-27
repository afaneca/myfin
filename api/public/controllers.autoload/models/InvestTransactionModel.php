<?php

/*
 * TYPES:
 * - Buy (B)
 * - Sell (S)
 */

class InvestTransactionModel extends Entity
{
    protected static $table = "invest_transactions";

    protected static $columns = [
        "transaction_id",
        "date_timestamp",
        "type",
        "note",
        "total_price",
        "units",
        "invest_assets_asset_id",
        "created_at",
        "updated_at"
    ];

    public static function getAllTransactionsForUser($userID, $transactional = false)
    {
        $db = new EnsoDB($transactional);
        $sql = "SELECT transaction_id, date_timestamp, invest_transactions.type as 'trx_type', invest_assets.type as 'asset_type', note, total_price, invest_transactions.units, invest_assets_asset_id, name, ticker, broker " .
            "FROM invest_transactions INNER JOIN invest_assets ON invest_assets.asset_id = invest_assets_asset_id " .
            "WHERE users_user_id = :userID;";

        $values = array();
        $values[":userID"] = $userID;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function deleteTransactionForUser($trxId, $userId, $transactional)
    {
        $db = new EnsoDB($transactional);
        $sql = "DELETE " . static::$table . " from " . static::$table . " " .
            "INNER JOIN invest_assets ON invest_assets_asset_id = invest_assets.asset_id " .
            "WHERE users_user_id = :userId AND transaction_id = :trxId ";

        $values = array();
        $values[":userId"] = $userId;
        $values[":trxId"] = $trxId;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }

    }
}