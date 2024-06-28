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
  initial_planned_amount_debit?: number;
  initial_planned_amount_credit?: number;
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

const updateBudgetStatus = (budgetId: bigint, isOpen: boolean) => {
  return axios.put<string>(`/budgets/status`, {
    budget_id: budgetId,
    is_open: !isOpen,
  });
};

export type UpdateBudgetCatValues = {
  category_id: string;
  planned_value_debit: string;
  planned_value_credit: string;
};

export type UpdateBudgetRequest = {
  budget_id: number;
  month: number;
  year: number;
  observations: string;
  cat_values_arr: UpdateBudgetCatValues[];
};

const updateBudget = (request: UpdateBudgetRequest) => {
  return axios.put<string>(`/budgets/`, {
    budget_id: request.budget_id,
    month: request.month,
    year: request.year,
    observations: request.observations,
    cat_values_arr: JSON.stringify(request.cat_values_arr),
  });
};

export type CreateBudgetStepResponse = {
  categories: BudgetCategory[];
  initial_balance: string;
};

const createBudgetStep0 = () => {
  return axios.post<CreateBudgetStepResponse>(`/budgets/step0`);
};

export type CreateBudgetRequest = {
  month: number;
  year: number;
  observations: string;
  cat_values_arr: UpdateBudgetCatValues[];
};

export type CreateBudgetResponse = {
  budget_id: number;
};
const createBudgetStep1 = (request: CreateBudgetRequest) => {
  return axios.post<CreateBudgetResponse>(`/budgets/step1`, {
    month: request.month,
    year: request.year,
    observations: request.observations,
    cat_values_arr: JSON.stringify(request.cat_values_arr),
  });
};

export type BudgetListSummaryItem = {
  month: number;
  year: number;
  budget_id: bigint;
};

const getBudgetListSummary = () => {
  return axios.get<BudgetListSummaryItem[]>(`/budgets/list/summary`);
};

export default {
  getBudgets,
  removeBudget,
  getBudget,
  updateBudgetStatus,
  updateBudget,
  createBudgetStep0,
  createBudgetStep1,
  getBudgetListSummary,
};
