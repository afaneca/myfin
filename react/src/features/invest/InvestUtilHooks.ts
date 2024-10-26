import { useTranslation } from 'react-i18next';
import {
  AssetType,
  InvestTransactionType,
} from '../../services/invest/investServices.ts';
import { ColorGradient } from '../../consts';

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

export function useGetGradientColorForAssetType() {
  function invoke(key: AssetType): ColorGradient {
    switch (key) {
      case AssetType.Etf:
        return ColorGradient.BlueColor;
      case AssetType.Crypto:
        return ColorGradient.OrangeColor;
      case AssetType.InvestmentFunds:
        return ColorGradient.TealColor;
      case AssetType.Ppr:
        return ColorGradient.PinkColor;
      case AssetType.FixedIncome:
        return ColorGradient.PaleColor;
      case AssetType.Stocks:
        return ColorGradient.CoralColor;
      case AssetType.IndexFunds:
        return ColorGradient.AquaColor;
      case AssetType.P2pLoans:
        return ColorGradient.GreenColor;
      default:
        return ColorGradient.None;
    }
  }

  return {
    invoke,
  };
}
