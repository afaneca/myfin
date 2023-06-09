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
        "fees_taxes",
        "invest_assets_asset_id",
        "created_at",
        "updated_at"
    ];

    public static function getAllTransactionsForUser($userID, $transactional = false)
    {
        $db = new EnsoDB($transactional);
        $sql = "SELECT transaction_id, date_timestamp, invest_transactions.type as 'trx_type', invest_assets.type as 'asset_type', note, (total_price/100) as 'total_price', invest_transactions.units, invest_assets_asset_id, name, ticker, broker, invest_assets.asset_id, (fees_taxes / 100) as 'fees_taxes' " .
            "FROM invest_transactions INNER JOIN invest_assets ON invest_assets.asset_id = invest_assets_asset_id " .
            "WHERE users_user_id = :userID ORDER BY date_timestamp DESC;";

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

    public static function getCombinedInvestedBalanceBetweenDatesForUser($userId, $beginTimestamp, $endTimestamp, $transactional = false)
    {

        $db = new EnsoDB($transactional);

        $sql = "SELECT (SUM(CASE WHEN invest_transactions.type = 'S' THEN total_price * -1 ELSE total_price END)/100) as 'invested_balance' " .
            "FROM invest_transactions " .
            "INNER JOIN invest_assets ON invest_assets_asset_id = asset_id " .
            "WHERE users_user_id = :userId AND date_timestamp BETWEEN :date1 and :date2";

        $values = array();
        $values[':userId'] = $userId;
        $values[':date1'] = $beginTimestamp;
        $values[':date2'] = $endTimestamp;

        try {
            $db->prepare($sql);
            $db->execute($values);

            $result = $db->fetchAll();

            if (!$result) return 0;
            return floatval($result[0]["invested_balance"]);
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getCombinedFeesAndTaxesBetweenDatesForUser($userId, $beginTimestamp, $endTimestamp, $transactional = false)
    {

        $db = new EnsoDB($transactional);

        $sql = "SELECT (SUM(fees_taxes)/100) as 'invested_fees' " .
            "FROM invest_transactions " .
            "INNER JOIN invest_assets ON invest_assets_asset_id = asset_id " .
            "WHERE users_user_id = :userId AND date_timestamp BETWEEN :date1 and :date2";

        $values = array();
        $values[':userId'] = $userId;
        $values[':date1'] = $beginTimestamp;
        $values[':date2'] = $endTimestamp;

        try {
            $db->prepare($sql);
            $db->execute($values);

            $result = $db->fetchAll();

            if (!$result) return 0;
            return floatval($result[0]["invested_fees"]);
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getCombinedInvestedAndWithdrawnBalancesBetweenDatesForUser($userId, $beginTimestamp, $endTimestamp, $transactional = false)
    {

        $db = new EnsoDB($transactional);

        $sql = "SELECT (SUM(CASE WHEN invest_transactions.type = 'B' THEN 0 ELSE total_price END)/100) as 'withdrawn_amount', " .
            "(SUM(CASE WHEN invest_transactions.type = 'S' THEN 0 ELSE total_price END)/100) as 'invested_amount' " .
            "FROM invest_transactions " .
            "INNER JOIN invest_assets ON invest_assets_asset_id = asset_id " .
            "WHERE users_user_id = :userId AND date_timestamp BETWEEN :date1 and :date2";

        $values = array();
        $values[':userId'] = $userId;
        $values[':date1'] = $beginTimestamp;
        $values[':date2'] = $endTimestamp;

        try {
            $db->prepare($sql);
            $db->execute($values);

            $result = $db->fetchAll();

            if (!$result) return 0;
            return $result[0];
        } catch (Exception $e) {
            return $e;
        }
    }

    public
    static function removeAllForUser($userId, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE invest_transactions FROM invest_transactions " .
            "LEFT JOIN invest_assets ON invest_assets.asset_id = invest_transactions.invest_assets_asset_id " .
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

    public static function addTransaction($date, $units, $fees, $totalPrice, $note, $type, $assetID, $transactional = false)
    {
        $db = new EnsoDB($transactional);
        $db->getDB()->beginTransaction();


        $transactionId = InvestTransactionModel::insert([
            "date_timestamp" => $date,
            "units" => $units,
            "fees_taxes" => $fees,
            "total_price" => $totalPrice,
            "note" => $note,
            "type" => $type,
            "invest_assets_asset_id" => $assetID,
            "created_at" => time(),
            "updated_at" => time(),
        ], $transactional);

        /* Recalculate snapshot */
        $latestSnapshot = InvestAssetEvoSnapshotModel::recalculateSnapshotForAssetsIncrementally($assetID, $date - 1, time() + 1, $transactional);
        InvestAssetModel::editWhere(["asset_id" => $assetID], ["units" => $latestSnapshot["units"]], $transactional);

        $db->getDB()->commit();
    }
}