import { PickerUtils } from "./pickerUtils.js";

export const DateUtils = {
  getMonthsShort: () => PickerUtils.getDatePickerDefault18nStrings().monthsShort,
  getMonthsFull: () => PickerUtils.getDatePickerDefault18nStrings().months,
  /**
   * Returns in DD/MMM/YYYY format (ex: 03/abr/2020)
   */
  convertUnixTimestampToDateString: (UNIX_timestamp) => {
    const a = new Date(UNIX_timestamp * 1000)
    const year = a.getFullYear()
    const month = DateUtils.getMonthsShort()[a.getMonth()]
    const monthNumber = a.getMonth() - 1
    const date = a.getDate()
    const hour = a.getHours()
    const min = a.getMinutes()
    const sec = a.getSeconds()

    const formattedDate = `${date}\/${month}\/${year}`
    return formattedDate
  },
  /**
   * Returns in MM/DD/YYYY format (ex: 04/03/2020)
   */
  convertUnixTimestampToDateFormat: (UNIX_timestamp) => {
    const a = new Date(UNIX_timestamp * 1000)
    const year = a.getFullYear()
    const month = DateUtils.getMonthsShort()[a.getMonth()]
    const monthNumber = a.getMonth() - 1
    const date = a.getDate()
    const hour = a.getHours()
    const min = a.getMinutes()
    const sec = a.getSeconds()

    const formattedDate = `${monthNumber + 2}\/${date}\/${year}`

    return formattedDate
  },
  /**
   * Returns in DD/MM/YYYY format (ex: 03/04/2020)
   */
  convertUnixTimestampToEuropeanDateFormat: (UNIX_timestamp) => {
    const a = new Date(UNIX_timestamp * 1000)
    const year = a.getFullYear()
    const month = DateUtils.getMonthsShort()[a.getMonth()]
    const monthNumber = a.getMonth() - 1
    const date = a.getDate()
    const hour = a.getHours()
    const min = a.getMinutes()
    const sec = a.getSeconds()

    // const formattedDate = `${(date < 9) ? ('0' + date) : (date)}\/${((monthNumber + 2) < 9) ? ('0' + (monthNumber + 2)) : ((monthNumber +
    // 2))}\/${year}`
    const formattedDate = `${date}\/${monthNumber + 2}\/${year}`

    return formattedDate
  },
  /**
   * Returns in DD/MM/YYYY HH:MM:SS format (ex: 03/04/2020 03:42:19)
   */
  convertUnixTimestampToEuropeanDateTimeFormat: (UNIX_timestamp) => {
    const a = new Date(UNIX_timestamp * 1000)
    return a.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(',', '')
  },
  /* convertDateToUnixTimestamp: (dateStr) => {
      return moment(dateStr, "DD-MM-YYYY").unix()
  }, */
  convertDateToUnixTimestamp: (dateStr, dateFormat = 'DD/MM/YYYY') => {
    return moment(dateStr + ' 09:00', dateFormat + ' HH:mm').tz('UTC').unix().valueOf()
  },
  getMonthsFullName: (monthNumber) => {
    return DateUtils.getMonthsFull()[monthNumber - 1]
  },
  getMonthsShortName: (monthNumber) => {
    return DateUtils.getMonthsShort()[monthNumber - 1]
  },
  getCurrentMonth: () => {
    const a = new Date()
    return a.getMonth() + 1
  },
  getCurrentYear: () => {
    const a = new Date()
    return a.getFullYear()
  },
  getDayNumberFromUnixTimestamp: (date_unix) => {
    const a = new Date(date_unix * 1000)
    return a.getDate()
  },
  getMonthShortStringFromUnixTimestamp: (date_unix) => {
    const a = new Date(date_unix * 1000)
    return DateUtils.getMonthsShortName(a.getMonth() + 1)
  },
  getFullYearFromUnixTimestamp: (date_unix) => {
    const a = new Date(date_unix * 1000)
    return a.getFullYear()
  },
  getShortYearFromUnixTimestamp: (date_unix) => {
    const a = new Date(date_unix * 1000)
    return a.getFullYear().toString().substring(2)
  },
  isCurrentMonthAndYear: (month, year) => {
    const currentMonth = moment().month() + 1;
    const currentYear = moment().year();
    return (month == currentMonth && year ==
        currentYear);
  }
}
//# sourceURL=js/utils/stringUtils.js

