import investServices from './investServices.ts';
import InvestServices, {
  AddAssetRequest,
  AddInvestTransactionRequest,
  EditAssetRequest,
  EditInvestTransactionRequest,
} from './investServices.ts';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';

const QUERY_KEY_GET_INVEST_STATS = 'QUERY_KEY_GET_INVEST_STATS';
const QUERY_KEY_GET_ASSETS = 'QUERY_KEY_GET_ASSETS';
const QUERY_KEY_GET_INVEST_TRX = 'QUERY_KEY_GET_INVEST_TRX';
const QUERY_KEY_GET_ASSETS_SUMMARY = 'QUERY_KEY_GET_ASSETS_SUMMARY';

export function useGetInvestStats() {
  async function getInvestStats() {
    const data = await investServices.getInvestStats();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_INVEST_STATS],
    queryFn: getInvestStats,
    placeholderData: keepPreviousData,
  });
}

export function useGetAssets() {
  async function getAssets() {
    const data = await investServices.getAssets();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_ASSETS],
    queryFn: getAssets,
    placeholderData: keepPreviousData,
  });
}

export function useRemoveAsset() {
  async function removeAsset(assetId: bigint) {
    const result = await InvestServices.removeAsset(assetId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ASSETS],
    });
    return result;
  }

  return useMutation({
    mutationFn: removeAsset,
  });
}

export function useUpdateAssetValue() {
  async function updateAssetValue(request: {
    assetId: bigint;
    newValue: number;
    month?: number;
    year?: number;
  }) {
    const result = await InvestServices.updateAssetValue(
      request.assetId,
      request.newValue,
      request.month,
      request.year,
    );

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ASSETS],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_INVEST_STATS],
    });
    return result;
  }

  return useMutation({
    mutationFn: updateAssetValue,
  });
}

export function useAddAsset() {
  async function addAsset(request: AddAssetRequest) {
    const result = await investServices.addAsset(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ASSETS],
    });
    return result;
  }

  return useMutation({
    mutationFn: addAsset,
  });
}

export function useEditAsset() {
  async function editAsset(request: EditAssetRequest) {
    const result = await investServices.editAsset(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ASSETS],
    });
    return result;
  }

  return useMutation({
    mutationFn: editAsset,
  });
}

export function useGetInvestTransactions(
  page: number,
  pageSize: number,
  query?: string,
) {
  async function getTransactions() {
    const data = await InvestServices.getTransactions(page, pageSize, query);
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_INVEST_TRX, page, pageSize, query],
    queryFn: getTransactions,
    placeholderData: keepPreviousData,
  });
}

export function useAddInvestTransaction() {
  async function addTransaction(request: AddInvestTransactionRequest) {
    const result = await investServices.addTransaction(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_INVEST_TRX],
    });
    return result;
  }

  return useMutation({
    mutationFn: addTransaction,
  });
}

export function useEditInvestTransaction() {
  async function editTransaction(args: {
    trxId: bigint;
    request: EditInvestTransactionRequest;
  }) {
    const result = await investServices.editTransaction(
      args.trxId,
      args.request,
    );

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_INVEST_TRX],
    });
    return result;
  }

  return useMutation({
    mutationFn: editTransaction,
  });
}

export function useRemoveInvestTransaction() {
  async function removeTransaction(trxId: bigint) {
    const result = await investServices.removeTransaction(trxId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_INVEST_TRX],
    });
    return result;
  }

  return useMutation({
    mutationFn: removeTransaction,
  });
}

export function useGetAssetsSummary() {
  async function getAssetsSummary() {
    const data = await InvestServices.getAssetsSummary();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_ASSETS_SUMMARY],
    queryFn: getAssetsSummary,
    placeholderData: keepPreviousData,
  });
}
