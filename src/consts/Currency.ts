export type Currency = {
  symbol: string;
  code: string;
  name: string;
};

const CURRENCIES: Record<string, Currency> = {
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
  },
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'United States Dollar',
  },
  CHF: {
    symbol: 'CHF',
    code: 'CHF',
    name: 'Schweizer Franken',
  },
  BRL: {
    symbol: 'R$',
    code: 'BRL',
    name: 'Real Brasileiro',
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    name: 'Pound Sterling',
  },
  CAD: {
    symbol: 'C$',
    code: 'CAD',
    name: 'Dollar Canadien',
  },
  MXN: {
    symbol: 'MX$',
    code: 'MXN',
    name: 'Peso Mexicano',
  },
  JPY: {
    symbol: '¥',
    code: 'JPY',
    name: '日本円 (Nihon En)',
  },
  AUD: {
    symbol: 'A$',
    code: 'AUD',
    name: 'Australian Dollar',
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    name: 'भारतीय रुपया (Bhāratīya Rupayā)',
  },
  DKK: {
    symbol: 'kr',
    code: 'DKK',
    name: 'Dansk Krone',
  },
  SEK: {
    symbol: 'kr',
    code: 'SEK',
    name: 'Svensk Krona',
  },
  NOK: {
    symbol: 'kr',
    code: 'NOK',
    name: 'Norsk Krone',
  },
  PLN: {
    symbol: 'zł',
    code: 'PLN',
    name: 'Polski Złoty',
  },
  ISK: {
    symbol: 'kr',
    code: 'ISK',
    name: 'Íslensk Króna',
  },
  CZK: {
    symbol: 'Kč',
    code: 'CZK',
    name: 'Česká Koruna',
  },
  HUF: {
    symbol: 'Ft',
    code: 'HUF',
    name: 'Magyar Forint',
  },
  RON: {
    symbol: 'lei',
    code: 'RON',
    name: 'Leu Românesc',
  },
  CNY: {
    symbol: '¥',
    code: 'CNY',
    name: '人民币 (Chinese Yuan)',
  },
};

export type CurrencyCode = keyof typeof CURRENCIES;

export { CURRENCIES };
