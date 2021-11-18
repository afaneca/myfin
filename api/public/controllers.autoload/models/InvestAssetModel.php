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
}