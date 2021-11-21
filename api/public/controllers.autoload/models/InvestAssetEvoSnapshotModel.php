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
}
