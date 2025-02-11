import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import AccountServices, {
  AddAccountRequest,
  EditAccountRequest,
} from './accountServices.ts';
import { queryClient } from '../../data/react-query.ts';
import { useUserData } from '../../providers/UserProvider.tsx';

const QUERY_KEY_GET_ACCOUNTS = 'QUERY_KEY_GET_ACCOUNTS';

export function useGetAccounts() {
  const { updateUserAccounts } = useUserData();

  async function getAccounts() {
    const data = await AccountServices.getAccounts();
    updateUserAccounts(data.data);
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
    const result = await AccountServices.removeAccount(accountId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ACCOUNTS],
    });
    return result;
  }

  return useMutation({
    mutationFn: removeAccount,
  });
}

export function useAddAccount() {
  async function addAccount(request: AddAccountRequest) {
    const result = await AccountServices.addAccount(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ACCOUNTS],
    });
    return result;
  }

  return useMutation({
    mutationFn: addAccount,
  });
}

export function useEditAccount() {
  async function editAccount(request: EditAccountRequest) {
    const result = await AccountServices.editAccount(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ACCOUNTS],
    });
    return result;
  }

  return useMutation({
    mutationFn: editAccount,
  });
}

export function useRecalculateAllBalances() {
  async function recalculateAllBalances() {
    const data = await AccountServices.recalculateAllBalances();
    return data.data;
  }

  return useMutation({
    mutationFn: recalculateAllBalances,
  });
}

export function useAutoPopulateWithDemoData() {
  async function autoPopulateWithDemoData() {
    const data = await AccountServices.autoPopulateWithDemoData();
    return data.data;
  }

  return useMutation({
    mutationFn: autoPopulateWithDemoData,
  });
}
