

"use strict";

var DateUtils = {
    convertUnixTimestampToDateString: (UNIX_timestamp) => {
        const a = new Date(UNIX_timestamp * 1000);
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const year = a.getFullYear();
        const month = months[a.getMonth()];
        const monthNumber = a.getMonth() - 1;
        const date = a.getDate();
        const hour = a.getHours();
        const min = a.getMinutes();
        const sec = a.getSeconds();


        const formattedDate = `${date}\/${month}\/${year}`
        return formattedDate;
    },
    convertDateToUnixTimestamp: (dateStr) => {
        return moment(dateStr, "DD-MM-YYYY").unix()
    }
}
//# sourceURL=js/utils/stringUtils.js

