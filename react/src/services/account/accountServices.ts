import { axios } from '../../data/axios.ts';
import { Account, AccountStatus, AccountType } from '../auth/authServices.ts';
import { ColorGradient } from '../../consts';

const getAccounts = () => {
  return axios.get<Account[]>(`/accounts`);
};

const removeAccount = (id: bigint) => {
  return axios.delete<string>(`/accounts`, { data: { account_id: id } });
};

export type AddAccountRequest = {
  name: string;
  type: AccountType;
  description?: string;
  status: AccountStatus;
  exclude_from_budgets: boolean;
  current_balance?: number;
  color_gradient: ColorGradient;
};

const addAccount = (request: AddAccountRequest) => {
  return axios.post('/accounts', { current_balance: 0, ...request });
};

export type EditAccountRequest = {
  account_id: bigint;
  new_name: string;
  new_type: AccountType;
  new_description?: string;
  new_status: AccountStatus;
  exclude_from_budgets: boolean;
  current_balance?: number;
  color_gradient: ColorGradient;
};

const editAccount = (request: EditAccountRequest) => {
  return axios.put('/accounts', { current_balance: 0, ...request });
};

const recalculateAllBalances = () => {
  return axios.get('/accounts/recalculate-balance/all');
};

const autoPopulateWithDemoData = () => {
  return axios.post('/users/demo');
};

export default {
  getAccounts,
  removeAccount,
  addAccount,
  editAccount,
  recalculateAllBalances,
  autoPopulateWithDemoData,
};
