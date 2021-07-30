const dayjs = require('dayjs')
const DateTimeUtils = {
    getCurrentUnixTimestamp:() => {
        return Math.floor(Date.now() / 1000);
    },
}

module.exports = DateTimeUtils