import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';
import TrxServices, { AddTransactionRequest } from './trxServices.ts';

const QUERY_KEY_GET_TRANSACTIONS = 'QUERY_KEY_GET_TRANSACTIONS';
const QUERY_KEY_ADD_TRANSACTION_STEP0 = 'QUERY_KEY_ADD_TRANSACTION_STEP0';

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

export function useAddTransactionStep0() {
  async function addTransactionStep0() {
    const data = await TrxServices.addTransactionStep0();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_ADD_TRANSACTION_STEP0],
    queryFn: addTransactionStep0,
    enabled: false,
  });
}

export function useAddTransactionStep1() {
  async function addTransaction(trx: AddTransactionRequest) {
    const request = await TrxServices.addTransactionStep1(trx);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_TRANSACTIONS],
    });
    return request;
  }

  return useMutation({
    mutationFn: addTransaction,
  });
}
