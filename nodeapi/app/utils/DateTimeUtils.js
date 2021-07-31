/* const dayjs = require('dayjs'); */

const DateTimeUtils = {
  getCurrentUnixTimestamp: () => Math.floor(Date.now() / 1000),
  sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
};

export default DateTimeUtils;
