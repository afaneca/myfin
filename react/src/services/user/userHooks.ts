import { Account, AccountType } from '../auth/authServices.ts';
import { useUserData } from '../../providers/UserProvider.tsx';

export function useGetTopSummaryValues() {
  const { userAccounts: accounts } = useUserData();
  const operatingFundsSum =
    accounts?.reduce((result, current: Account) => {
      if (
        current.type == AccountType.Checking ||
        current.type == AccountType.Savings ||
        current.type == AccountType.Meal ||
        current.type == AccountType.Wallet
      ) {
        return result + current.balance;
      }

      return result;
    }, 0) ?? 0;
  const investingSum =
    accounts?.reduce((result, current: Account) => {
      if (current.type == AccountType.Investing) {
        return result + current.balance;
      }

      return result;
    }, 0) ?? 0;
  const debtSum =
    accounts?.reduce((result, current: Account) => {
      if (current.type == AccountType.Credit) {
        return result + current.balance;
      }
      return result;
    }, 0) ?? 0;
  const netWorthSum =
    accounts?.reduce((result, current: Account) => {
      return result + current.balance;
    }, 0) ?? 0;

  return { operatingFundsSum, investingSum, debtSum, netWorthSum };
}

export function useGetDebtAccounts() {
  const { userAccounts: accounts } = useUserData();
  return accounts?.filter((acc) => acc.type == AccountType.Credit) ?? [];
}

export function useGetInvestingAccounts() {
  const { userAccounts: accounts } = useUserData();
  return (
    accounts?.filter(
      (acc) =>
        acc.type == AccountType.Investing || acc.type == AccountType.Savings,
    ) ?? []
  );
}
