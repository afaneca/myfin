import { prisma } from "../config/prisma.js";
import { Prisma } from "@prisma/client";
import DateTimeUtils from "../utils/DateTimeUtils.js";


/**
 * Fetches all categories associated with ***userId***.
 * @param userId - user id
 * @param selectAttributes - category attributes to be returned. *Undefined* will return them all.
 * @param dbClient - the db client
 */
const getAllEntitiesForUser = async (
  userId: bigint,
  selectAttributes = undefined,
  dbClient = prisma
): Promise<Array<Prisma.entitiesWhereInput>> =>
  dbClient.entities.findMany({
    where: { users_user_id: userId },
    select: selectAttributes,
  });

const createEntity = async (entity: Prisma.entitiesCreateInput, dbClient = prisma) => {
  return dbClient.entities.create({ data: entity });
};

const deleteEntity = async (userId: bigint, entityId: number, dbClient = prisma) =>
  dbClient.entities.delete({
    where: {
      users_user_id: userId,
      entity_id: entityId,
    },
  });

const updateEntity = async (userId: bigint, entityId: number, entity: Prisma.entitiesUpdateInput, dbClient = prisma) =>
  dbClient.entities.update({
    where: {
      users_user_id: userId,
      entity_id: entityId,
    },
    data: { name: entity.name },
  });

const getCountOfUserEntities = async (userId, dbClient = prisma) =>
  dbClient.entities.count({
    where: { users_user_id: userId },
  });

const buildSqlForExcludedAccountsList = (excludedAccs) => {
  if (!excludedAccs || excludedAccs.length === 0) {
    return ' 1 == 1';
  }
  let sql = ' (';
  for (let cnt = 0; cnt < excludedAccs.length; cnt++) {
    const acc = excludedAccs[cnt].account_id;
    sql += ` '${acc}' `;

    if (cnt !== excludedAccs.length - 1) {
      sql += ', ';
    }
  }
  sql += ') ';
  return sql;
};

const getAmountForEntityInPeriod = async (
  entityId: number | bigint,
  fromDate: number,
  toDate: number,
  includeTransfers = true,
  dbClient = prisma
): Promise<{ entity_balance_credit: number; entity_balance_debit: number }> => {
  /*  Logger.addLog(
         `Entity: ${entityId} | fromDate: ${fromDate} | toDate: ${toDate} | includeTransfers: ${includeTransfers}`); */
  let accsExclusionSqlExcerptAccountsTo = '';
  let accsExclusionSqlExcerptAccountsFrom = '';
  let accountsToExcludeListInSQL = '';

  const listOfAccountsToExclude = await dbClient.accounts.findMany({
    where: { exclude_from_budgets: true },
  });
  if (!listOfAccountsToExclude || listOfAccountsToExclude.length < 1) {
    accsExclusionSqlExcerptAccountsTo = ' 1 = 1 ';
    accsExclusionSqlExcerptAccountsFrom = ' 1 = 1 ';
  } else {
    accountsToExcludeListInSQL = buildSqlForExcludedAccountsList(listOfAccountsToExclude);
    accsExclusionSqlExcerptAccountsTo = `accounts_account_to_id NOT IN ${accountsToExcludeListInSQL} `;
    accsExclusionSqlExcerptAccountsFrom = `accounts_account_from_id NOT IN ${accountsToExcludeListInSQL} `;
  }

  if (includeTransfers) {
    return dbClient.$queryRaw`SELECT sum(if(type = 'I' OR
                                                (type = 'T' AND ${accsExclusionSqlExcerptAccountsTo}),
                                                amount,
                                                0)) as 'entity_balance_credit',
                                         sum(if(type = 'E' OR
                                                (type = 'T' AND ${accsExclusionSqlExcerptAccountsFrom}),
                                                amount,
                                                0)) as 'entity_balance_debit'
                                  FROM transactions
                                  WHERE date_timestamp between ${fromDate} AND ${toDate}
                                    AND entities_entity_id = ${entityId} `;
  }

  return dbClient.$queryRaw`SELECT sum(if(type = 'I', amount, 0)) as 'entity_balance_credit',
                                   sum(if(type = 'E', amount, 0)) as 'entity_balance_debit'
                            FROM transactions
                            WHERE date_timestamp between ${fromDate} AND ${toDate}
                              AND entities_entity_id = ${entityId} `;
};

export interface CalculatedEntityAmounts {
  entity_balance_credit: number;
  entity_balance_debit: number;
}

const getAmountForEntityInMonth = async (
  entityId: bigint,
  month: number,
  year: number,
  includeTransfers = true,
  dbClient = prisma
): Promise<CalculatedEntityAmounts> => {
  const nextMonth = month < 12 ? month + 1 : 1;
  const nextMonthsYear = month < 12 ? year : year + 1;
  const maxDate = DateTimeUtils.getUnixTimestampFromDate(
    new Date(nextMonthsYear, nextMonth - 1, 1)
  );
  const minDate = DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 1));
  /* Logger.addLog(`cat id: ${categoryId} | month: ${month} | year: ${year} | minDate: ${minDate} | maxDate: ${maxDate}`); */
  const amounts = await getAmountForEntityInPeriod(
    entityId,
    minDate,
    maxDate,
    includeTransfers,
    dbClient
  );
  return amounts[0];
};

export default {
  getAllEntitiesForUser,
  createEntity,
  deleteEntity,
  updateEntity,
  getCountOfUserEntities,
  getAmountForEntityInMonth,
};
