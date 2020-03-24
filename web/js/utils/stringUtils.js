"use strict";

var StringUtils = {
    formatStringtoCurrency: (str) => {
        return parseFloat(str).toFixed(2) + "€"
    },
    normalizeStringForHtml: (str) => {
        return StringUtils.removeLineBreaksFromString(str.replace(/\s/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())
    },
    getAccountTypeName: (tag) => {
        return account_types[tag]
    },
    removeLineBreaksFromString: (ogStr) => {
        return ogStr.replace(/[\r\n]+/gm, "")
    }
}

/* TYPES OF ACCOUNTS:
    - Checking Accounts (CHEAC)
    - Saving Accounts (SAVAC)
    - Investment Accounts (INVAC)
    - Credit Accounts (CREAC)
    - Other Accounts (OTHAC) */
const account_types = {
    "CHEAC": "Conta à Ordem",
    "SAVAC": "Conta Poupança",
    "INVAC": "Investimento",
    "CREAC": "Crédito",
    "OTHAC": "Outra"
}
//# sourceURL=js/utils/stringUtils.js