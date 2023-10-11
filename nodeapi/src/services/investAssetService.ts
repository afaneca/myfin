import { performDatabaseRequest, prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import DateTimeUtils from '../utils/DateTimeUtils.js';
import ConvertUtils from '../utils/convertUtils.js';
import APIError from '../errorHandling/apiError.js';
import { MYFIN } from '../consts.js';
import Logger from '../utils/Logger.js';

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

type InvestAssetWithCalculatedAmounts = CalculatedAssetAmounts & {
  asset_id?: bigint;
  name?: string;
  ticker?: string;
  type?: string;
  units?: number | Prisma.Decimal;
  broker?: string;
};

interface CalculatedAssetStats extends CalculatedAssetAmounts {
  total_invested_value?: number;
  total_current_value?: number;
  global_roi_value?: number;
  global_roi_percentage?: number | string;
  current_year_roi_value?: number;
  current_year_roi_percentage?: number;
  monthly_snapshots?: Array<any>;
  current_value_distribution?: Array<any>;
  top_performing_assets?: Array<any>;
  combined_roi_by_year?: number;
}

const getLatestSnapshotForAsset = async (
  assetId: bigint,
  maxMonth = DateTimeUtils.getMonthNumberFromTimestamp(),
  maxYear = DateTimeUtils.getYearFromTimestamp(),
  dbClient = prisma
): Promise<Prisma.invest_asset_evo_snapshotCreateInput> => {
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
  const investedValue = ConvertUtils.convertBigIntegerToFloat(
    BigInt(snapshot?.invested_amount ?? 0)
  );
  const withdrawnAmount = ConvertUtils.convertBigIntegerToFloat(
    BigInt(snapshot?.withdrawn_amount ?? 0)
  );
  const currentValue = ConvertUtils.convertBigIntegerToFloat(BigInt(snapshot?.current_value ?? 0));
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

const doesAssetBelongToUser = async (userId: bigint, assetId: bigint, dbClient = prisma) => {
  const result = await dbClient.invest_assets.findFirst({
    where: {
      users_user_id: userId,
      asset_id: assetId,
    },
  });

  return result !== null;
};

const performUpdateAssetValue = async (
  month: number,
  year: number,
  assetId: bigint,
  units: number | Prisma.Decimal,
  withdrawnAmount: number,
  newValue: number,
  dbClient = prisma
) => {
  const latestSnapshot = await getLatestSnapshotForAsset(assetId, month, year, dbClient);
  return dbClient.$queryRaw`INSERT INTO invest_asset_evo_snapshot (month, year, units, invested_amount, current_value,
                                                                     invest_assets_asset_id, created_at, updated_at,
                                                                     withdrawn_amount)
                              VALUES (${month}, ${year}, ${units}, ${
                                latestSnapshot?.invested_amount ?? 0
                              },
                                      ${ConvertUtils.convertFloatToBigInteger(
                                        newValue
                                      )}, ${assetId},
                                      ${DateTimeUtils.getCurrentUnixTimestamp()},
                                      ${DateTimeUtils.getCurrentUnixTimestamp()},
                                      ${
                                        withdrawnAmount
                                          ? ConvertUtils.convertFloatToBigInteger(
                                              Number(withdrawnAmount)
                                            )
                                          : 0
                                      })
                              ON DUPLICATE KEY UPDATE current_value = ${ConvertUtils.convertFloatToBigInteger(
                                newValue
                              )},
                                                      updated_at    = ${DateTimeUtils.getCurrentUnixTimestamp()}`;
};

const updateAssetValue = async (
  userId: bigint,
  assetId: bigint,
  newValue: number,
  month: number,
  year: number,
  createBuffer = true,
  dbClient = prisma
) => {
  const units = (
    await dbClient.invest_assets.findFirst({
      where: { users_user_id: userId, asset_id: assetId },
      select: { units: true },
    })
  ).units;
  const withdrawnAmount =
    (await getLatestSnapshotForAsset(assetId, month, year, dbClient))?.withdrawn_amount ?? 0;

  await performUpdateAssetValue(
    month,
    year,
    assetId,
    units,
    withdrawnAmount as number,
    newValue,
    dbClient
  );

  const bufferPromises = [];
  if (createBuffer) {
    // Snapshot next 6 months also, to create a buffer (in case no more snapshots are added till then)
    let nextMonth, nextMonthsYear;
    for (let i = 0; i < 6; i++) {
      nextMonth = month + 1 > 12 ? 1 : month + 1;
      nextMonthsYear = nextMonth > 12 ? year + 1 : year;
      bufferPromises.push(
        performUpdateAssetValue(
          nextMonth,
          nextMonthsYear,
          assetId,
          units,
          withdrawnAmount as number,
          newValue,
          dbClient
        )
      );
    }
  }

  await Promise.all(bufferPromises);
};

const updateCurrentAssetValue = async (
  userId: bigint,
  assetId: bigint,
  newValue: number,
  dbClient = undefined
) =>
  performDatabaseRequest(async (prismaTx) => {
    if (!(await doesAssetBelongToUser(userId, assetId, prismaTx))) {
      throw APIError.notAuthorized();
    }
    await updateAssetValue(
      userId,
      assetId,
      newValue,
      DateTimeUtils.getMonthNumberFromTimestamp(),
      DateTimeUtils.getYearFromTimestamp(),
      true,
      prismaTx
    );
  }, dbClient);

const getCombinedInvestedBalanceBetweenDatesForUser = async (
  userId: bigint,
  beginTimestamp: bigint,
  endTimestamp: bigint,
  dbClient = prisma
) => {
  const result = await dbClient.$queryRaw`SELECT (SUM(CASE
                                                            WHEN invest_transactions.type = 'S' THEN total_price * -1
                                                            ELSE total_price END) / 100) as 'invested_balance'
                                            FROM invest_transactions
                                                     INNER JOIN invest_assets ON invest_assets_asset_id = asset_id
                                            WHERE users_user_id = ${userId}
                                              AND date_timestamp BETWEEN ${beginTimestamp} and ${endTimestamp}`;

  if (!result || !Array.isArray(result) || (result as Array<any>).length < 1) return null;
  return parseFloat(result[0].invested_balance);
};

const getAllAssetSnapshotsForUser = async (
  userId: bigint,
  dbClient = prisma
): Promise<Array<any>> =>
  dbClient.$queryRaw`SELECT month,
                              year,
                              invest_asset_evo_snapshot.units,
                              (invested_amount / 100) as 'invested_amount',
                              (current_value / 100)   as 'current_value',
                              invest_assets_asset_id  as 'asset_id',
                              name                    as 'asset_name',
                              ticker                  as 'asset_ticker',
                              broker                  as 'asset_broker'
                       FROM invest_asset_evo_snapshot
                                INNER JOIN invest_assets ON invest_assets.asset_id = invest_assets_asset_id
                       WHERE users_user_id = ${userId}
                         AND (year < ${DateTimeUtils.getYearFromTimestamp()} OR (year = ${DateTimeUtils.getYearFromTimestamp()} AND month <= ${DateTimeUtils.getMonthNumberFromTimestamp()}))
                       ORDER BY year ASC, month ASC;`;

const getTotalInvestmentValueAtDate = async (
  userId: bigint,
  maxMonth = DateTimeUtils.getMonthNumberFromTimestamp(),
  maxYear = DateTimeUtils.getYearFromTimestamp(),
  dbClient = prisma
) => {
  const result =
    await dbClient.$queryRaw`SELECT month, year, SUM(current_value) as 'current_value' FROM invest_asset_evo_snapshot
            INNER JOIN invest_assets ON invest_assets.asset_id = invest_assets_asset_id
            WHERE users_user_id = ${userId}
            AND (year < ${maxYear} or (year = ${maxYear} and month <= ${maxMonth}))
            GROUP BY month, year
            ORDER BY YEAR DESC, MONTH DESC LIMIT 1`;

  if (!result || !Array.isArray(result) || (result as Array<any>).length < 1) return null;
  return result[0].current_value;
};

const getCombinedFeesAndTaxesBetweenDates = async (
  userId: bigint,
  beginTimestamp: bigint,
  endTimestamp: bigint,
  dbClient = prisma
) => {
  const result = await dbClient.$queryRaw`SELECT (SUM(fees_taxes)/100) as 'invested_fees'
            FROM invest_transactions
            INNER JOIN invest_assets ON invest_assets_asset_id = asset_id
            WHERE users_user_id = ${userId} AND date_timestamp BETWEEN ${beginTimestamp} and ${endTimestamp}`;

  if (!result || !Array.isArray(result) || (result as Array<any>).length < 1) return null;
  return parseFloat(result[0].invested_fees);
};

const getCombinedRoiByYear = async (userId: bigint, initialYear: number, dbClient = undefined) => {
  return performDatabaseRequest(async (prismaTx) => {
    const roiByYear = {}; //ex: ["2021" => ["invested_in_year"=>"123.23", "value_total_amount"=>"123.23", "roi_amount"=> "123.12", "roi_percentage"=> "12.34 % "]
    const currentYear = DateTimeUtils.getYearFromTimestamp();

    // 2 - loop through each year
    let yearInLoop = initialYear;
    let lastYearsTotalValue = 0;
    while (yearInLoop <= currentYear) {
      // 3 - if current year, limit by current month
      const fromDate = DateTimeUtils.getUnixTimestampFromDate(new Date(yearInLoop, 0, 1));
      let toDate = -1n;
      let maxDate = -1;
      if (yearInLoop == currentYear) {
        toDate = DateTimeUtils.getCurrentUnixTimestamp();
        maxDate = DateTimeUtils.getMonthNumberFromTimestamp();
      } else {
        toDate = DateTimeUtils.getUnixTimestampFromDate(new Date(yearInLoop, 11, 31));
        maxDate = 12;
      }

      // 4 - extract data
      const investedInYearAmount = await getCombinedInvestedBalanceBetweenDatesForUser(
        userId,
        fromDate,
        toDate,
        prismaTx
      );
      const fullCurrentValue = ConvertUtils.convertBigIntegerToFloat(
        await getTotalInvestmentValueAtDate(userId, maxDate, yearInLoop, prismaTx)
      );
      const feesAndTaxes = await getCombinedFeesAndTaxesBetweenDates(
        userId,
        fromDate,
        toDate,
        prismaTx
      );

      const expectedBreakEvenValue = lastYearsTotalValue + investedInYearAmount + feesAndTaxes; // If the user had a 0% profit, this would be the current portfolio value

      const roiAmount = fullCurrentValue - expectedBreakEvenValue;
      const roiPercentage =
        expectedBreakEvenValue != 0 ? (roiAmount / expectedBreakEvenValue) * 100 : '-';

      roiByYear[yearInLoop] = {
        invested_in_year_amount: investedInYearAmount,
        value_total_amount: fullCurrentValue,
        roi_amount: roiAmount,
        roi_percentage: roiPercentage,
        fees_taxes: feesAndTaxes,
        LAST_YEARS_TOTAL_VALUE: lastYearsTotalValue,
        EXPECTED_BREAKEVEN_VALUE: expectedBreakEvenValue,
      };
      lastYearsTotalValue = fullCurrentValue;
      yearInLoop++;
    }
    return roiByYear;
  }, dbClient);
};

const getAssetStatsForUser = async (
  userId: bigint,
  dbClient = undefined
): Promise<CalculatedAssetStats> =>
  performDatabaseRequest(async (prismaTx) => {
    const userAssets = await getAllAssetsForUser(userId, prismaTx);

    const currentValuesByAssetType = new Map<string, number>();
    let fullInvestedValue = 0;
    let fullCurrentValue = 0;
    let fullWithdrawnAmount = 0;
    let lastYearsValue = 0; // the value of all assets combined at last day of previous year

    for (const asset of userAssets) {
      fullInvestedValue += asset.invested_value;
      fullCurrentValue += asset.current_value;
      fullWithdrawnAmount += asset.withdrawn_amount;

      const lastYearsSnapshot = await getLatestSnapshotForAsset(
        asset.asset_id,
        12,
        DateTimeUtils.getYearFromTimestamp() - 1,
        prismaTx
      );
      if (lastYearsSnapshot) {
        lastYearsValue += Number(lastYearsSnapshot.current_value);
      }
      // Add key and value to array (if already exists, accumulate value for specific type
      currentValuesByAssetType.set(
        asset.type,
        (currentValuesByAssetType.get(asset.type) ?? 0) + asset.current_value
      );
    }

    const totalInvestedValue = fullInvestedValue - fullWithdrawnAmount;
    const totalCurrentValue = fullCurrentValue;
    const globalRoiValue = fullCurrentValue - fullInvestedValue + fullWithdrawnAmount;
    const globalRoiPercentage =
      fullInvestedValue != 0 ? (globalRoiValue / totalInvestedValue) * 100 : '-';

    const yearStart = DateTimeUtils.getUnixTimestampFromDate(
      new Date(DateTimeUtils.getYearFromTimestamp(), 0, 1)
    );
    // the amount invested in the current year
    const currentYearInvestedBalance = await getCombinedInvestedBalanceBetweenDatesForUser(
      userId,
      yearStart,
      DateTimeUtils.getCurrentUnixTimestamp(),
      prismaTx
    );
    // If the user had a 0% profit, this would be the current portfolio value
    const expectedBreakEvenValue =
      ConvertUtils.convertBigIntegerToFloat(BigInt(lastYearsValue)) + currentYearInvestedBalance;
    const currentYearRoiValue = fullCurrentValue - expectedBreakEvenValue;
    const currentYearRoiPercentage =
      expectedBreakEvenValue != 0
        ? (currentYearRoiValue / expectedBreakEvenValue) * 100
        : globalRoiPercentage;
    const monthlySnapshots = await getAllAssetSnapshotsForUser(userId, prismaTx);
    const currentValueDistribution = {};
    for (const [assetType, assetValue] of currentValuesByAssetType) {
      const totalValue = totalCurrentValue;
      const percentage = totalValue != 0 ? (assetValue / totalValue) * 100 : '-';
      const data = {};
      data[`${assetType}`] = percentage;
      currentValueDistribution[assetType] = data;
    }

    // Sort assets array by absolute roi value (DESC)
    userAssets.sort((a, b) => {
      return b.absolute_roi_value - a.absolute_roi_value;
    });
    const topPerformingAssets = userAssets;
    let yearOfFirstSnapshotForUser = DateTimeUtils.getYearFromTimestamp();
    if (monthlySnapshots.length > 0) {
      yearOfFirstSnapshotForUser = monthlySnapshots[0].year;
    }

    const roiByYear = await getCombinedRoiByYear(userId, yearOfFirstSnapshotForUser, prismaTx);
    const combinedRoiByYear = roiByYear;

    return {
      total_invested_value: totalInvestedValue,
      total_current_value: totalCurrentValue,
      global_roi_value: globalRoiValue,
      global_roi_percentage: globalRoiPercentage,
      current_year_roi_value: currentYearRoiValue,
      current_year_roi_percentage: currentYearRoiPercentage,
      monthly_snapshots: monthlySnapshots,
      current_value_distribution: Object.values(currentValueDistribution),
      top_performing_assets: topPerformingAssets,
      combined_roi_by_year: combinedRoiByYear,
    };
  }, dbClient);

const getAllAssetsSummaryForUser = async (userId: bigint, dbClient = prisma) =>
  performDatabaseRequest(async (prismaTx) => {
    return prismaTx.invest_assets.findMany({
      where: {
        users_user_id: userId,
      },
      select: {
        asset_id: true,
        name: true,
        ticker: true,
        type: true,
      },
    });
  }, dbClient);

const deleteAsset = async (userId: bigint, assetId: bigint, dbClient = undefined) =>
  performDatabaseRequest(async (prismaTx) => {
    if (!(await doesAssetBelongToUser(userId, assetId, prismaTx))) {
      throw APIError.notAuthorized();
    }

    // delete transactions
    await prismaTx.invest_transactions.deleteMany({
      where: {
        invest_assets_asset_id: assetId,
      },
    });

    // delete snapshot references
    await prismaTx.invest_asset_evo_snapshot.deleteMany({
      where: {
        invest_assets_asset_id: assetId,
      },
    });

    // delete asset
    await prismaTx.invest_assets.delete({
      where: { asset_id: assetId },
    });
  }, dbClient);

const getAssetDetailsForUser = async (
  userId: bigint,
  assetId: bigint,
  dbClient = undefined
): Promise<InvestAssetWithCalculatedAmounts> =>
  performDatabaseRequest(async (prismaTx) => {
    if (!(await doesAssetBelongToUser(userId, assetId, prismaTx))) {
      throw APIError.notAuthorized();
    }

    /*const asset = (await getAllAssetsForUser(userId, prismaTx)).find(
      (assetItem) => assetItem.asset_id == assetId
    );*/

    const asset = await prismaTx.invest_assets.findUniqueOrThrow({
      where: {
        users_user_id: userId,
        asset_id: assetId,
      },
    });

    return calculateAssetAmounts(asset, prismaTx);
    /*const month = DateTimeUtils.getMonthNumberFromTimestamp();
    const year = DateTimeUtils.getYearFromTimestamp();
    const snapshot = await getLatestSnapshotForAsset(assetId, null, null, prismaTx);
    const investedValue = ConvertUtils.convertBigIntegerToFloat(
      BigInt(snapshot?.invested_amount ?? 0)
    );
    const withdrawnAmount = ConvertUtils.convertBigIntegerToFloat(
      BigInt(snapshot?.withdrawn_amount ?? 0)
    );
    const currentValue = ConvertUtils.convertBigIntegerToFloat(BigInt(snapshot?.current_value ?? 0));
    const feesAndTaxes = parseFloat(
      await getTotalFessAndTaxesForAsset(asset.asset_id as bigint, dbClient)
    );

    let currentlyInvestedValue = investedValue - withdrawnAmount;
    if (currentlyInvestedValue < 0) currentlyInvestedValue = 0;
    const roiValue = currentValue + withdrawnAmount - (investedValue + feesAndTaxes);
    const roiPercentage =
      investedValue == 0 ? '∞' : (roiValue / (investedValue + feesAndTaxes)) * 100;*/
  }, dbClient);

const addCustomBalanceSnapshot = async (
  assetId: bigint,
  month: number,
  year: number,
  units: number,
  investedAmount: number,
  currentAmount: number,
  withdrawnAmount: number,
  dbClient = prisma
) => {
  const currentTimestamp = DateTimeUtils.getCurrentUnixTimestamp();
  return dbClient.$queryRaw`INSERT INTO invest_asset_evo_snapshot (month, year, units, invested_amount, current_value, invest_assets_asset_id, created_at, updated_at, withdrawn_amount)
                                  VALUES (${month}, ${year}, ${units}, ${investedAmount}, ${currentAmount}, ${assetId}, ${currentTimestamp}, ${currentTimestamp}, ${withdrawnAmount})
                                  ON DUPLICATE KEY UPDATE units = ${units}, invested_amount = ${investedAmount}, updated_at = ${currentTimestamp}, withdrawn_amount = ${withdrawnAmount};`;
};

const getAllTransactionsForAssetBetweenDates = async (
  assetId: bigint,
  fromDate: bigint | number,
  toDate: bigint | number,
  dbClient = prisma
) =>
  performDatabaseRequest(async (prismaTx) => {
    return prismaTx.$queryRaw`SELECT * FROM invest_transactions 
            WHERE date_timestamp BETWEEN ${fromDate} AND ${toDate}
            AND invest_assets_asset_id = ${assetId}
            ORDER BY date_timestamp ASC`;
  }, dbClient);

const recalculateSnapshotForAssetsIncrementally = async (
  assetId: bigint,
  originalFromDate: number | bigint,
  originalToDate: number | bigint,
  dbClient = undefined
) =>
  performDatabaseRequest(async (prismaTx) => {
    /* Logger.addLog(`account: ${accountId} | fromDate: ${fromDate} | toDate: ${toDate}`); */
    /*
     * Given that I'm unable to know the invested/current amounts of an asset at any specific time (only at the end of each month),
     * I will need to recalculate from the beginning of the month relative to $fromDate all the way to the end of
     * month associated with $toDate.
     *
     * Will update units, current_amount & invested_amount
     */

    let beginMonth = DateTimeUtils.getMonthNumberFromTimestamp(originalFromDate);
    let beginYear = DateTimeUtils.getYearFromTimestamp(originalFromDate);
    Logger.addLog(`Begin month: ${beginMonth} | original from date: ${originalFromDate}`);
    // Get snapshot from 2 months prior of begin date
    let priorMonthsSnapshot = await getLatestSnapshotForAsset(
      assetId,
      beginMonth > 2 ? beginMonth - 2 : 12 - 2 + beginMonth,
      beginMonth > 2 ? beginYear : beginYear - 1,
      prismaTx
    );

    if (!priorMonthsSnapshot) {
      priorMonthsSnapshot = {
        units: 0,
        current_value: 0,
        invested_amount: 0,
        year: -1,
        month: -1,
        invest_assets_asset_id: assetId,
        withdrawn_amount: 0,
        updated_at: -1,
        created_at: -1,
      };
    }

    await addCustomBalanceSnapshot(
      assetId,
      beginMonth,
      beginYear,
      Number(priorMonthsSnapshot.units),
      Number(priorMonthsSnapshot.invested_amount),
      Number(priorMonthsSnapshot.current_value),
      Number(priorMonthsSnapshot.withdrawn_amount),
      prismaTx
    );

    // Reset snapshots for next 2 months (in case there are no transactions in these months and the balance doesn't get recalculated
    let addCustomBalanceSnapshotsPromises = [];
    addCustomBalanceSnapshotsPromises.push(
      addCustomBalanceSnapshot(
        assetId,
        DateTimeUtils.incrementMonthByX(beginMonth, beginYear, 1).month, //beginMonth < 12 ? beginMonth + 1 : 1,
        DateTimeUtils.incrementMonthByX(beginMonth, beginYear, 1).year, //beginMonth < 12 ? beginYear : beginYear + 1,
        Number(priorMonthsSnapshot.units),
        Number(priorMonthsSnapshot.invested_amount),
        Number(priorMonthsSnapshot.current_value),
        Number(priorMonthsSnapshot.withdrawn_amount),
        prismaTx
      )
    );

    addCustomBalanceSnapshotsPromises.push(
      addCustomBalanceSnapshot(
        assetId,
        DateTimeUtils.incrementMonthByX(beginMonth, beginYear, 2).month, //beginMonth < 11 ? beginMonth + 2 : 1,
        DateTimeUtils.incrementMonthByX(beginMonth, beginYear, 2).year, //beginMonth < 11 ? beginYear : beginYear + 1,
        Number(priorMonthsSnapshot.units),
        Number(priorMonthsSnapshot.invested_amount),
        Number(priorMonthsSnapshot.current_value),
        Number(priorMonthsSnapshot.withdrawn_amount),
        prismaTx
      )
    );

    await Promise.all(addCustomBalanceSnapshotsPromises);

    if (beginMonth > 1) beginMonth--;
    else {
      beginMonth = 12;
      beginYear--;
    }

    let endMonth = DateTimeUtils.getMonthNumberFromTimestamp(originalToDate);
    let endYear = DateTimeUtils.getYearFromTimestamp(originalToDate);

    if (endMonth < 12) endMonth++;
    else {
      endMonth = 1;
      endYear++;
    }

    const fromDate = DateTimeUtils.getUnixTimestampFromDate(new Date(beginYear, beginMonth - 1, 1));
    const toDate = DateTimeUtils.getUnixTimestampFromDate(new Date(endYear, endMonth - 1, 1));

    const trxList = await getAllTransactionsForAssetBetweenDates(
      assetId,
      fromDate,
      toDate,
      prismaTx
    );
    Logger.addLog(`----- dates between ${fromDate} & ${toDate}`);
    Logger.addStringifiedLog(trxList);
    Logger.addLog('-----');
    let initialSnapshot = priorMonthsSnapshot;
    if (!initialSnapshot) {
      initialSnapshot = {
        units: 0,
        current_value: 0,
        invested_amount: 0,
        year: -1,
        month: -1,
        invest_assets_asset_id: assetId,
        withdrawn_amount: 0,
        updated_at: -1,
        created_at: -1,
      };
    }

    for (const trx of trxList) {
      const trxDate = Number(trx.date_timestamp);
      const month = DateTimeUtils.getMonthNumberFromTimestamp(trxDate);
      const year = DateTimeUtils.getYearFromTimestamp(trxDate);

      const trxType = trx.type;
      const changeInAmounts = trx.total_price;
      let changeInUnits = trx.units;

      if (trxType == MYFIN.INVEST.TRX_TYPE.SELL) {
        changeInUnits *= -1;
        initialSnapshot.withdrawn_amount =
          Number(initialSnapshot.withdrawn_amount) + parseFloat(changeInAmounts);
      } else {
        initialSnapshot.invested_amount =
          Number(initialSnapshot.invested_amount) + parseFloat(changeInAmounts);
      }

      initialSnapshot.units = Number(initialSnapshot.units) + parseFloat(changeInUnits);

      /* Automatically add snapshots for current & next 6 months in order to create a buffer*/
      addCustomBalanceSnapshotsPromises = [];

      addCustomBalanceSnapshotsPromises.push(
        addCustomBalanceSnapshot(
          assetId,
          month,
          year,
          Number(initialSnapshot.units),
          Number(initialSnapshot.invested_amount),
          Number(initialSnapshot.current_value),
          Number(initialSnapshot.withdrawn_amount),
          prismaTx
        )
      );

      for (let i = 1; i <= 6; i++) {
        addCustomBalanceSnapshotsPromises.push(
          addCustomBalanceSnapshot(
            assetId,
            DateTimeUtils.incrementMonthByX(month, year, i).month,
            DateTimeUtils.incrementMonthByX(month, year, i).year,
            Number(initialSnapshot.units),
            Number(initialSnapshot.invested_amount),
            Number(initialSnapshot.current_value),
            Number(initialSnapshot.withdrawn_amount),
            prismaTx
          )
        );
      }

      await Promise.all(addCustomBalanceSnapshotsPromises);
    }

    return initialSnapshot;
  }, dbClient);

const deleteAllAssetEvoSnapshotsForUser = async (userId: bigint, dbClient = prisma) => {
  return dbClient.$queryRaw`DELETE invest_asset_evo_snapshot FROM invest_asset_evo_snapshot 
    LEFT JOIN invest_assets ON invest_assets.asset_id = invest_asset_evo_snapshot.invest_assets_asset_id 
    WHERE users_user_id = ${userId} `;
};

export default {
  getAllAssetsForUser,
  createAsset,
  updateAsset,
  updateCurrentAssetValue,
  getAssetStatsForUser,
  getAllAssetsSummaryForUser,
  deleteAsset,
  getAssetDetailsForUser,
  doesAssetBelongToUser,
  recalculateSnapshotForAssetsIncrementally,
  deleteAllAssetEvoSnapshotsForUser,
};
