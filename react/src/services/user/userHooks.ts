import localStore from '../../data/localStore.ts';
import { AccountType, Account } from '../auth/authServices.ts';

export function useGetTopSummaryValues() {
  const accounts = localStore.getUserAccounts();
  const operatingFundsSum = accounts.reduce((result, current) => {
    if (
      current.type == AccountType.Checking ||
      current.type == AccountType.Savings ||
      current.type == AccountType.Meal ||
      current.type == AccountType.Wallet
    ) {
      return result + current.balance;
    }

    return result;
  }, 0);
  const investingSum = accounts.reduce((result, current) => {
    if (current.type == AccountType.Investing) {
      return result + current.balance;
    }

    return result;
  }, 0);
  const debtSum = accounts.reduce((result, current) => {
    if (current.type == AccountType.Credit) {
      return result + current.balance;
    }
    return result;
  }, 0);
  const netWorthsum = accounts.reduce((result, current) => {
    return result + current.balance;
  }, 0);

  return { operatingFundsSum, investingSum, debtSum, netWorthsum };

  return;
}
