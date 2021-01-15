const TimeUtils = {
    getCurrentUnixTimestamp:() => {
        return Math.floor(Date.now() / 1000);
    }
}

module.exports = TimeUtils