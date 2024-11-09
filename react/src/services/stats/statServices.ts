import { axios } from '../../data/axios.ts';
import { AccountType } from '../auth/authServices.ts';
import { Category } from '../category/categoryServices.ts';
import { Entity, Tag } from '../trx/trxServices.ts';

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

export type GetCategoriesEntitiesTagsResponse = {
  categories: Category[];
  entities: Entity[];
  tags: Tag[];
};

const getCategoriesEntitiesTags = () => {
  return axios.get<GetCategoriesEntitiesTagsResponse>(
    `user/categoriesEntitiesTags`,
  );
};

export type CategoryExpensesIncomeEvolutionItem = {
  month: number;
  year: number;
  value: number;
};

const getCategoryExpensesEvolution = (categoryId: bigint) => {
  return axios.get<CategoryExpensesIncomeEvolutionItem[]>(
    `stats/category-expenses-evolution?cat_id=${categoryId}`,
  );
};

const getEntityExpensesEvolution = (entityId: bigint) => {
  return axios.get<CategoryExpensesIncomeEvolutionItem[]>(
    `stats/category-expenses-evolution?ent_id=${entityId}`,
  );
};

const getTagExpensesEvolution = (tagId: bigint) => {
  return axios.get<CategoryExpensesIncomeEvolutionItem[]>(
    `stats/category-expenses-evolution?tag_id=${tagId}`,
  );
};

const getCategoryIncomeEvolution = (categoryId: bigint) => {
  return axios.get<CategoryExpensesIncomeEvolutionItem[]>(
    `stats/category-income-evolution?cat_id=${categoryId}`,
  );
};

const getEntityIncomeEvolution = (entityId: bigint) => {
  return axios.get<CategoryExpensesIncomeEvolutionItem[]>(
    `stats/category-income-evolution?ent_id=${entityId}`,
  );
};

const getTagIncomeEvolution = (tagId: bigint) => {
  return axios.get<CategoryExpensesIncomeEvolutionItem[]>(
    `stats/category-income-evolution?tag_id=${tagId}`,
  );
};

export type CategoryYearByYearDataItem = {
  category_id: bigint;
  category_yearly_expense: number;
  category_yearly_income: number;
  name: string;
};

export type EntityYearByYearDataItem = {
  entity_id: bigint;
  entity_yearly_expense: number;
  entity_yearly_income: number;
  name: string;
};

export type TagYearByYearDataItem = {
  tag_id: bigint;
  tag_yearly_expense: number;
  tag_yearly_income: number;
  name: string;
  description: string;
};

export type YearByYearStatsResponse = {
  categories: CategoryYearByYearDataItem[];
  entities: EntityYearByYearDataItem[];
  tags: TagYearByYearDataItem[];
  year_of_first_trx: number;
};

const getYearByYearStats = (year: number) => {
  return axios.get<YearByYearStatsResponse>(
    `/stats/year-by-year-income-expense-distribution?year=${year}`,
  );
};

export type UserStatsResponse = {
  nr_of_accounts: number;
  nr_of_budgets: number;
  nr_of_categories: number;
  nr_of_entities: number;
  nr_of_rules: number;
  nr_of_tags: number;
  nr_of_trx: number;
};

const getUserStats = () => {
  return axios.get<UserStatsResponse>(`/stats/userStats`);
};

export default {
  getMonthExpensesIncomeDistributionData,
  getMonthByMonthData,
  getBalanceSnapshots,
  getProjectionStats,
  getCategoriesEntitiesTags,
  getCategoryExpensesEvolution,
  getEntityExpensesEvolution,
  getTagExpensesEvolution,
  getCategoryIncomeEvolution,
  getEntityIncomeEvolution,
  getTagIncomeEvolution,
  getYearByYearStats,
  getUserStats,
};
