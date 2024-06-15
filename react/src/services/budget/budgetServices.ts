import { axios } from '../../data/axios.ts';
import { Category } from '../trx/trxServices.ts';

export type BudgetCategory = Category & {
  avg_12_months_credit: number;
  avg_12_months_debit: number;
  avg_lifetime_credit: number;
  avg_lifetime_debit: number;
  avg_previous_month_credit: number;
  avg_previous_month_debit: number;
  avg_same_month_previous_year_credit: number;
  avg_same_month_previous_year_debit: number;
  budgets_budget_id: number;
  planned_amount_credit: number;
  planned_amount_debit: number;
  current_amount_credit: number;
  current_amount_debit: number;
};

export type Budget = {
  budget_id: bigint;
  balance_change_percentage: number;
  balance_value: number;
  credit_amount: number;
  debit_amount: number;
  is_open: 0 | 1;
  month: number;
  year: number;
  observations: string;
  savings_rate_percentage: number;
};

export type BudgetDetails = {
  budget_id: bigint;
  balance_change_percentage: number;
  balance_value: number;
  credit_amount: number;
  debit_amount: number;
  is_open: 0 | 1;
  month: number;
  year: number;
  observations: string;
  savings_rate_percentage: number;
  debit_essential_trx_total: number;
  initial_balance: number;
  categories: BudgetCategory[];
};

export type GetBudgetsResponse = {
  filtered_count: number;
  results: Budget[];
  total_count: number;
};

const getBudgets = (
  page: number,
  page_size: number,
  query?: string,
  status?: 'C' | 'O',
) => {
  return axios.get<GetBudgetsResponse>(`/budgets/filteredByPage/${page}`, {
    params: {
      page_size,
      query,
      status,
    },
  });
};

const removeBudget = (budgetId: bigint) => {
  return axios.delete<string>(`/budgets`, { data: { budget_id: budgetId } });
};

const getBudget = (budgetId: bigint) => {
  return axios.get<BudgetDetails>(`/budgets/${budgetId}`);
};

export default {
  getBudgets,
  removeBudget,
  getBudget,
};
