/* const dayjs = require('dayjs'); */

const DateTimeUtils = {
  getCurrentUnixTimestamp: () => parseInt(Math.floor(Date.now() / 1000), 10),
  sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  getMonthNumberFromTimestamp: (unixTimestamp = DateTimeUtils.getCurrentUnixTimestamp()) => {
    const date = new Date(unixTimestamp * 1000);
    return date.getMonth() + 1;
  },
  getYearFromTimestamp: (unixTimestamp = DateTimeUtils.getCurrentUnixTimestamp()) => {
    const date = new Date(unixTimestamp * 1000);
    return date.getFullYear();
  },
  getUnixTimestampFromDate: (dateObj) => dateObj.getTime() / 1000,
  monthIsEqualOrPriorTo: (month1, year1, month2, year2) =>
    year2 > year1 || (year1 == year2 && month2 >= month1),
  incrementMonthByX: (month, year, x) => {
    return {
      month: ((month - 1 + x) % 12) + 1,
      year: month + x > 12 ? year + 1 : year,
    };
  },
  decrementMonthByX: (month, year, x) => {
    const futureDate = new Date(year, month - 1 - x, 1);
    return {
      month: futureDate.getMonth() + 1,
      year: futureDate.getFullYear(),
    }
  },
};

export default DateTimeUtils;
