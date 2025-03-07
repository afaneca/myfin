import { axios } from '../../data/axios.ts';
import { CurrencyCode } from '../../consts/Currency.ts';

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
  language: string;
  currency: CurrencyCode;
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

export type ValidateSessionDto = {
  isAuthenticated: boolean;
  needsSetup: boolean;
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

const sendRecoveryOtp = (username: string) => {
  return axios.post('/auth/recovery/sendOtp', { username });
};

const setRecoveryNewPassword = (data: {
  username: string;
  otp: string;
  new_password1: string;
  new_password2: string;
}) => {
  return axios.post('/auth/recovery/setNewPassword', data);
};

const initSetup = (data: {
  username: string;
  email: string;
  password: string;
  currency: string;
}) => {
  return axios.post('/setup/init', data);
};

const changeCurrency = (currency: string) => {
  return axios.put('/users/changeCurrency', {
    currency,
  });
};

export default {
  attemptLogin,
  register,
  validateSession,
  changePassword,
  sendRecoveryOtp,
  setRecoveryNewPassword,
  initSetup,
  changeCurrency,
};
