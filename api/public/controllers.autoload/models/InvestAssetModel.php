<?php

/* TYPES OF ASSETS:
 * - PPR (ppr)
 * - ETF (etf)
 * - Crypto (crypto)
 * - Fixed Income (fixed)
 * - Index Funds (index)
 * - Investment Funds (if)
 * - P2P Loans (p2p)
 * - Stocks (stock)
 */

class InvestAssetModel extends Entity
{
    protected static $table = "invest_assets";

    protected static $columns = [
        "asset_id",
        "name",
        "ticker",
        "units",
        "type",
        "broker",
        "created_at",
        "updated_at",
        "users_user_id"
    ];

    /**
     * @throws InexistentAttributeProvidedException
     */
    public static function getAllAssetsForUser($userID)
    {
        return InvestAssetModel::getWhere(["users_user_id" => $userID,]);
    }

    /**
     * @throws InexistentAttributeProvidedException
     */
    public static function getAllAssetsSummaryForUser($userID)
    {
        return InvestAssetModel::getWhere(["users_user_id" => $userID,], ["asset_id", "name", "ticker", "type"]);
    }

    /**
     * @throws InexistentAttributeProvidedException
     */
    public static function incrementUnitsInAsset($assetId, $changeInUnits, $transactional = false): float
    {
        $asset = InvestAssetModel::getWhere(["asset_id" => $assetId], ["units"])[0];
        $currentUnits = $asset["units"];
        $newUnits = doubleval("units") + doubleval($changeInUnits);
        InvestAssetModel::editWhere(["asset_id" => $assetId], ["units" => $newUnits], $transactional);

        return $newUnits;
    }

    public static function getAllTransactionsForAssetBetweenDates($assetId, $fromDate, $toDate, $transactional)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT * " .
            "FROM invest_transactions " .
            "WHERE date_timestamp BETWEEN :fromDate AND :toDate " .
            "AND invest_assets_asset_id = :assetID " .
            "ORDER BY date_timestamp ASC";

        $values = array();
        $values[':assetID'] = $assetId;
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
}