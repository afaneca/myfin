import { keepPreviousData, useQuery } from '@tanstack/react-query';
import AccountServices from './accountServices.ts';

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
