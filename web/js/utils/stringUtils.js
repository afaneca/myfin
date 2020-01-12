"use strict";

var StringUtils = {
    formatStringtoCurrency: (str) => {
        return parseFloat(str).toFixed(2) + "€"
    },
    normalizeStringForHtml: (str) => {
        return str.replace(/\s/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    }
}

//# sourceURL=js/utils/stringUtils.js