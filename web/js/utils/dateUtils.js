

"use strict";

var DateUtils = {
    /**
     * Returns in DD/MMM/YYYY format (ex: 03/abr/2020)
     */
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
    /**
     * Returns in DD/MM/YYYY format (ex: 03/04/2020)
     */
    convertUnixTimestampToDateFormat: (UNIX_timestamp) => {
        const a = new Date(UNIX_timestamp * 1000);
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const year = a.getFullYear();
        const month = months[a.getMonth()];
        const monthNumber = a.getMonth() - 1;
        const date = a.getDate();
        const hour = a.getHours();
        const min = a.getMinutes();
        const sec = a.getSeconds();


        const formattedDate = `${date}\/${monthNumber + 2}\/${year}`
        
        return formattedDate;
    },
    /* convertDateToUnixTimestamp: (dateStr) => {
        return moment(dateStr, "DD-MM-YYYY").unix()
    }, */
    convertDateToUnixTimestamp: (dateStr, dateFormat = "DD/MM/YYYY") => {
        return moment(dateStr + " 09:00", dateFormat + " HH:mm").unix().valueOf()
    }
}
//# sourceURL=js/utils/stringUtils.js

