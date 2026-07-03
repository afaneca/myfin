import localStore from '../data/localStore.ts';

export const formatStringAsCurrency = (
  text: string,
  currency: string = localStore.getSessionData().currency ?? 'EUR',
) => {
  return formatNumberAsCurrency(parseFloat(text), currency);
};

export const formatNumberAsCurrency = (
  text: number,
  currency: string = localStore.getSessionData().currency ?? 'EUR',
) => {
  const formatter = Intl.NumberFormat('en', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(text);
};

export const isNumber = (value: unknown) => {
  return typeof value === 'number';
};

export const formatNumberAsPercentage = (
  value: number,
  forceLeadingSign: boolean = false,
) => {
  if (!isNumber(value)) return '';
  return `${forceLeadingSign && value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const addLeadingZero = (num: number, places: number = 2) =>
  String(num).padStart(places, '0');

export const checkIfFieldsAreFilled = (
  fieldsArr: string[],
  emptyStr: string = '',
) => {
  for (const field of fieldsArr) if (!field || field == emptyStr) return false;
  return true;
};

export const convertStringToFloat = (str: string): number => {
  const sanitized = str
    .trim()
    .replace(/\s/g, '')
    .replace(/[^\d,.\-+]/g, '');
  const lastCommaIndex = sanitized.lastIndexOf(',');
  const lastDotIndex = sanitized.lastIndexOf('.');

  if (lastCommaIndex > -1 && lastDotIndex > -1) {
    if (lastCommaIndex > lastDotIndex) {
      return parseFloat(sanitized.replace(/\./g, '').replace(',', '.'));
    }

    return parseFloat(sanitized.replace(/,/g, ''));
  }

  if (lastCommaIndex > -1) {
    return parseFloat(sanitized.replace(/\./g, '').replace(',', '.'));
  }

  return parseFloat(sanitized.replace(/,/g, ''));
};

export default {
  formatStringAsCurrency,
  formatNumberAsCurrency,
  addLeadingZero,
  checkIfFieldsAreFilled,
  convertStringToFloat,
};
