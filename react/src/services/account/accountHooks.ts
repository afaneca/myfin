import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import AccountServices from './accountServices.ts';
import { queryClient } from '../../data/react-query.ts';

const QUERY_KEY_GET_ACCOUNTS = 'QUERY_KEY_GET_ACCOUNTS';

export function useGetAccounts() {
  async function getAccounts() {
    const data = await AccountServices.getAccounts();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_ACCOUNTS],
    queryFn: getAccounts,
    placeholderData: keepPreviousData,
  });
}

export function useRemoveAccount() {
  async function removeAccount(accountId: bigint) {
    const request = await AccountServices.removeAccount(accountId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ACCOUNTS],
    });
    return request;
  }

  return useMutation({
    mutationFn: removeAccount,
  });
}
