import {
  AccountBalance,
  AccountBalanceWallet,
  AccountCircle,
  CreditCard,
  Restaurant,
  Savings,
  TrendingUp,
  Wallet,
} from '@mui/icons-material';
import type { ElementType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import { AccountType } from '../auth/authServices.ts';

const accountIcons: Record<AccountType, ElementType> = {
  [AccountType.Checking]: AccountBalance,
  [AccountType.Savings]: Savings,
  [AccountType.Investing]: TrendingUp,
  [AccountType.Credit]: CreditCard,
  [AccountType.Meal]: Restaurant,
  [AccountType.Wallet]: Wallet,
  [AccountType.Other]: AccountBalanceWallet,
};

type AccountIconProps = SvgIconProps & {
  accountType?: AccountType | null;
};

export const AccountIcon = ({ accountType, ...props }: AccountIconProps) => {
  const Icon = (accountType && accountIcons[accountType]) || AccountCircle;
  return <Icon {...props} />;
};
