import BudgetServices, {
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from './budgetServices.ts';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';

const QUERY_KEY_GET_BUDGETS = 'QUERY_KEY_GET_BUDGETS';
const QUERY_KEY_GET_BUDGET = 'QUERY_KEY_GET_BUDGET';
const QUERY_KEY_CREATE_BUDGET_STEP0 = 'QUERY_KEY_CREATE_BUDGET_STEP0';

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
    enabled: budgetId != -1n,
  });
}

export function useUpdateBudget() {
  async function updateBudget(requestData: UpdateBudgetRequest) {
    const request = await BudgetServices.updateBudget(requestData);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_BUDGET],
    });
    return request;
  }

  return useMutation({
    mutationFn: updateBudget,
  });
}

export function useCreateBudgetStep0() {
  async function createBudgetStep0() {
    const data = await BudgetServices.createBudgetStep0();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_CREATE_BUDGET_STEP0],
    queryFn: createBudgetStep0,
    placeholderData: keepPreviousData,
    enabled: false,
  });
}

export function useCreateBudgetStep1() {
  async function createBudgetStep1(requestData: CreateBudgetRequest) {
    const request = await BudgetServices.createBudgetStep1(requestData);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_BUDGET],
    });
    return request.data;
  }

  return useMutation({
    mutationFn: createBudgetStep1,
  });
}
