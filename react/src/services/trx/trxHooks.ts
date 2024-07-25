import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';
import TrxServices, {
  AddTransactionRequest,
  AutoCategorizeTransactionRequest,
  EditTransactionRequest,
  ImportTransactionsStep1Request,
  TransactionsInMonthForCategoryRequest,
} from './trxServices.ts';
import { useUserData } from '../../providers/UserProvider.tsx';

const QUERY_KEY_GET_TRANSACTIONS = 'QUERY_KEY_GET_TRANSACTIONS';
const QUERY_KEY_ADD_TRANSACTION_STEP0 = 'QUERY_KEY_ADD_TRANSACTION_STEP0';
const QUERY_KEY_IMPORT_TRANSACTIONS_STEP0 =
  'QUERY_KEY_IMPORT_TRANSACTIONS_STEP0';
const QUERY_KEY_IMPORT_TRANSACTIONS_STEP1 =
  'QUERY_KEY_IMPORT_TRANSACTIONS_STEP1';
  const QUERY_KEY_IMPORT_TRANSACTIONS_STEP2 =
  'QUERY_KEY_IMPORT_TRANSACTIONS_STEP2';
const MUTATION_KEY_AUTO_CATEGORIZE_TRANSACTION = [
  'MUTATION_KEY_AUTO_CATEGORIZE_TRANSACTION',
];
const QUERY_KEY_GET_TRX_FOR_CATEGORY_IN_MONTH =
  'QUERY_KEY_GET_TRX_FOR_CATEGORY_IN_MONTH';

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
  async function removeTransaction(trxId: bigint) {
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
  const userData = useUserData();

  function getLastCachedTrx() {
    return userData.lastCachedTrx;
  }

  async function addTransactionStep0() {
    const data = await TrxServices.addTransactionStep0();
    const lastCachedTrx = getLastCachedTrx();
    return { ...data.data, cachedTrx: lastCachedTrx };
  }

  return useQuery({
    queryKey: [QUERY_KEY_ADD_TRANSACTION_STEP0],
    queryFn: addTransactionStep0,
    enabled: false,
  });
}

export function useAddTransactionStep1() {
  const { updateLastCachedTrx } = useUserData();

  function updateLastCachedTransaction(trx: AddTransactionRequest) {
    updateLastCachedTrx({
      amount: trx.amount,
      account_from_id: trx.account_from_id,
      account_to_id: trx.account_to_id,
      is_essential: +trx.is_essential as 0 | 1,
      date_timestamp: trx.date_timestamp,
      category_id: trx.category_id,
      entity_id: trx.entity_id,
    });
  }

  async function addTransaction(trx: AddTransactionRequest) {
    updateLastCachedTransaction(trx);
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

export function useEditTransaction() {
  async function editTransaction(trx: EditTransactionRequest) {
    const request = await TrxServices.editTransaction(trx);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_TRANSACTIONS],
    });
    return request;
  }

  return useMutation({
    mutationFn: editTransaction,
  });
}

export function useAutoCategorizeTransaction() {
  async function autoCategorizeTransaction(
    trx: AutoCategorizeTransactionRequest,
  ) {
    const request = await TrxServices.autoCategorizeTrx(trx);
    return request.data;
  }

  return useMutation({
    mutationFn: autoCategorizeTransaction,
    mutationKey: MUTATION_KEY_AUTO_CATEGORIZE_TRANSACTION,
  });
}

export function useGetTransactionsForCategoryInMonth(
  request: TransactionsInMonthForCategoryRequest,
) {
  async function getTransactionsForCategory() {
    const data = await TrxServices.getTransactionsForCategoryInMonth(request);
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_TRX_FOR_CATEGORY_IN_MONTH],
    queryFn: getTransactionsForCategory,
  });
}

export function useImportTransactionsStep0() {
  async function importTransactionsStep0() {
    const data = await TrxServices.importTransactionsStep0();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_IMPORT_TRANSACTIONS_STEP0],
    queryFn: importTransactionsStep0,
  });
}

export function useImportTransactionsStep1() {
  async function importTransactionsStep1(
    request: ImportTransactionsStep1Request,
  ) {
    const data = await TrxServices.importTransactionsStep1(request);
    return data.data;
  }

  return useMutation({
    mutationKey: [QUERY_KEY_IMPORT_TRANSACTIONS_STEP1],
    mutationFn: importTransactionsStep1,
  });
}

export function useImportTransactionsStep2() {
  async function importTransactionsStep2(
    list: AddTransactionRequest[]
  ) {
    const data = await TrxServices.importTransactionsStep2(list);
    return data.data;
  }

  return useMutation({
    mutationKey: [QUERY_KEY_IMPORT_TRANSACTIONS_STEP2],
    mutationFn: importTransactionsStep2,
  });
}
