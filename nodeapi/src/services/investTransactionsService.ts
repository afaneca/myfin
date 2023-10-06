import { performDatabaseRequest, prisma } from '../config/prisma.js';
import APIError from '../errorHandling/apiError.js';
import InvestAssetService from './investAssetService.js';
import DateTimeUtils from '../utils/DateTimeUtils.js';
import ConvertUtils from '../utils/convertUtils.js';
import { invest_transactions_type } from '@prisma/client';

const getAllTransactionsForUser = async (userId: bigint, dbClient = prisma) =>
  dbClient.$queryRaw`SELECT transaction_id, date_timestamp, invest_transactions.type as 'trx_type', invest_assets.type as 'asset_type', note, (total_price/100) as 'total_price', invest_transactions.units, invest_assets_asset_id, name, ticker, broker, invest_assets.asset_id, (fees_taxes / 100) as 'fees_taxes' 
  FROM invest_transactions INNER JOIN invest_assets ON invest_assets.asset_id = invest_assets_asset_id
  WHERE users_user_id = ${userId} ORDER BY date_timestamp DESC;`;

const getTransactionForUser = async (userId: bigint, trxId: bigint, dbClient = prisma) =>
  performDatabaseRequest(async (prismaTx) => {
    return prismaTx.$queryRaw`SELECT * FROM invest_transactions 
INNER JOIN invest_assets ON invest_assets_asset_id = invest_assets.asset_id
WHERE  transaction_id = ${trxId} AND users_user_id = ${userId}  `;
  }, dbClient);

const updateTransaction = async (
  userId: bigint,
  trxId: bigint,
  assetId: bigint,
  dateTimestamp: bigint,
  note: string,
  totalPrice: number,
  units: number,
  fees: number,
  type: invest_transactions_type,
  dbClient = undefined
) => {
  return performDatabaseRequest(async (prismaTx) => {
    if (
      !(await InvestAssetService.doesAssetBelongToUser(userId, assetId, prismaTx)) ||
      !(await getTransactionForUser(userId, trxId, prismaTx))
    ) {
      throw APIError.notAuthorized();
    }

    prismaTx.invest_transactions.update({
      where: { transaction_id: trxId },
      data: {
        date_timestamp: dateTimestamp,
        units,
        fees_taxes: ConvertUtils.convertFloatToBigInteger(fees),
        total_price: ConvertUtils.convertFloatToBigInteger(totalPrice),
        note,
        type,
        invest_assets_asset_id: assetId,
        updated_at: DateTimeUtils.getCurrentUnixTimestamp(),
      },
    });

    // Recalculate snapshot
    const latestSnapshot = await InvestAssetService.recalculateSnapshotForAssetsIncrementally(
      assetId,
      Number(dateTimestamp) - 1,
      DateTimeUtils.getCurrentUnixTimestamp(),
      prismaTx
    );

    await prismaTx.invest_assets.update({
      where: {
        asset_id: assetId,
      },
      data: {
        units: latestSnapshot.units,
      },
    });
  }, dbClient);
};

export default {
  getAllTransactionsForUser,
  updateTransaction,
};
