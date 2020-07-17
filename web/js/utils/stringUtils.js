"use strict";

var StringUtils = {
    formatStringToCurrency: (str) => {
        return parseFloat(str).toFixed(2) + "€"
    },
    normalizeStringForHtml: (str) => {
        return StringUtils.removeLineBreaksFromString(str.replace(/\s/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, " ")
            .replace(/[^\wèéòàáùúìí\s]/gi, '').toLowerCase())
    },
    normalizeString: (str) => {
        return StringUtils.removeLineBreaksFromString(str.replace(/\s/g, ' ').normalize("NFC").replace(/[\u0300-\u036f]/g, " ")
            .replace(/[^\wèéòàáùúìí\s]/gi, '').toLowerCase())
    },
    getAccountTypeName: (tag) => {
        return account_types[tag]
    },
    removeLineBreaksFromString: (ogStr) => {
        return ogStr.replace(/[\r\n]+/gm, "")
    },
    convertStringToFloat: (str) => {
        if (!str) return str
        return parseFloat(str.replace(",", "."))
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