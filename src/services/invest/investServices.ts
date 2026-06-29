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
  beginning_value: number;
  contributions: number;
  ending_value: number;
  fees_taxes: number;
  roi_amount: number;
  roi_value: number;
  roi_percentage: number;
  return_metrics: PeriodReturnMetrics;
  total_inflow: number;
  total_net_flows: number;
  total_outflow: number;
  value_total_amount: number;
  withdrawals: number;
};

export type ReturnMetricStatus = 'ok' | 'insufficient_data' | 'no_solution';

export type PeriodReturnMetrics = {
  absolute_return_value: number;
  cash_flows: {
    contributions: number;
    withdrawals: number;
    net: number;
    external_income: number;
    fees_and_costs: number;
  };
  simple_roi: {
    percentage: number | null;
    denominator: number | null;
    status: ReturnMetricStatus;
  };
  portfolio_return: {
    cumulative_percentage: number | null;
    annualized_percentage: number | null;
    method: 'linked_monthly_modified_dietz';
    status: ReturnMetricStatus;
  };
  personal_return: {
    annualized_percentage: number | null;
    method: 'xirr';
    status: ReturnMetricStatus;
  };
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
  return_metrics?: {
    current_year: PeriodReturnMetrics;
    global: PeriodReturnMetrics;
  };
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
  return_metrics: {
    by_year: { [year: string]: PeriodReturnMetrics };
    current_year: PeriodReturnMetrics;
    global: PeriodReturnMetrics;
  };
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

export type AnnualReportWarning = {
  amount?: number;
  asset_id?: number;
  code: string;
  message: string;
  transaction_id?: number;
  units?: number;
};

export type AnnualReportBaseTransaction = {
  date_timestamp: number;
  fees_amount: number;
  fees_units: number;
  note: string;
  total_price: number;
  transaction_id: number;
  units: number;
};

export type AnnualReportFifoMatch = {
  acquisition_cost: number;
  acquisition_fees: number;
  allocated_fees: number;
  buy_transaction: AnnualReportBaseTransaction;
  gain_loss: number;
  matched_units: number;
  proceeds: number;
  sell_fees: number;
};

export type AnnualReportSell = AnnualReportBaseTransaction & {
  fifo_matches: AnnualReportFifoMatch[];
  internal_fee_units: number;
  unmatched_units: number;
};

export type AnnualReportAsset = {
  asset_id: number;
  broker: string;
  buys: AnnualReportBaseTransaction[];
  name: string;
  sells: AnnualReportSell[];
  summary: {
    fees: number;
    internal_fee_units: number;
    realized_gain_loss: number;
    total_invested: number;
    total_withdrawn: number;
  };
  ticker: string;
  type: AssetType;
  warnings: AnnualReportWarning[];
};

export type AnnualInvestmentReport = {
  assets: AnnualReportAsset[];
  generated_at: string;
  summary: {
    annual_roi_percentage: number;
    annual_roi_value: number;
    beginning_value: number;
    ending_value: number;
    fees: number;
    realized_gain_loss: number;
    return_metrics: PeriodReturnMetrics;
    total_invested: number;
    total_withdrawn: number;
  };
  warnings: AnnualReportWarning[];
  year: number;
};

const getAnnualInvestmentReport = (year: number) => {
  return axios.get<AnnualInvestmentReport>(`/invest/reports/annual/${year}`);
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
  getAnnualInvestmentReport,
};
