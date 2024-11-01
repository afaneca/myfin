import { axios } from '../../data/axios.ts';
import { AccountType } from '../auth/authServices.ts';

export interface CategoryWithCalculatedAmounts {
  users_user_id?: number;
  category_id?: number;
  name?: string;
  status?: Status;
  type?: string;
  description?: string;
  color_gradient?: null | string;
  budgets_budget_id?: number;
  exclude_from_budgets?: number;
  planned_amount_credit?: string;
  planned_amount_debit?: string;
  current_amount?: string;
  current_amount_credit?: number;
  current_amount_debit?: number;
}

export enum Status {
  Active = 'Ativa',
  Inactive = 'Inativa',
}

export interface MonthExpensesDistributionDataResponse {
  last_update_timestamp?: number;
  categories?: CategoryWithCalculatedAmounts[];
}

const getMonthExpensesIncomeDistributionData = (
  month: number,
  year: number,
) => {
  return axios.get<MonthExpensesDistributionDataResponse>(
    `/stats/dashboard/month-expenses-income-distribution`,
    {
      params: {
        month,
        year,
      },
    },
  );
};

export interface MonthByMonthDataItem {
  month: number;
  year: number;
  balance_value: number;
}

const getMonthByMonthData = (limit: number) => {
  return axios.get<MonthByMonthDataItem[]>(`/stats/dashboard/month-by-month`, {
    params: {
      limit,
    },
  });
};

type GetBalanceSnapshotsResponseItem = {
  account_snapshots: AccountSnapshot[];
  month: number;
  year: number;
};

export type AccountSnapshot = {
  account_id: bigint;
  balance: number;
};

export type NamedAccountSnapshot = AccountSnapshot & {
  name: string;
};

const getBalanceSnapshots = () => {
  return axios.get<GetBalanceSnapshotsResponseItem[]>(
    `/accounts/stats/balance-snapshots`,
  );
};

export type AccountProjection = {
  account_id: bigint;
  type: AccountType;
  balance: number;
};

export type BudgetProjections = {
  budget_id: 108;
  initial_balance?: number;
  is_open: boolean;
  month: number;
  observations: string;
  planned_balance: number;
  planned_final_balance: number;
  planned_initial_balance: number;
  users_user_id: bigint;
  year: number;
};

export type GetProjectionStatsResponse = {
  accountsFromPreviousMonth: AccountProjection[];
  budgets: BudgetProjections[];
};

const getProjectionStats = () => {
  return axios.get<GetProjectionStatsResponse>(
    `stats/stats/monthly-patrimony-projections`,
  );
};

export default {
  getMonthExpensesIncomeDistributionData,
  getMonthByMonthData,
  getBalanceSnapshots,
  getProjectionStats,
};
