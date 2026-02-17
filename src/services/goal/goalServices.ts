import { axios } from '../../data/axios.ts';

export type FundingAccount = {
  account_id: number;
  funding_type: 'absolute' | 'relative';
  funding_amount: number;
  current_funding?: number;
};

export type Goal = {
  goal_id: bigint;
  name: string;
  description: string;
  priority: number;
  amount: number;
  due_date: number | null;
  is_archived: boolean;
  currently_funded_amount: number;
  is_underfunded: boolean;
  funding_accounts: FundingAccount[];
};

export type CreateGoalRequest = {
  name: string;
  description: string;
  priority: number;
  amount: number;
  due_date?: number | null;
  funding_accounts: Omit<FundingAccount, 'current_funding'>[];
};

export type UpdateGoalRequest = CreateGoalRequest & {
  is_archived?: boolean;
};

const getGoals = (onlyActive: boolean = false) => {
  return axios.get<Goal[]>(`/goals`, {
    params: onlyActive ? { only_active: true } : undefined,
  });
};

const createGoal = (request: CreateGoalRequest) => {
  return axios.post<string>(`/goals`, request);
};

const updateGoal = (goalId: bigint, request: UpdateGoalRequest) => {
  return axios.put<string>(`/goals/${goalId}`, request);
};

const deleteGoal = (goalId: bigint) => {
  return axios.delete<string>(`/goals/${goalId}`);
};

export default {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
