import i18n from '../i18n';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export const getLocalizedDatesObj = () => {
  return {
    months: [
      i18n.t('monthsLong.january'),
      i18n.t('monthsLong.february'),
      i18n.t('monthsLong.march'),
      i18n.t('monthsLong.april'),
      i18n.t('monthsLong.may'),
      i18n.t('monthsLong.june'),
      i18n.t('monthsLong.july'),
      i18n.t('monthsLong.august'),
      i18n.t('monthsLong.september'),
      i18n.t('monthsLong.october'),
      i18n.t('monthsLong.november'),
      i18n.t('monthsLong.december'),
    ],
    monthsShort: [
      i18n.t('monthsShort.jan'),
      i18n.t('monthsShort.feb'),
      i18n.t('monthsShort.mar'),
      i18n.t('monthsShort.apr'),
      i18n.t('monthsShort.may'),
      i18n.t('monthsShort.jun'),
      i18n.t('monthsShort.jul'),
      i18n.t('monthsShort.aug'),
      i18n.t('monthsShort.sep'),
      i18n.t('monthsShort.oct'),
      i18n.t('monthsShort.nov'),
      i18n.t('monthsShort.dec'),
    ],
    weekdays: [
      i18n.t('weekDaysLong.sunday'),
      i18n.t('weekDaysLong.monday'),
      i18n.t('weekDaysLong.tuesday'),
      i18n.t('weekDaysLong.wednesday'),
      i18n.t('weekDaysLong.thursday'),
      i18n.t('weekDaysLong.friday'),
      i18n.t('weekDaysLong.saturday'),
    ],
    weekdaysShort: [
      i18n.t('weekDaysShort.sun'),
      i18n.t('weekDaysShort.mon'),
      i18n.t('weekDaysShort.tue'),
      i18n.t('weekDaysShort.wed'),
      i18n.t('weekDaysShort.thu'),
      i18n.t('weekDaysShort.fri'),
      i18n.t('weekDaysShort.sat'),
    ],
    weekdaysAbbrev: [
      i18n.t('weekDaysAbbrev.sun'),
      i18n.t('weekDaysAbbrev.mon'),
      i18n.t('weekDaysAbbrev.tue'),
      i18n.t('weekDaysAbbrev.wed'),
      i18n.t('weekDaysAbbrev.thu'),
      i18n.t('weekDaysAbbrev.fri'),
      i18n.t('weekDaysAbbrev.sat'),
    ],
  };
};

export const getMonthsFullName = (monthNumber: number) => {
  return getLocalizedDatesObj().months[monthNumber - 1];
};
export const getMonthsShortName = (monthNumber: number) => {
  return getLocalizedDatesObj().monthsShort[monthNumber - 1];
};

export const getDayNumberFromUnixTimestamp = (date_unix: number) => {
  const a = new Date(date_unix * 1000);
  return a.getDate();
};
export const getMonthShortStringFromUnixTimestamp = (date_unix: number) => {
  const a = new Date(date_unix * 1000);
  return getMonthsShortName(a.getMonth() + 1);
};
export const getFullYearFromUnixTimestamp = (date_unix: number) => {
  const a = new Date(date_unix * 1000);
  return a.getFullYear();
};
export const getShortYearFromUnixTimestamp = (date_unix: number) => {
  const a = new Date(date_unix * 1000);
  return a.getFullYear().toString().substring(2);
};
export const isCurrentMonthAndYear = (month: number, year: number) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  return month == currentMonth && year == currentYear;
};

export const convertDateStringToUnixTimestamp = (
  dateStr: string,
  format?: string,
): number => {
  if (!format) {
    const possibleFormats = [
      // Standard numeric formats
      'DD/MM/YYYY',
      'DD/MMM/YYYY',
      'MM/DD/YYYY',
      'YYYY-MM-DD',
      'YYYY/MM/DD',
      'DD-MM-YYYY',
      'MM-DD-YYYY',
      'DD.MM.YYYY',
      'MM.DD.YYYY',
      'YYYY.MM.DD',
      'YYYY MM DD',
      'DD MM YYYY',
      'MM DD YYYY',

      // Short year variations
      'DD/MM/YY',
      'MM/DD/YY',
      'YY-MM-DD',
      'YY/MM/DD',
      'DD-MM-YY',
      'MM-DD-YY',
      'DD.MM.YY',
      'MM.DD.YY',
      'YY.MM.DD',
      'YY MM DD',
      'DD MM YY',
      'MM DD YY',

      // Month name formats (abbreviated)
      'DD-MMM-YY',
      'DD-MMM-YYYY',
      'MMM DD, YYYY',
      'MMM DD YYYY',
      'YYYY-MMM-DD',
      'DD MMM YY',
      'DD MMM YYYY',
      'MMM-DD-YY',
      'MMM-DD-YYYY',

      // Month name formats (full)
      'DD-MMMM-YY',
      'DD-MMMM-YYYY',
      'MMMM DD, YYYY',
      'MMMM DD YYYY',
      'YYYY-MMMM-DD',
      'DD MMMM YY',
      'DD MMMM YYYY',
      'MMMM-DD-YY',
      'MMMM-DD-YYYY',

      // Time variants (24-hour and 12-hour)
      'DD/MM/YYYY HH:mm',
      'MM/DD/YYYY hh:mm A',
      'YYYY-MM-DD HH:mm:ss',
      'YYYY/MM/DD hh:mm A',
      'DD-MMM-YYYY HH:mm:ss',
      'MMM DD, YYYY HH:mm A',
      'DD MMMM YYYY HH:mm:ss',

      // ISO 8601 and common variations
      'YYYY-MM-DDTHH:mm:ssZ',
      'YYYY-MM-DDTHH:mm:ss.SSSZ',
      'YYYY/MM/DD HH:mm:ss',
      'YYYY-MM-DD HH:mm:ss.SSS',
    ];

    // Detect format
    const detectedFormat = possibleFormats.find((f) =>
      dayjs(dateStr, f, true).isValid(),
    );
    if (!detectedFormat) {
      throw new Error(`Could not determine date format for: ${dateStr}`);
    }
    format = detectedFormat;
  }

  // Check if time already exists in format
  const hasTime = /[HhmsA]/.test(format);
  const fullFormat = hasTime ? format : `${format} HH:mm`;

  return dayjs
    .tz(hasTime ? dateStr : `${dateStr} 09:00`, fullFormat, 'UTC')
    .unix();
};

export const convertUnixTimestampToDateString = (
  unixTs: number,
  format: string = 'DD/MM/YYYY',
) => {
  return dayjs.unix(unixTs).utc().format(format);
};

export const convertUnixTimestampToDayJs = (unixTs: number | undefined) => {
  if (!unixTs) return dayjs();
  return dayjs.unix(unixTs).utc();
};

export const convertDayJsToUnixTimestamp = (dayJs: Dayjs) => {
  return dayJs.unix();
};

export const getCurrentYear = () => {
  return new Date().getFullYear();
};

export const getCurrentMonth = () => {
  return new Date().getMonth() + 1;
};
