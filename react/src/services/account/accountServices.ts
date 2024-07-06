import { axios } from '../../data/axios.ts';
import { Account } from '../auth/authServices.ts';

const getAccounts = () => {
  return axios.get<Account[]>(`/accounts`);
};

const removeAccount = (id: bigint) => {
  return axios.delete<string>(`/accounts`, { data: { account_id: id } });
};

export default {
  getAccounts,
  removeAccount,
};
