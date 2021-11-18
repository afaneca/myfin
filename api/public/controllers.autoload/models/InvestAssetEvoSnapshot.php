<?php

class InvestAssetEvoSnapshot extends Entity
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
}
