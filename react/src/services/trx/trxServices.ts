import { axios } from '../../data/axios.ts';
import { Status } from '../stats/statServices.ts';
import { Account } from '../auth/authServices.ts';

export type TransactionsPageResponse = {
  filtered_count: number;
  total_count: number;
  results: Array<Transaction>;
};

export type Transaction = {
  transaction_id: number;
  account_from_name?: string;
  account_to_name?: string;
  accounts_account_from_id?: number;
  accounts_account_to_id?: number;
  amount: number;
  categories_category_id?: number;
  category_name?: string;
  date_timestamp?: number;
  description?: string;
  entity_id?: number;
  entity_name?: string;
  is_essential: 0 | 1;
  tag_names?: Array<string>;
  tags?: Array<Tag>;
};

export enum TransactionType {
  Income = 'I',
  Expense = 'E',
  Transfer = 'T',
}

export type Tag = {
  tag_id: number;
  users_user_id: number;
  name: string;
  description?: string;
};

const getTransactions = (page: number, page_size?: number, query?: string) => {
  return axios.get<TransactionsPageResponse>(`/trxs/filteredByPage/${page}`, {
    params: {
      page_size,
      query,
    },
  });
};

export interface Category {
  users_user_id?: number;
  category_id?: number;
  name?: string;
  status?: Status;
  type?: string;
  description?: string;
  color_gradient?: null | string;
  exclude_from_budgets: boolean;
}

export interface Entity {
  entity_id: number;
  name: string;
  users_user_id: number;
}

export type TransactionStep0Response = {
  accounts: Account[];
  categories: Category[];
  entities: Entity[];
  tags: Tag[];
};

const addTransactionStep0 = () => {
  return axios.post<TransactionStep0Response>('/trxs/step0');
};

export type AddTransactionRequest = {
  amount: number;
  type: TransactionType;
  description?: string;
  entity_id?: number;
  account_from_id?: number;
  account_to_id?: number;
  category_id?: number;
  date_timestamp?: number;
  is_essential: boolean;
  tags?: string;
};

const addTransactionStep1 = (data: AddTransactionRequest): Promise<string> => {
  return axios.post('/trxs/step1', data);
};

export type EditTransactionRequest = {
  new_amount: number;
  new_type: TransactionType;
  new_description?: string;
  new_entity_id?: number;
  new_account_from_id?: number;
  new_account_to_id?: number;
  new_category_id?: number;
  new_date_timestamp?: number;
  new_is_essential: boolean;
  transaction_id: number;
  tags?: string;
  /* Split trx */
  is_split?: boolean;
  split_amount?: number;
  split_category?: number;
  split_entity?: number;
  split_type?: TransactionType;
  split_account_from?: number;
  split_account_to?: number;
  split_description?: string;
  split_is_essential?: boolean;
  split_tags?: string;
};

const editTransaction = (data: EditTransactionRequest): Promise<string> => {
  return axios.put('/trxs', data);
};

const removeTransaction = (trxId: number) => {
  return axios.delete<string>(`/trxs`, { data: { transaction_id: trxId } });
};

export default {
  getTransactions,
  removeTransaction,
  addTransactionStep0,
  addTransactionStep1,
  editTransaction,
};
