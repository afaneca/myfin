function RemoveLastDirectoryPartOf (the_url) {
  var the_arr = the_url.split('/')
  the_arr.pop()
  return the_arr.join('/')
}

var MYFIN = {
  APP_VERSION: '6.0.1',
  TRX_TYPES: {
    INCOME: 'I',
    EXPENSE: 'E',
    TRANSFER: 'T',
  },
  TRX_STATUS: {
    ACTIVE: 'Ativa',
    INACTIVE: 'Inativa',
  },
  CATEGORY_STATUS: {
    ACTIVE: 'Ativa',
    INACTIVE: 'Inativa',
  },
  TRX_TYPE_LABEL: {
    DEBIT: 'Débito',
    CREDIT: 'Crédito',
  },
  RULES_OPERATOR: {
    DEFAULT_RULES_OPERATOR_IGNORE: 'IG',
    DEFAULT_RULES_OPERATOR_EQUALS: 'EQ',
    DEFAULT_RULES_OPERATOR_NOT_EQUALS: 'NEQ',
    DEFAULT_RULES_OPERATOR_CONTAINS: 'CONTAINS',
    DEFAULT_RULES_OPERATOR_NOT_CONTAINS: 'NOTCONTAINS',
  },
  APP_THEMES_CSS_PATH: {
    DARK_BLUE: './css/main.css',
    DARK_GRAY: './css/themes/dark_gray_theme.css',
    LIGHT: './css/themes/light_theme.css',
    SOLARIZED_GREEN: './css/themes/solarized_green_theme.css',
    MAUVE_THEME: './css/themes/mauve_theme.css',
    NORD_NIGHTFALL: './css/themes/nord_nightfall_theme.css',
  },
  APP_THEMES: {
    DARK_BLUE: 'DARK_BLUE',
    DARK_GRAY: 'DARK_GRAY',
    LIGHT: 'LIGHT',
    SOLARIZED_GREEN: 'SOLARIZED_GREEN',
    MAUVE_THEME: 'MAUVE_THEME',
    NORD_NIGHTFALL: 'NORD_NIGHTFALL',
  },
  TRX_FETCH_LIMIT: 50,
  BUDGETS_FETCH_LIMIT: 15,
  INVEST_ASSETS_TYPES: {
    PPR: {
      id: 'ppr',
      name: 'PPR',
    },
    ETF: {
      id: 'etf',
      name: 'ETF',
    },
    CRYPTO: {
      id: 'crypto',
      name: 'Crypto',
    },
    FIXED_INCOME: {
      id: 'fixed',
      name: 'Renda Fixa',
    },
    INDEX_FUNDS: {
      id: 'index',
      name: 'Fundos de Índice',
    },
    INVESTMENT_FUNDS: {
      id: 'if',
      name: 'Fundos de Investimento',
    },
    P2P_LOANS: {
      id: 'p2p',
      name: 'P2P',
    },
    STOCKS: {
      id: 'stock',
      name: 'Stocks',
    },
  },
  INVEST_TRX_TYPES: {
    BUY: {
      id: 'B',
      name: 'Compra',
    },
    SELL: {
      id: 'S',
      name: 'Venda',
    },
  },
  LOCALES: {
    PT: {
      code: 'pt',
      name: 'Português (pt-PT)',
    },
    EN: {
      code: 'en',
      name: 'English',
    },
  },
  DEFAULT_LOCALE_CODE: 'en',
}

var FRONT_SERVER_PATH =
  window.location.protocol +
  '//' +
  window.location.hostname +
  window.location.pathname
//var REST_SERVER_PATH = RemoveLastDirectoryPartOf(RemoveLastDirectoryPartOf(FRONT_SERVER_PATH)) + "/api/index.php/"
var REST_SERVER_PATH = "http://localhost:3001/";


//# sourceURL=consts.js
