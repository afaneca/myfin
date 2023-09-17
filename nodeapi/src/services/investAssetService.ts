import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import DateTimeUtils from '../utils/DateTimeUtils.js';
import ConvertUtils from '../utils/convertUtils.js';

interface CalculatedAssetAmounts {
  invested_value?: number;
  currently_invested_value?: number;
  withdrawn_amount?: number;
  current_value?: number;
  absolute_roi_value?: number;
  relative_roi_percentage?: number | string;
  price_per_unit?: number;
  fees_taxes?: number;
}

const getLatestSnapshotForAsset = async (
  assetId: bigint,
  maxMonth = DateTimeUtils.getMonthNumberFromTimestamp(),
  maxYear = DateTimeUtils.getYearFromTimestamp(),
  dbClient = prisma
) => {
  const result = await dbClient.$queryRaw`SELECT *
                                          FROM invest_asset_evo_snapshot
                                          WHERE invest_assets_asset_id = ${assetId}
                                            AND (year < ${maxYear} OR (year = ${maxYear} AND month <= ${maxMonth}))
                                          ORDER BY YEAR DESC, MONTH DESC
                                          LIMIT 1`;

  if (!result || !Array.isArray(result) || (result as Array<any>).length < 1) return null;
  return result[0];
};

const getTotalFessAndTaxesForAsset = async (assetId: bigint, dbClient = prisma) => {
  const result = await dbClient.$queryRaw`SELECT sum(fees_taxes / 100) as fees_taxes
                                          FROM invest_transactions
                                          WHERE invest_assets_asset_id = ${assetId}`;

  return result[0].fees_taxes;
};

const getAverageBuyingPriceForAsset = async (assetId: bigint, dbClient = prisma) => {
  const result = await dbClient.$queryRaw`SELECT total_price / units as avg_price
                                          FROM (SELECT sum(total_price / 100) as total_price, sum(units) as units
                                                FROM invest_transactions
                                                WHERE invest_assets_asset_id = ${assetId}
                                                  AND type = 'B') dataset `;
  return result[0].avg_price;
};

const calculateAssetAmounts = async (
  asset: Prisma.invest_assetsCreateInput,
  dbClient = prisma
): Promise<InvestAssetWithCalculatedAmounts> => {
  const snapshot = await getLatestSnapshotForAsset(
    asset.asset_id as bigint,
    undefined,
    undefined,
    dbClient
  );
  const investedValue = ConvertUtils.convertBigIntegerToFloat(snapshot?.invested_amount ?? 0);
  const withdrawnAmount = ConvertUtils.convertBigIntegerToFloat(snapshot?.withdrawn_amount ?? 0);
  const currentValue = ConvertUtils.convertBigIntegerToFloat(snapshot?.current_value ?? 0);
  const feesAndTaxes = parseFloat(
    await getTotalFessAndTaxesForAsset(asset.asset_id as bigint, dbClient)
  );

  let currentlyInvestedValue = investedValue - withdrawnAmount;
  if (currentlyInvestedValue < 0) currentlyInvestedValue = 0;
  const roiValue = currentValue + withdrawnAmount - (investedValue + feesAndTaxes);
  const roiPercentage =
    investedValue == 0 ? '∞' : (roiValue / (investedValue + feesAndTaxes)) * 100;
  const pricePerUnit = await getAverageBuyingPriceForAsset(asset.asset_id as bigint, dbClient);
  /*Logger.addLog(
        `ASSET: (${asset.asset_id}) ${asset.name} | investedValue: ${investedValue} | withdrawnAmount: ${withdrawnAmount} | currentValue: ${currentValue} | feesAndTaxes: ${feesAndTaxes} | roiValue: ${roiValue} | roiPercentage: ${roiPercentage} | pricePerUnit: ${pricePerUnit}`
    );*/
  return {
    asset_id: asset.asset_id as bigint,
    name: asset.name,
    ticker: asset.ticker,
    type: asset.type,
    units: asset.units as number,
    broker: asset.broker,
    invested_value: investedValue,
    currently_invested_value: currentlyInvestedValue,
    withdrawn_amount: withdrawnAmount,
    current_value: currentValue,
    absolute_roi_value: roiValue,
    relative_roi_percentage: roiPercentage,
    price_per_unit: pricePerUnit,
    fees_taxes: feesAndTaxes,
  };
};

type InvestAssetWithCalculatedAmounts = CalculatedAssetAmounts & {
  asset_id?: bigint;
  name?: string;
  ticker?: string;
  type?: string;
  units?: number | Prisma.Decimal;
  broker?: string;
};

const getAllAssetsForUser = async (
  userId: bigint,
  dbClient = prisma
): Promise<Array<InvestAssetWithCalculatedAmounts>> => {
  const assets = await dbClient.invest_assets.findMany({
    where: {
      users_user_id: userId,
    },
  });

  const calculatedAmountPromises = [];
  for (const asset of assets) {
    calculatedAmountPromises.push(calculateAssetAmounts(asset, dbClient));
  }
  return (
    ((await Promise.all(calculatedAmountPromises)) as Array<InvestAssetWithCalculatedAmounts>)
      // Sort assets array by current value (DESC)
      .sort((a, b) => {
        return b.current_value - a.current_value;
      })
  );
};

interface Asset {
  assetId?: bigint;
  name: string;
  ticker?: string;
  units?: number;
  type: string;
  broker: string;
}

const createAsset = async (userId: bigint, asset: Asset, dbClient = prisma) =>
  dbClient.invest_assets.create({
    data: {
      name: asset.name,
      ticker: asset.ticker,
      units: asset.units ?? 0,
      type: asset.type,
      broker: asset.broker,
      created_at: DateTimeUtils.getCurrentUnixTimestamp(),
      updated_at: DateTimeUtils.getCurrentUnixTimestamp(),
      users_user_id: userId,
    },
  });

const updateAsset = async (userId: bigint, asset: Asset, dbClient = prisma) =>
  dbClient.invest_assets.update({
    where: {
      users_user_id: userId,
      asset_id: asset.assetId,
    },
    data: {
      name: asset.name,
      ticker: asset.ticker,
      units: asset.units,
      type: asset.type,
      broker: asset.broker,
      updated_at: DateTimeUtils.getCurrentUnixTimestamp(),
    },
  });

export default {
  getAllAssetsForUser,
  createAsset,
  updateAsset,
};
