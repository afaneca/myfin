import { axios } from '../../data/axios.ts';
import { Account } from '../auth/authServices.ts';
import { Category } from '../category/categoryServices.ts';

export type TransactionsPageResponse = {
  filtered_count: number;
  total_count: number;
  results: Array<Transaction>;
};

export type Transaction = {
  transaction_id: bigint;
  account_from_name?: string;
  account_to_name?: string;
  accounts_account_from_id?: bigint;
  accounts_account_to_id?: bigint;
  amount: number;
  categories_category_id?: bigint;
  category_name?: string;
  date_timestamp?: number;
  description?: string;
  entity_id?: bigint;
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
  tag_id: bigint;
  users_user_id: bigint;
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

export type Entity = {
  entity_id: bigint;
  name: string;
  users_user_id: number;
};

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
  entity_id?: bigint;
  account_from_id?: bigint;
  account_to_id?: bigint;
  category_id?: bigint;
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
  new_entity_id?: bigint;
  new_account_from_id?: bigint;
  new_account_to_id?: bigint;
  new_category_id?: bigint;
  new_date_timestamp?: number;
  new_is_essential: boolean;
  transaction_id: bigint;
  tags?: string;
  /* Split trx */
  is_split?: boolean;
  split_amount?: number;
  split_category?: bigint;
  split_entity?: bigint;
  split_type?: TransactionType;
  split_account_from?: bigint;
  split_account_to?: bigint;
  split_description?: string;
  split_is_essential?: boolean;
  split_tags?: string;
};

const editTransaction = (data: EditTransactionRequest): Promise<string> => {
  return axios.put('/trxs', data);
};

const removeTransaction = (trxId: bigint) => {
  return axios.delete<string>(`/trxs`, { data: { transaction_id: trxId } });
};

export type AutoCategorizeTransactionRequest = {
  description: string;
  amount: number;
  type: TransactionType;
  account_from_id: bigint;
  account_to_id: bigint;
};

export type RuleInstructions = {
  matching_rule?: bigint;
  date?: number;
  description?: string;
  amount?: number;
  type?: TransactionType;
  selectedCategoryID?: bigint;
  selectedEntityID?: bigint;
  selectedAccountFromID?: bigint;
  selectedAccountToID?: bigint;
  isEssential?: boolean;
};

const autoCategorizeTrx = (request: AutoCategorizeTransactionRequest) => {
  return axios.post<RuleInstructions>(`/trxs/auto-cat-trx`, request);
};

export type TransactionsInMonthForCategoryRequest = {
  month: number;
  year: number;
  cat_id: bigint;
  type: TransactionType;
};

const getTransactionsForCategoryInMonth = (
  request: TransactionsInMonthForCategoryRequest,
) => {
  return axios.get<Transaction[]>(`/trxs/inMonthAndCategory`, {
    params: request,
  });
};

export default {
  getTransactions,
  removeTransaction,
  addTransactionStep0,
  addTransactionStep1,
  editTransaction,
  autoCategorizeTrx,
  getTransactionsForCategoryInMonth,
};
