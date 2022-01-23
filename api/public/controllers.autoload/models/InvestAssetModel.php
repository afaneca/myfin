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
    public static function getAssetForUser($userID, $assetId)
    {
        return InvestAssetModel::getWhere(["users_user_id" => $userID, "asset_id" => $assetId]);
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

    public static function getTransactionForUser($trxID, $userID, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "SELECT * " .
            "FROM invest_transactions " .
            "INNER JOIN invest_assets ON invest_assets_asset_id = invest_assets.asset_id " .
            "WHERE  transaction_id = :trxId AND users_user_id = :userId ";

        $values = array();
        $values[':trxId'] = $trxID;
        $values[':userId'] = $userID;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    /*SELECT SUM(CASE WHEN type = 'S' THEN total_price * -1 ELSE total_price END) as 'invested_balance'
FROM myfin_prod.invest_transactions
WHERE invest_assets_asset_id = 18
AND date_timestamp BETWEEN 0 and 1*/
    public static function getInvestedBalanceBetweenDatesForAsset($assetId, $beginTimestamp, $endTimestamp, $transactional = false)
    {

        $db = new EnsoDB($transactional);

        $sql = "SELECT (SUM(CASE WHEN type = 'S' THEN total_price * -1 ELSE total_price END) / 100) as 'invested_balance' " .
            "FROM invest_transactions " .
            "WHERE invest_assets_asset_id = :assetId AND date_timestamp BETWEEN :date1 and :date2";

        $values = array();
        $values[':assetId'] = $assetId;
        $values[':date1'] = $beginTimestamp;
        $values[':date2'] = $endTimestamp;

        try {
            $db->prepare($sql);
            $db->execute($values);

            $result = $db->fetchAll();

            if (!$result) return 0;
            return $result[0]["invested_balance"];
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getTotalInvestmentValueAtDate($userId, $maxMonth, $maxYear, $transactional = false)
    {
        if (!$maxMonth) {
            $maxMonth = date('m', time());
        }
        if (!$maxYear) {
            $maxYear = date('Y', time());
        }

        $db = new EnsoDB($transactional);

        $sql = "SELECT month, year, SUM(current_value) as 'current_value' FROM invest_asset_evo_snapshot " .
            "INNER JOIN invest_assets ON invest_assets.asset_id = invest_assets_asset_id " .
            "WHERE users_user_id = :userId " .
            "AND (year < :maxYear or (year = :maxYear and month <= :maxMonth)) " .
            "GROUP BY month, year " .
            "ORDER BY YEAR DESC, MONTH DESC LIMIT 1";

        $values = array();
        $values[':userId'] = $userId;
        $values[':maxYear'] = $maxYear;
        $values[':maxMonth'] = $maxMonth;

        try {
            $db->prepare($sql);
            $db->execute($values);
            $snapshot = $db->fetchAll();

            /* $snapshot = InvestAssetEvoSnapshotModel::getWhere(["invest_assets_asset_id" => $assetId]);*/
            if (!$snapshot || count($snapshot) < 1) return 0;
            return floatval($snapshot[0]["current_value"]);

        } catch (Exception $e) {
            throw $e;
        }
    }

    public static function getCombinedROIByYear($userId, $initialYear, $transactional = false)
    {
        $roiByYear = []; //ex: ["2021" => ["invested_in_year"=>"123.23", "value_total_amount"=>"123.23", "roi_amount"=> "123.12", "roi_percentage"=> "12.34 % "]
        $currentYear = date('Y', time());
        // 2 - loop through each year
        $yearInLoop = $initialYear;
        $lastYearsTotalValue = 0;
        while ($yearInLoop <= $currentYear) {
            $roiByYear[$yearInLoop] = [];

            // 3 - if current year, limit by current month
            $fromDate = strtotime("1-1-$yearInLoop");
            if ($yearInLoop == $currentYear)
                $toDate = time();
            else
                $toDate = strtotime("31-12-$yearInLoop");

            // 4 - extract data
            $investedInYearAmount = InvestTransactionModel::getCombinedInvestedBalanceBetweenDatesForUser($userId, $fromDate, $toDate, $transactional);
            $valueTotalAmount = Input::convertIntegerToFloatAmount(InvestAssetModel::getTotalInvestmentValueAtDate($userId, 12, $yearInLoop, $transactional));

            $expectedBreakEvenValue = $lastYearsTotalValue + $investedInYearAmount; // If the user had a 0% profit, this would be the current portfolio value

            $roiAmount = $valueTotalAmount - $expectedBreakEvenValue;
            $roiPercentage = ($expectedBreakEvenValue != 0) ? ($roiAmount / $expectedBreakEvenValue) * 100 : "-";;

            array_push($roiByYear[$yearInLoop], [
                "invested_in_year_amount" => $investedInYearAmount,
                "value_total_amount" => $valueTotalAmount,
                "roi_amount" => $roiAmount,
                "roi_percentage" => $roiPercentage,
            ]);
            $lastYearsTotalValue = $valueTotalAmount;
            $yearInLoop++;
        }
        return $roiByYear;
    }
}