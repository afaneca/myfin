import { prisma } from '../config/prisma.js';

const getAllTransactionsForUser = async (userId: bigint, dbClient = prisma) =>
  dbClient.$queryRaw`SELECT transaction_id, date_timestamp, invest_transactions.type as 'trx_type', invest_assets.type as 'asset_type', note, (total_price/100) as 'total_price', invest_transactions.units, invest_assets_asset_id, name, ticker, broker, invest_assets.asset_id, (fees_taxes / 100) as 'fees_taxes' 
  FROM invest_transactions INNER JOIN invest_assets ON invest_assets.asset_id = invest_assets_asset_id
  WHERE users_user_id = ${userId} ORDER BY date_timestamp DESC;`;

export default {
  getAllTransactionsForUser,
};
