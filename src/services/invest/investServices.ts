import { axios } from '../../data/axios.ts';

export enum AssetType {
  FixedIncome = 'fixed',
  Crypto = 'crypto',
  Etf = 'etf',
  Ppr = 'ppr',
  IndexFunds = 'index',
  InvestmentFunds = 'if',
  P2pLoans = 'p2p',
  Stocks = 'stock',
}

export type YearlyRoi = {
  fees_taxes: number;
  total_inflow: number;
  total_outflow: number;
  ending_value: number;
  roi_amount: number;
  roi_value: number;
  roi_percentage: number;
  total_net_flows: number;
};

export type MonthlySnapshot = {
  asset_broker: string;
  asset_id: bigint;
  asset_name: string;
  asset_ticker: string;
  current_value: number;
  invested_amount: number;
  month: number;
  units: number;
  year: number;
};

export type InvestAsset = {
  absolute_roi_value: number;
  asset_id: bigint;
  broker: string;
  current_value: number;
  currently_invested_value: number;
  fees_taxes: number;
  fees_taxes_amount: number;
  fees_taxes_units: number;
  invested_value: number;
  name: string;
  price_per_unit: string;
  relative_roi_percentage: number | string;
  ticker: string;
  type: AssetType;
  units: number;
  withdrawn_amount: number;
};

export type AssetDistributionItem = {
  type: AssetType;
  value: number;
  percentage: number;
};

export type GetInvestStatsResponse = {
  combined_roi_by_year: { [year: string]: YearlyRoi };
  current_value_distribution: AssetDistributionItem[];
  current_year_roi_percentage: number;
  current_year_roi_value: number;
  current_year_annualized_roi_percentage: number;
  global_roi_percentage: number;
  global_roi_value: number;
  monthly_snapshots: MonthlySnapshot[];
  top_performing_assets: InvestAsset[];
  total_current_value: number;
  total_currently_invested_value: number;
};

const getInvestStats = () => {
  return axios.get<GetInvestStatsResponse>(`/invest/assets/stats`);
};

const getAssets = () => {
  return axios.get<InvestAsset[]>(`/invest/assets`);
};

const removeAsset = (assetId: bigint) => {
  return axios.delete<string>(`invest/assets/${assetId}`);
};

const updateAssetValue = (
  assetId: bigint,
  newValue: number,
  month?: number,
  year?: number,
) => {
  return axios.put<string>(`invest/assets/${assetId}/value`, {
    new_value: newValue,
    month: month,
    year: year,
  });
};

export type AddAssetRequest = {
  name: string;
  type: AssetType;
  ticker: string;
  broker: string;
};

const addAsset = (request: AddAssetRequest) => {
  return axios.post<string>(`invest/assets`, request);
};

export type EditAssetRequest = AddAssetRequest & {
  asset_id: bigint;
};

const editAsset = (request: EditAssetRequest) => {
  return axios.put<string>(`invest/assets/${request.asset_id}`, {
    name: request.name,
    type: request.type,
    ticker: request.ticker,
    broker: request.broker,
  });
};

export enum InvestTransactionType {
  Buy = 'B',
  Sell = 'S',
  Income = 'I',
  Cost = 'C',
}

export type InvestTransaction = {
  transaction_id: bigint;
  asset_id: bigint;
  asset_type: AssetType;
  broker: string;
  date_timestamp: number;
  fees_taxes_amount: number;
  fees_taxes_units: number;
  name: string;
  note: string;
  ticker: string;
  total_price: number;
  trx_type: InvestTransactionType;
  units: number;
};

export type InvestTransactionsPageResponse = {
  filtered_count: number;
  total_count: number;
  results: Array<InvestTransaction>;
};

const getTransactions = (page: number, page_size?: number, query?: string) => {
  return axios.get<InvestTransactionsPageResponse>(
    `/invest/trx/filteredByPage/${page}`,
    {
      params: {
        page_size,
        query,
      },
    },
  );
};

export type AddInvestTransactionRequest = {
  date_timestamp: number;
  note?: string;
  total_price: number;
  units: number;
  fees_amount: number;
  fees_units: number;
  asset_id: bigint;
  type: InvestTransactionType;
};

const addTransaction = (request: AddInvestTransactionRequest) => {
  return axios.post<string>(`/invest/trx`, request);
};

export type EditInvestTransactionRequest = {
  date_timestamp: number;
  note?: string;
  total_price: number;
  units: number;
  fees_amount: number;
  fees_units: number;
  asset_id: bigint;
  type: InvestTransactionType;
};

const editTransaction = (
  trxId: bigint,
  request: EditInvestTransactionRequest,
) => {
  return axios.put<string>(`/invest/trx/${trxId}`, request);
};

const removeTransaction = (trxId: bigint) => {
  return axios.delete<string>(`/invest/trx/${trxId}`);
};

export type AssetSummary = {
  asset_id: bigint;
  name: string;
  ticker: string;
  type: AssetType;
};

const getAssetsSummary = () => {
  return axios.get<AssetSummary[]>(`/invest/assets/summary`);
};

export default {
  getInvestStats,
  getAssets,
  removeAsset,
  updateAssetValue,
  addAsset,
  editAsset,
  getTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
  getAssetsSummary,
};
