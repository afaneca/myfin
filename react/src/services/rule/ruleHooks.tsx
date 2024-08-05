import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';
import ruleServices, { Rule } from './ruleServices.tsx';

const QUERY_KEY_GET_RULES = 'QUERY_KEY_GET_RULES';

export function useGetRules() {
  async function getRules() {
    const data = await ruleServices.getRules();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_RULES],
    queryFn: getRules,
    placeholderData: keepPreviousData,
  });
}

export function useRemoveRule() {
  async function removeRule(ruleId: bigint) {
    const result = await ruleServices.removeRule(ruleId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_RULES],
    });
    return result;
  }

  return useMutation({
    mutationFn: removeRule,
  });
}

export function useAddRule() {
  async function addRule(request: Partial<Rule>) {
    const result = await ruleServices.addRule(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_RULES],
    });
    return result;
  }

  return useMutation({
    mutationFn: addRule,
  });
}

export function useEditRule() {
  async function editRule(request: Rule) {
    const result = await ruleServices.editRule(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_RULES],
    });
    return result;
  }

  return useMutation({
    mutationFn: editRule,
  });
}
