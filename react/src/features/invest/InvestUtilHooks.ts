import { useTranslation } from 'react-i18next';
import {
  AssetType,
  InvestTransactionType,
} from '../../services/invest/investServices.ts';

export function useGetLocalizedInvestTransactionType() {
  const { t } = useTranslation();

  function invoke(key: InvestTransactionType): string {
    switch (key) {
      case InvestTransactionType.Buy:
        return t('investments.buy');
      case InvestTransactionType.Sell:
        return t('investments.sell');
      default:
        return '';
    }
  }

  return {
    invoke,
  };
}

export function useGetLocalizedAssetType() {
  const { t } = useTranslation();

  function invoke(key: AssetType): string {
    switch (key) {
      case AssetType.Etf:
        return t('investments.etf');
      case AssetType.Crypto:
        return t('investments.crypto');
      case AssetType.InvestmentFunds:
        return t('investments.investmentFunds');
      case AssetType.Ppr:
        return t('investments.ppr');
      case AssetType.FixedIncome:
        return t('investments.fixedIncome');
      case AssetType.Stocks:
        return t('investments.stocks');
      case AssetType.IndexFunds:
        return t('investments.indexFunds');
      case AssetType.P2pLoans:
        return t('investments.p2pLoans');
      default:
        return '';
    }
  }

  return {
    invoke,
  };
}
