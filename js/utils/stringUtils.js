import { Localization } from "./localization.js";

export const StringUtils = {
  formatStringToCurrency: (str) => {
    return parseFloat(str).toFixed(2) + '€'
  },
  formatStringToPercentage: (str) => {
    return parseFloat(str).toFixed(2) + '%'
  },
  escapeHtml: (unsafe) => {
    return StringUtils.removeLineBreaksFromString(unsafe).
      replace(/&/g, '&amp;').
      replace(/</g, '&lt;').
      replace(/>/g, '&gt;').
      replace(/"/g, '&quot;').
      replace(/'/g, '&#039;')
  },
  normalizeStringForHtml: (str) => {
    return StringUtils.escapeHtml(StringUtils.removeLineBreaksFromString(
      str.replace(/\s/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\wèéòàáùúìí\s]/gi, '').toLowerCase()))
  },
  normalizeString: (str) => {
    return StringUtils.escapeHtml(StringUtils.removeLineBreaksFromString(
      str.replace(/\s/g, ' ').normalize('NFC').replace(/[\u0300-\u036f]/g, ' ').replace(/[^\wèéòàáùúìí\s]/gi, '')))
  },
  getAccountTypeName: (tag) => {
    return Localization.getString(`accounts.${tag.toLowerCase()}`)
  },
  removeLineBreaksFromString: (ogStr) => {
    return (ogStr == null) ? '' : ogStr.replace(/[\r\n]+/gm, '')
  },
  convertStringToFloat: (str) => {
    if (!str) {
      return str
    }
    if (str.includes(',')) {
      // It's a PT-pt currency format
      return parseFloat(str.replace('.', '').replace(',', '.'))
    }
    else {
      return parseFloat(str)
    }

  },
  convertFloatToInteger: (floatVal) => {
    return parseInt(floatVal * 100)
  },
  convertIntegerToFloat: (intVal) => {
    return parseFloat(intVal / 100)
  },
  formatSignedMoney: (amount, decimalCount = 2, decimal = '.', thousands = ',', currency = '€') => {
    return StringUtils.formatMoney(amount, decimalCount, decimal, thousands, currency, true)
  },
  formatMoney: (amount, decimalCount = 2, decimal = '.', thousands = ',', currency = '€', forceSign = false) => {
    try {
      decimalCount = Math.abs(decimalCount)
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount

      const negativeSign = amount < 0 ? '-' : (forceSign ? '+' : '')

      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString()
      let j = (i.length > 3) ? i.length % 3 : 0

      return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
        (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : '') + '' + currency
    }
    catch (e) {
      return StringUtils.formatMoney('0', decimalCount, decimal, thousands, currency)
    }
  },
  getInvestingAssetObjectById: id => {
    let asset = Object.values(MYFIN.INVEST_ASSETS_TYPES).find(asset => asset.id === id)
    asset.name = StringUtils.localizeAssetTypeName(asset.id)
    return asset
  },
  localizeAssetTypeName: type => {
    switch (type) {
      case MYFIN.INVEST_ASSETS_TYPES.STOCKS.id:
        return Localization.getString('investments.stocks')
      case MYFIN.INVEST_ASSETS_TYPES.P2P_LOANS.id:
        return Localization.getString('investments.p2pLoans')
      case MYFIN.INVEST_ASSETS_TYPES.PPR.id:
        return Localization.getString('investments.ppr')
      case MYFIN.INVEST_ASSETS_TYPES.ETF.id:
        return Localization.getString('investments.etf')
      case MYFIN.INVEST_ASSETS_TYPES.CRYPTO.id:
        return Localization.getString('investments.crypto')
      case MYFIN.INVEST_ASSETS_TYPES.INVESTMENT_FUNDS.id:
        return Localization.getString('investments.investmentFunds')
      case MYFIN.INVEST_ASSETS_TYPES.INDEX_FUNDS.id:
        return Localization.getString('investments.indexFunds')
      case MYFIN.INVEST_ASSETS_TYPES.FIXED_INCOME.id:
        return Localization.getString('investments.fixedIncome')
      default:
        return Localization.getString('investments.fixedIncome')
    }
  },
  getInvestingTransactionsTypeObjectById: id => {
    let trxType = Object.values(MYFIN.INVEST_TRX_TYPES).find(type => type.id === id)
    trxType.name = StringUtils.getLocalizedTransactionType(trxType.id)
    return trxType
  },
  getLocalizedTransactionType: type => {
    switch (type) {
      case MYFIN.INVEST_TRX_TYPES.BUY.id:
        return Localization.getString('investments.buy')
      case MYFIN.INVEST_TRX_TYPES.SELL.id:
        return Localization.getString('investments.sell')
      default:
        return Localization.getString('investments.sell')
    }
  },
  parseStringToBoolean: str => {
    return str === 'true'
  },
}

/* TYPES OF ACCOUNTS:
- Checking Accounts (CHEAC)
- Saving Accounts (SAVAC)
- Investment Accounts (INVAC)
- Credit Accounts (CREAC)
- Meal Accounts (MEALAC)
- WALLETS (WALLET)
- Other Accounts (OTHAC)
*/
export const account_types = {
  'CHEAC': 'Conta à Ordem',
  'SAVAC': 'Conta Poupança',
  'INVAC': 'Investimento',
  'CREAC': 'Crédito',
  'MEALAC': 'Cartão-Refeição',
  'WALLET': 'Carteira',
  'OTHAC': 'Outra',
}

export const account_types_tag = {
  'CHEAC': 'CHEAC',
  'SAVAC': 'SAVAC',
  'INVAC': 'INVAC',
  'CREAC': 'CREAC',
  'MEALAC': 'MEALAC',
  'WALLET': 'WALLET',
  'OTHAC': 'OTHAC',
}
//# sourceURL=js/utils/stringUtils.js
