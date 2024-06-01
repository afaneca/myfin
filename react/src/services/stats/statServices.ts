import { axios } from '../../data/axios.ts';

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

export default {
  getMonthExpensesIncomeDistributionData,
};
