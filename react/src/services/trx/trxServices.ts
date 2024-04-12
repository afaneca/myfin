import { axios } from '../../data/axios.ts';

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

const removeTransaction = (trxId: number) => {
  return axios.delete<string>(`/trxs`, { data: { transaction_id: trxId } });
};

export default {
  getTransactions,
  removeTransaction,
};
