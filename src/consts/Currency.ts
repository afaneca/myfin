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
  SGD: {
    symbol: 'S$',
    code: 'SGD',
    name: 'Singapore Dollar',
  },
  MYR: {
    symbol: 'RM',
    code: 'MYR',
    name: 'Ringgit Malaysia',
  },
  IDR: {
    symbol: 'Rp',
    code: 'IDR',
    name: 'Rupiah Indonesia',
  },
  THB: {
    symbol: '฿',
    code: 'THB',
    name: 'บาทไทย (Thai Baht)',
  },
  PHP: {
    symbol: '₱',
    code: 'PHP',
    name: 'Philippine Peso',
  },
  VND: {
    symbol: '₫',
    code: 'VND',
    name: 'Đồng Việt Nam',
  },
  MMK: {
    symbol: 'K',
    code: 'MMK',
    name: 'Myanmar Kyat',
  },
  KHR: {
    symbol: '៛',
    code: 'KHR',
    name: 'Cambodian Riel',
  },
  LAK: {
    symbol: '₭',
    code: 'LAK',
    name: 'Lao Kip',
  },
  BND: {
    symbol: 'B$',
    code: 'BND',
    name: 'Brunei Dollar',
  },
};

export type CurrencyCode = keyof typeof CURRENCIES;

export { CURRENCIES };
