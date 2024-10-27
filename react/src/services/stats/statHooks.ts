import statServices, { NamedAccountSnapshot } from './statServices.ts';
import { useQuery } from '@tanstack/react-query';
import { Account } from '../auth/authServices.ts';
import { useUserData } from '../../providers/UserProvider.tsx';

const QUERY_KEY_GET_MONTH_BY_MONTH_EXPENSES_INCOME_DIST =
  'QUERY_KEY_GET_MONTH_BY_MONTH_EXPENSES_INCOME_DIST';
const QUERY_KEY_GET_MONTH_BY_MONTH_DATA = 'QUERY_KEY_GET_MONTH_BY_MONTH_DATA';
const QUERY_KEY_GET_BALANCE_SNAPSHOTS = 'QUERY_KEY_GET_BALANCE_SNAPSHOTS';

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
