import { axios } from '../../data/axios.ts';

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

export type GetBudgetsResponse = {
  filtered_count: number;
  results: Budget[];
  total_count: number;
};

const getBudgets = (page: number, page_size: number, query?: string) => {
  return axios.get<GetBudgetsResponse>(`/budgets/filteredByPage/${page}`, {
    params: {
      page_size,
      query,
    },
  });
};

const removeBudget = (budgetId: bigint) => {
  return axios.delete<string>(`/budgets`, { data: { budget_id: budgetId } });
};

export default {
  getBudgets,
  removeBudget,
};
