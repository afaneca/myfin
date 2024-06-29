import { axios } from '../../data/axios.ts';
import { Account } from '../auth/authServices.ts';

const getAccounts = () => {
  return axios.get<Account[]>(`/accounts`);
};

export default {
  getAccounts,
};
