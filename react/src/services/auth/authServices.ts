import { axios } from '../../data/axios.ts';

export enum AccountStatus {
  Active = 'Ativa',
  Inactive = 'Inativa',
}

export type Account = {
  account_id: bigint;
  name: string;
  type: AccountType;
  description: string;
  exclude_from_budgets: boolean;
  status: AccountStatus;
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
  user_id: bigint;
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

const changePassword = (data: {
  currentPassword: string;
  newPassword1: string;
  newPassword2: string;
}) => {
  return axios.put('/users/changePW', {
    current_password: data.currentPassword,
    new_password: data.newPassword1,
    new_password2: data.newPassword2,
  });
};

export default {
  attemptLogin,
  register,
  validateSession,
  changePassword,
};
