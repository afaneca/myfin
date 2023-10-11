const HTTP_STATUS_CODE = {
  HTTP_STATUS_CODE_OK: 200,
  HTTP_STATUS_CODE_CREATED: 201,
  HTTP_STATUS_CODE_BAD_REQUEST: 400,
  HTTP_STATUS_CODE_UNAUTHORIZED: 401,
  HTTP_STATUS_CODE_FORBIDDEN: 403,
  HTTP_STATUS_CODE_NOT_FOUND: 404,
  HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR: 500,
  HTTP_STATUS_CODE_NOT_IMPLEMENTED: 501,
};
const MYFIN = {
  DEFAULT_TRANSACTIONS_FETCH_LIMIT: 99999,
  TABLE_USERS: 'users',
  TABLE_USER_NOTES_JOIN: 'user_has_notes',
  TABLE_NOTES: 'note',
  TABLE_CATEGORIES: 'category',
  TABLE_NOTE_CATEGORIES_JOIN: 'note_has_categories',
  TRX_TYPES: {
    INCOME: 'I',
    EXPENSE: 'E',
    TRANSFER: 'T',
  },
  ACCOUNT_STATUS: {
    ACTIVE: 'Ativa',
    INACTIVE: 'Inativa',
  },
  ACCOUNT_TYPES: {
    CHECKING: 'CHEAC',
    SAVINGS: 'SAVAC',
    INVESTING: 'INVAC',
    CREDIT: 'CREAC',
    MEAL: 'MEALAC',
    WALLET: 'WALLET',
    OTHER: 'OTHAC',
  },
  CATEGORY_STATUS: {
    ACTIVE: 'Ativa',
    INACTIVE: 'Inativa',
  },
  TRX_TYPE_LABEL: {
    DEBIT: 'Débito',
    CREDIT: 'Crédito',
  },
  RULES: {
    MATCHING: {
      IGNORE: 'RULES_MATCHING_IGNORE',
    },
    OPERATOR: {
      IGNORE: 'IG',
      EQUALS: 'EQ',
      NOT_EQUALS: 'NEQ',
      CONTAINS: 'CONTAINS',
      NOT_CONTAINS: 'NOTCONTAINS',
    },
  },
  INVEST: {
    TRX_TYPE: {
      BUY: 'B',
      SELL: 'S',
    },
    ASSET_TYPE: {
      PPR: 'ppr',
      ETF: 'etf',
      CRYPTO: 'crypto',
      FIXED_INCOME: 'fixed',
      INDEX_FUNDS: 'index',
      INVESTMENT_FUNDS: 'if',
      P2P: 'p2p',
      STOCKS: 'stocks',
    }
  },
};

export { HTTP_STATUS_CODE, MYFIN };
