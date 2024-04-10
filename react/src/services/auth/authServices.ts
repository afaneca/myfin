import { axios } from '../../data/axios.ts';

export type Account = {
  account_id: number;
  name: string;
  type: AccountType;
  description: string;
  exclude_from_budgets: boolean;
  status: string;
  color_gradient: string;
  balance: number;
};

export enum AccountType {
  Checking = 'CHEAC',
  Savings = 'SAVAC',
  Investing = 'INVAC',
  Credit = 'CREAC',
  Meal = 'MEALAC',
  Wallet = 'WALLET',
  Other = 'OTHAC',
}

export type UserSession = {
  user_id: number;
  username: string;
  email: string;
  sessionkey: string;
  last_update_timestamp: number;
};

export type AttemptLoginDto = {
  username: string;
  password: string;
};
const attemptLogin = (data: AttemptLoginDto) => {
  return axios.post('/auth', data);
};

export type RegisterDto = {
  email: string;
  username: string;
  password: string;
};

const register = (data: RegisterDto): Promise<string> => {
  return axios.post('/users', data);
};

const validateSession = async (): Promise<boolean> => {
  const resp = await axios.post('/validity');
  return resp.data == '1';
};

export default {
  attemptLogin,
  register,
  validateSession,
};
