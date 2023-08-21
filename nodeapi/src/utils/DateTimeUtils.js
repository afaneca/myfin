/* const dayjs = require('dayjs'); */

const DateTimeUtils = {
  getCurrentUnixTimestamp: () => parseInt(Math.floor(Date.now() / 1000), 10),
  sleep: (milliseconds) => new Promise(
    (resolve) => setTimeout(resolve, milliseconds)),
  getMonthNumberFromTimestamp: (unixTimestamp = DateTimeUtils.getCurrentUnixTimestamp()) => {
    const date = new Date(unixTimestamp * 1000);
    return date.getMonth() + 1;
  },
  getYearFromTimestamp: (unixTimestamp = DateTimeUtils.getCurrentUnixTimestamp()) => {
    const date = new Date(unixTimestamp * 1000);
    return date.getFullYear();
  },
  getUnixTimestampFromDate: (dateObj) => dateObj.getTime() / 1000,
  monthIsEqualOrPriorTo: (month1, year1, month2, year2) => (year2 > year1 ||
    (year1 == year2 && month2 >= month1))
};

export default DateTimeUtils;
