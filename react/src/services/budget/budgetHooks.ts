import BudgetServices from './budgetServices.ts';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

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
