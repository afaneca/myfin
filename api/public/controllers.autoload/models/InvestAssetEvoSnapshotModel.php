<?php

class InvestAssetEvoSnapshotModel extends Entity
{
    protected static $table = "invest_asset_evo_snapshot";

    protected static $columns = [
        "month",
        "year",
        "units",
        "invested_amount",
        "current_value",
        "invest_assets_asset_id",
        "created_at",
        "updated_at"
    ];

    public static function updateCurrentAssetValue($month, $year, $assetID, $units, $newValue, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "INSERT INTO invest_asset_evo_snapshot (month, year, units, invested_amount, current_value, invest_assets_asset_id, created_at, updated_at) " .
            " VALUES(:month, :year, :units, :investedAmount, :currentValue, :assetID, :createdAt, :updatedAt) " .
            " ON DUPLICATE KEY UPDATE current_value = :currentValue, updated_at = :updatedAt";

        $values = array();
        $values[':month'] = $month;
        $values[':year'] = $year;
        $values[':units'] = $units;
        $values[':investedAmount'] = 0;
        $values[':currentValue'] = Input::convertFloatToInteger($newValue);
        $values[':assetID'] = $assetID;
        $values[':createdAt'] = EnsoShared::now();
        $values[':updatedAt'] = EnsoShared::now();

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getAssetSnapshotAtMonth($month, $year, $assetID, $transactional = false)
    {
        if (InvestAssetEvoSnapshotModel::exists(["invest_assets_asset_id" => $assetID, "month" => $month, "year" => $year])) {
            $snapshot = InvestAssetEvoSnapshotModel::getWhere(["invest_assets_asset_id" => $assetID, "month" => $month, "year" => $year])[0];
        } else {
            $snapshot = null;
        }

        return $snapshot;
    }

    public static function addCustomBalanceSnapshot($assetId, $month, $year, $units, $investedAmount, $currentAmount, $transactional = false)
    {

        $db = new EnsoDB($transactional);

        $sql = "INSERT INTO invest_asset_evo_snapshot (month, year, units, invested_amount, current_value, invest_assets_asset_id, created_at, updated_at) " .
            "VALUES (:month, :year, :units, :invested_amount, :current_amount, :invest_assets_asset_id, :created_at, :updated_at) " .
            "ON DUPLICATE KEY UPDATE units = :units, invested_amount = :invested_amount, current_value = :current_amount, updated_at = :updated_at;";

        $values = array();
        $values[':month'] = $month;
        $values[':year'] = $year;
        $values[':units'] = $units;
        $values[':invested_amount'] = $investedAmount;
        $values[':current_amount'] = $currentAmount;
        $values[':invest_assets_asset_id'] = $assetId;
        $values[':created_at'] = time();
        $values[':updated_at'] = time();

        try {
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    /**
     * @throws InexistentAttributeProvidedException
     */
    public static function updateSnapshot($unixDate, float $newUnits, float $lastAmount, int $assetID, $transactional = false)
    {
        // TODO: recalculate all snapshots if $unixDate is not from current month

        $month = date('m', $unixDate);
        $year = date('Y', $unixDate);

        $snapshot = InvestAssetEvoSnapshotModel::getLatestSnapshotForAsset($assetID, $transactional);

        if ($snapshot && $snapshot[0]["month"] == $month && $snapshot[0]["year"] == $year) {
            // Snapshot exists -> update it
            InvestAssetEvoSnapshotModel::editWhere(
                ["month" => $month, "year" => $year, "invest_assets_asset_id" => $assetID],
                [
                    "units" => $newUnits,
                    "invested_amount" => doubleval($snapshot["invested_amount"]) + $lastAmount,
                    "current_value" => doubleval($snapshot["current_value"]) + $lastAmount,
                    "updated_at" => EnsoShared::now(),
                ],
                $transactional
            );
        } else {
            // Snapshot for month doesn't exist -> create it
            InvestAssetEvoSnapshotModel::insert(
                [
                    "month" => $month,
                    "year" => $year,
                    "units" => $newUnits,
                    "invested_amount" => ($snapshot) ? doubleval($snapshot["invested_amount"]) + $lastAmount : $lastAmount,
                    "current_value" => ($snapshot) ? doubleval($snapshot["current_value"]) + $lastAmount : $lastAmount,
                    "invest_assets_asset_id" => $assetID,
                    "created_at" => EnsoShared::now(),
                    "updated_at" => EnsoShared::now(),
                ],
                $transactional
            );
        }
    }

    public static function getLatestSnapshotForAsset($assetId, $transactional = false)
    {
        $snapshot = InvestAssetEvoSnapshotModel::getWhere(["invest_assets_asset_id" => $assetId]);
        if (!$snapshot || count($snapshot) < 1) return null;
        return $snapshot;
    }

    public static function recalculateSnapshotForAssetsIncrementally($assetId, $fromDate, $toDate, $transactional = false)
    {
        /*
         * Given that I'm unable to know the invested/current amounts of an asset at any specific time (only at the end of each month),
         * I will need to recalculate from the beginning of the month relative to $fromDate all the way to the end of
         * month associated with $toDate.
         *
         * Will update units, current_amount & invested_amount
        */

        $beginMonth = date('m', $fromDate);
        $beginYear = date('Y', $fromDate);

        $priorMonthsSnapshot = InvestAssetEvoSnapshotModel::getAssetSnapshotAtMonth(($beginMonth > 2) ? ($beginMonth - 2) : 1,
            ($beginMonth > 2) ? $beginYear : ($beginYear - 1), $assetId, $transactional);

        if (!$priorMonthsSnapshot)
            $priorMonthsSnapshot = ["units" => 0, "current_value" => 0, "invested_amount" => 0];

        InvestAssetEvoSnapshotModel::addCustomBalanceSnapshot($assetId, $beginMonth, $beginYear,
            $priorMonthsSnapshot["units"], $priorMonthsSnapshot["invested_amount"], $priorMonthsSnapshot["current_value"], $transactional);

        //Reset snapshots for next 2 months (in case there are no transactions in these months and the balance doesn't get recalculated
        InvestAssetEvoSnapshotModel::addCustomBalanceSnapshot($assetId, ($beginMonth < 12) ? $beginMonth + 1 : 1, ($beginMonth < 12) ? $beginYear : $beginYear + 1,
            $priorMonthsSnapshot["units"], $priorMonthsSnapshot["invested_amount"], $priorMonthsSnapshot["current_value"], $transactional);
        InvestAssetEvoSnapshotModel::addCustomBalanceSnapshot($assetId, ($beginMonth < 11) ? $beginMonth + 2 : 1, ($beginMonth < 11) ? $beginYear : $beginYear + 1,
            $priorMonthsSnapshot["units"], $priorMonthsSnapshot["invested_amount"], $priorMonthsSnapshot["current_value"], $transactional);


        if ($beginMonth > 1) $beginMonth--;
        else {
            $beginMonth = 1;
            $beginYear--;
        }

        $endMonth = date('m', $toDate);
        $endYear = date('Y', $toDate);

        if ($endMonth < 12) $endMonth++;
        else {
            $endMonth = 1;
            $endYear++;
        }

        $fromDate = strtotime("1-$beginMonth-$beginYear");
        $toDate = strtotime("1-$endMonth-$endYear");

        $trxList = InvestAssetModel::getAllTransactionsForAssetBetweenDates($assetId, $fromDate, $toDate, $transactional);

        $initialSnapshot = $priorMonthsSnapshot;
        if (!$initialSnapshot) $priorMonthsSnapshot = ["units" => 0, "current_value" => 0, "invested_amount" => 0];

        foreach ($trxList as $trx) {
            $trxDate = $trx["date_timestamp"];
            $month = date('m', $trxDate);
            $year = date('Y', $trxDate);

            $trxType = $trx["type"];
            $changeInAmounts = $trx["total_price"];
            $changeInUnits = $trx["units"];

            if ($trxType == DEFAULT_INVESTING_TRANSACTIONS_SELL) {
                $changeInAmounts *= -1;
                $changeInUnits *= -1;
            }

            $initialSnapshot["units"] = doubleval($initialSnapshot["units"]) + doubleval($changeInUnits);
            $initialSnapshot["invested_amount"] = doubleval($initialSnapshot["invested_amount"]) + doubleval($changeInAmounts);
            $initialSnapshot["current_value"] = doubleval($initialSnapshot["current_value"]) + doubleval($changeInAmounts);

            /* Automatically add snapshots for current & next 2 months in order to create a buffer*/
            InvestAssetEvoSnapshotModel::addCustomBalanceSnapshot($assetId, $month, $year,
                $initialSnapshot["units"], $initialSnapshot["invested_amount"], $initialSnapshot["current_value"], $transactional);
            InvestAssetEvoSnapshotModel::addCustomBalanceSnapshot($assetId, ($month < 12) ? $month + 1 : 1, ($month < 12) ? $year : $year + 1,
                $initialSnapshot["units"], $initialSnapshot["invested_amount"], $initialSnapshot["current_value"], $transactional);
            InvestAssetEvoSnapshotModel::addCustomBalanceSnapshot($assetId, ($month < 11) ? $month + 2 : 1, ($month < 11) ? $year : $year + 1,
                $initialSnapshot["units"], $initialSnapshot["invested_amount"], $initialSnapshot["current_value"], $transactional);

        }

        return $initialSnapshot;

    }
}
