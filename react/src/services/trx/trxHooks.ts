import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';
import TrxServices from './trxServices.ts';

const QUERY_KEY_GET_TRANSACTIONS = 'QUERY_KEY_GET_TRANSACTIONS';

export function useGetTransactions(
  page: number,
  pageSize: number,
  query?: string,
) {
  async function getTransactions() {
    const data = await TrxServices.getTransactions(page, pageSize, query);
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_TRANSACTIONS, page, pageSize, query],
    queryFn: getTransactions,
    placeholderData: keepPreviousData,
  });
}

export function useRemoveTransaction() {
  async function removeTransaction(trxId: number) {
    const request = await TrxServices.removeTransaction(trxId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_TRANSACTIONS],
    });
    return request;
  }

  return useMutation({
    mutationFn: removeTransaction,
  });
}
