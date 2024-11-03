import statServices, {
  AccountProjection,
  NamedAccountSnapshot,
} from './statServices.ts';
import { useQuery } from '@tanstack/react-query';
import { Account, AccountType } from '../auth/authServices.ts';
import { useUserData } from '../../providers/UserProvider.tsx';
import { calculateGrowthPercentage } from '../../utils/mathUtils.ts';

const QUERY_KEY_GET_MONTH_BY_MONTH_EXPENSES_INCOME_DIST =
  'QUERY_KEY_GET_MONTH_BY_MONTH_EXPENSES_INCOME_DIST';
const QUERY_KEY_GET_MONTH_BY_MONTH_DATA = 'QUERY_KEY_GET_MONTH_BY_MONTH_DATA';
const QUERY_KEY_GET_BALANCE_SNAPSHOTS = 'QUERY_KEY_GET_BALANCE_SNAPSHOTS';
const QUERY_KEY_GET_PROJECTION_STATS = 'QUERY_KEY_GET_PROJECTION_STATS';
const QUERY_KEY_GET_CATEGORIES_ENTITIES_TAGS =
  'QUERY_KEY_GET_CATEGORIES_ENTITIES_TAGS';
const QUERY_KEY_GET_CATEGORY_EXPENSES_EVOLUTION =
  'QUERY_KEY_GET_CATEGORY_EXPENSES_EVOLUTION';
const QUERY_KEY_GET_ENTITY_EXPENSES_EVOLUTION =
  'QUERY_KEY_GET_ENTITY_EXPENSES_EVOLUTION';
const QUERY_KEY_GET_TAG_EXPENSES_EVOLUTION =
  'QUERY_KEY_GET_TAG_EXPENSES_EVOLUTION';
const QUERY_KEY_GET_CATEGORY_INCOME_EVOLUTION =
  'QUERY_KEY_GET_CATEGORY_INCOME_EVOLUTION';
const QUERY_KEY_GET_ENTITY_INCOME_EVOLUTION =
  'QUERY_KEY_GET_ENTITY_INCOME_EVOLUTION';
const QUERY_KEY_GET_TAG_INCOME_EVOLUTION = 'QUERY_KEY_GET_TAG_INCOME_EVOLUTION';

export function useGetMonthExpensesIncomeDistributionData(
  month: number,
  year: number,
) {
  async function getMonthExpensesIncomeDistribution() {
    const response = await statServices.getMonthExpensesIncomeDistributionData(
      month,
      year,
    );
    return response.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_MONTH_BY_MONTH_EXPENSES_INCOME_DIST, month, year],
    queryFn: getMonthExpensesIncomeDistribution,
  });
}

export function useGetMonthByMonthData(limit: number = 5) {
  async function getMonthByMonthData() {
    const response = await statServices.getMonthByMonthData(limit);
    return response.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_MONTH_BY_MONTH_DATA, limit],
    queryFn: getMonthByMonthData,
  });
}

export type NamedBalanceSnapshotItem = {
  account_snapshots: NamedAccountSnapshot[];
  month: number;
  year: number;
};

export type NamedBalanceSnapshot = {
  snapshots: NamedBalanceSnapshotItem[];
  accounts: Account[];
};

export function useGetBalanceSnapshots() {
  const { userAccounts: accounts } = useUserData();

  async function getBalanceSnapshots(): Promise<NamedBalanceSnapshot> {
    const snapshotData = await statServices.getBalanceSnapshots();
    // Inject account name into related snapshots
    const snapshots = snapshotData.data.map((snapshot) => ({
      ...snapshot,
      account_snapshots: snapshot.account_snapshots.map((accountSnapshot) => {
        const name =
          accounts?.find((acc) => acc.account_id === accountSnapshot.account_id)
            ?.name ?? '';

        return { ...accountSnapshot, name };
      }),
    }));
    return { snapshots, accounts: accounts ?? [] };
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_BALANCE_SNAPSHOTS],
    queryFn: getBalanceSnapshots,
  });
}

export type ProjectionStatsItem = {
  month: number;
  year: number;
  previousBalance: number;
  finalBalance: number;
  // excluding debt
  finalBalanceAssets: number;
  // excluding debt & invest accounts
  finalBalanceOpFunds: number;
  growthRatePercentage: number;
};

export function useGetProjectionStats() {
  async function getProjectionStats(): Promise<ProjectionStatsItem[]> {
    const response = await statServices.getProjectionStats();

    let initialBalanceExcludingDebt =
      response.data.accountsFromPreviousMonth?.reduce(
        (result, current: AccountProjection) => {
          if (
            current.type == AccountType.Checking ||
            current.type == AccountType.Savings ||
            current.type == AccountType.Meal ||
            current.type == AccountType.Wallet ||
            current.type == AccountType.Investing ||
            current.type == AccountType.Other
          ) {
            return result + Number(current.balance);
          }

          return result;
        },
        0,
      ) ?? 0;

    const initialInvestBalance =
      response.data.accountsFromPreviousMonth?.reduce(
        (result, current: AccountProjection) => {
          if (current.type == AccountType.Investing) {
            return result + Number(current.balance);
          }

          return result;
        },
        0,
      ) ?? 0;

    return response.data.budgets?.map((budget) => {
      const assetOnlyBalance =
        initialBalanceExcludingDebt +
        Number(budget.planned_final_balance) -
        Number(budget.planned_initial_balance);
      initialBalanceExcludingDebt = assetOnlyBalance;
      return {
        month: budget.month,
        year: budget.year,
        previousBalance: budget.planned_initial_balance,
        finalBalance: budget.planned_final_balance,
        finalBalanceAssets: assetOnlyBalance,
        finalBalanceOpFunds: assetOnlyBalance - initialInvestBalance,
        growthRatePercentage:
          calculateGrowthPercentage(
            budget.planned_initial_balance,
            budget.planned_final_balance,
          ) ?? 0,
      };
    });
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_PROJECTION_STATS],
    queryFn: getProjectionStats,
  });
}

export function useGetCategoriesEntitiesTags() {
  async function getCategoryExpensesEvolution() {
    const response = await statServices.getCategoriesEntitiesTags();
    return response.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_CATEGORIES_ENTITIES_TAGS],
    queryFn: getCategoryExpensesEvolution,
  });
}

export function useGetCategoryExpensesEvolution(categoryId: bigint | null) {
  async function getCategoryExpensesEvolution() {
    if (!categoryId) return null;
    const response =
      await statServices.getCategoryExpensesEvolution(categoryId);
    return response.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_CATEGORY_EXPENSES_EVOLUTION, categoryId],
    queryFn: getCategoryExpensesEvolution,
  });
}

export function useGetEntityExpensesEvolution(entityId: bigint | null) {
  async function getEntityExpensesEvolution() {
    if (!entityId) return null;
    const response = await statServices.getEntityExpensesEvolution(entityId);
    return response.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_ENTITY_EXPENSES_EVOLUTION, entityId],
    queryFn: getEntityExpensesEvolution,
  });
}

export function useGetTagExpensesEvolution(tagId: bigint | null) {
  async function getTagExpensesEvolution() {
    if (!tagId) return null;
    const response = await statServices.getTagExpensesEvolution(tagId);
    return response.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_TAG_EXPENSES_EVOLUTION, tagId],
    queryFn: getTagExpensesEvolution,
  });
}

export function useGetCategoryIncomeEvolution(categoryId: bigint | null) {
  async function getCategoryIncomeEvolution() {
    if (!categoryId) return null;
    const response = await statServices.getCategoryIncomeEvolution(categoryId);
    return response.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_CATEGORY_INCOME_EVOLUTION, categoryId],
    queryFn: getCategoryIncomeEvolution,
  });
}

export function useGetEntityIncomeEvolution(entityId: bigint | null) {
  async function getEntityIncomeEvolution() {
    if (!entityId) return null;
    const response = await statServices.getEntityIncomeEvolution(entityId);
    return response.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_ENTITY_INCOME_EVOLUTION, entityId],
    queryFn: getEntityIncomeEvolution,
  });
}

export function useGetTagIncomeEvolution(tagId: bigint | null) {
  async function getTagIncomeEvolution() {
    if (!tagId) return null;
    const response = await statServices.getTagIncomeEvolution(tagId);
    return response.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_TAG_INCOME_EVOLUTION, tagId],
    queryFn: getTagIncomeEvolution,
  });
}
