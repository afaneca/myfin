import BudgetServices from './budgetServices.ts';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';

const QUERY_KEY_GET_BUDGETS = 'QUERY_KEY_GET_BUDGETS';

export function useGetBudgets(page: number, pageSize: number, query?: string) {
  async function getBudgets() {
    const data = await BudgetServices.getBudgets(page, pageSize, query);
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_BUDGETS, page, pageSize, query],
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
