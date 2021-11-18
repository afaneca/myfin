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
}