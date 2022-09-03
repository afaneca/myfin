export const StringUtils = {
  formatStringToCurrency: (str) => {
    return parseFloat(str)
      .toFixed(2) + '€';
  },
  formatStringToPercentage: (str) => {
    return parseFloat(str)
      .toFixed(2) + '%';
  },
  escapeHtml: (unsafe) => {
    return StringUtils.removeLineBreaksFromString(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  normalizeStringForHtml: (str) => {
    return StringUtils.escapeHtml(StringUtils.removeLineBreaksFromString(str.replace(/\s/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\wèéòàáùúìí\s]/gi, '')
      .toLowerCase()));
  },
  normalizeString: (str) => {
    return StringUtils.escapeHtml(StringUtils.removeLineBreaksFromString(str.replace(/\s/g, ' ')
      .normalize('NFC')
      .replace(/[\u0300-\u036f]/g, ' ')
      .replace(/[^\wèéòàáùúìí\s]/gi, '')));
  },
  getAccountTypeName: (tag) => {
    return account_types[tag];
  },
  removeLineBreaksFromString: (ogStr) => {
    return (ogStr == null) ? '' : ogStr.replace(/[\r\n]+/gm, '');
  },
  convertStringToFloat: (str) => {
    if (!str) return str;
    if (str.includes(',')) {
      // It's a PT-pt currency format
      return parseFloat(str.replace('.', '')
        .replace(',', '.'));
    } else {
      return parseFloat(str);
    }

  },
  convertFloatToInteger: (floatVal) => {
    return parseInt(floatVal * 100);
  },
  convertIntegerToFloat: (intVal) => {
    return parseFloat(intVal / 100);
  },
  formatSignedMoney: (amount, decimalCount = 2, decimal = '.', thousands = ',', currency = '€') => {
    return StringUtils.formatMoney(amount, decimalCount, decimal, thousands, currency, true);
  },
  formatMoney: (amount, decimalCount = 2, decimal = '.', thousands = ',', currency = '€', forceSign = false) => {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? '-' : (forceSign ? '+' : '');

      let i = parseInt(amount = Math.abs(Number(amount) || 0)
        .toFixed(decimalCount))
        .toString();
      let j = (i.length > 3) ? i.length % 3 : 0;

      return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j)
        .replace(/(\d{3})(?=\d)/g, '$1' + thousands) + (decimalCount ? decimal + Math.abs(amount - i)
        .toFixed(decimalCount)
        .slice(2) : '') + '' + currency;
    } catch (e) {
      console.log(e);
      return StringUtils.formatMoney('0', decimalCount, decimal, thousands, currency);
    }
  },
  getInvestingAssetObjectById: id => {
    return Object.values(MYFIN.INVEST_ASSETS_TYPES)
      .find(asset => asset.id === id);
  },
  getInvestingTransactionsTypeObjectById: id => {
    return Object.values(MYFIN.INVEST_TRX_TYPES)
      .find(type => type.id === id);
  },
};

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
  'OTHAC': 'Outra'
};

export const account_types_tag = {
  'CHEAC': 'CHEAC',
  'SAVAC': 'SAVAC',
  'INVAC': 'INVAC',
  'CREAC': 'CREAC',
  'MEALAC': 'MEALAC',
  'WALLET': 'WALLET',
  'OTHAC': 'OTHAC'
};
//# sourceURL=js/utils/stringUtils.js
