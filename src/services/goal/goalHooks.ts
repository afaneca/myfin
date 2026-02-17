import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';
import GoalServices, {
  CreateGoalRequest,
  UpdateGoalRequest,
} from './goalServices.ts';

const QUERY_KEY_GET_GOALS = 'QUERY_KEY_GET_GOALS';

export function useGetGoals(onlyActive: boolean = false) {
  async function getGoals() {
    const data = await GoalServices.getGoals(onlyActive);
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_GOALS, onlyActive],
    queryFn: getGoals,
    placeholderData: keepPreviousData,
  });
}

export function useCreateGoal() {
  async function createGoal(request: CreateGoalRequest) {
    const result = await GoalServices.createGoal(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_GOALS],
    });
    return result;
  }

  return useMutation({
    mutationFn: createGoal,
  });
}

export function useUpdateGoal() {
  async function updateGoal(args: {
    goalId: bigint;
    request: UpdateGoalRequest;
  }) {
    const result = await GoalServices.updateGoal(args.goalId, args.request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_GOALS],
    });
    return result;
  }

  return useMutation({
    mutationFn: updateGoal,
  });
}

export function useDeleteGoal() {
  async function deleteGoal(goalId: bigint) {
    const result = await GoalServices.deleteGoal(goalId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_GOALS],
    });
    return result;
  }

  return useMutation({
    mutationFn: deleteGoal,
  });
}
