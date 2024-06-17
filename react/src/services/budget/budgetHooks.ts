import BudgetServices from './budgetServices.ts';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';

const QUERY_KEY_GET_BUDGETS = 'QUERY_KEY_GET_BUDGETS';
const QUERY_KEY_GET_BUDGET = 'QUERY_KEY_GET_BUDGET';

export function useGetBudgets(
  page: number,
  pageSize: number,
  query?: string,
  status?: 'C' | 'O',
) {
  async function getBudgets() {
    const data = await BudgetServices.getBudgets(page, pageSize, query, status);
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_BUDGETS, page, pageSize, query, status],
    queryFn: getBudgets,
    placeholderData: keepPreviousData,
  });
}

export function useRemoveBudget() {
  async function removeBudget(budgetId: bigint) {
    const request = await BudgetServices.removeBudget(budgetId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_BUDGETS],
    });
    return request;
  }

  return useMutation({
    mutationFn: removeBudget,
  });
}

export interface UpdateBudgetStatusParams {
  budgetId: bigint;
  isOpen: boolean;
}

export function useUpdateBudgetStatus() {
  async function updateBudgetStatus({
    budgetId,
    isOpen,
  }: UpdateBudgetStatusParams) {
    const request = await BudgetServices.updateBudgetStatus(budgetId, isOpen);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_BUDGET],
    });
    return request;
  }

  return useMutation({
    mutationFn: updateBudgetStatus,
  });
}

export function useGetBudget(budgetId: bigint) {
  async function getBudget() {
    const data = await BudgetServices.getBudget(budgetId);
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_BUDGET, budgetId],
    queryFn: getBudget,
    placeholderData: keepPreviousData,
    enabled: true,
  });
}