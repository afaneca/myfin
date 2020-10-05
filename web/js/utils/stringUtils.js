"use strict";

var StringUtils = {
    formatStringToCurrency: (str) => {
        return parseFloat(str).toFixed(2) + "€"
    },
    formatStringToPercentage: (str) => {
        return parseFloat(str).toFixed(2) + "%"
    },
    escapeHtml: (unsafe) => {
        return StringUtils.removeLineBreaksFromString(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },
    normalizeStringForHtml: (str) => {
        return StringUtils.escapeHtml(StringUtils.removeLineBreaksFromString(str.replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\wèéòàáùúìí\s]/gi, '').toLowerCase()))
    },
    normalizeString: (str) => {
        return StringUtils.escapeHtml(StringUtils.removeLineBreaksFromString(str.replace(/\s/g, ' ').normalize("NFC").replace(/[\u0300-\u036f]/g, " ")
            .replace(/[^\wèéòàáùúìí\s]/gi, '')))
    },
    getAccountTypeName: (tag) => {
        return account_types[tag]
    },
    removeLineBreaksFromString: (ogStr) => {
        return ogStr.replace(/[\r\n]+/gm, "")
    },
    convertStringToFloat: (str) => {
        if (!str) return str
        return parseFloat(str.replace(".", "").replace(",", "."))
    },
    convertFloatToInteger: (floatVal) => {
        return parseInt(floatVal * 100)
    },
    convertIntegerToFloat: (intVal) => {
        return parseFloat(intVal / 100)
    },
}

/* TYPES OF ACCOUNTS:
- Checking Accounts (CHEAC)
- Saving Accounts (SAVAC)
- Investment Accounts (INVAC)
- Credit Accounts (CREAC)
- Meal Accounts (MEALAC)
- WALLETS (WALLET)
- Other Accounts (OTHAC)
*/
const account_types = {
    "CHEAC": "Conta à Ordem",
    "SAVAC": "Conta Poupança",
    "INVAC": "Investimento",
    "CREAC": "Crédito",
    "MEALAC": "Cartão-Refeição",
    "WALLET": "Carteira",
    "OTHAC": "Outra"
}

const account_types_tag = {
    "CHEAC": "CHEAC",
    "SAVAC": "SAVAC",
    "INVAC": "INVAC",
    "CREAC": "CREAC",
    "MEALAC": "MEALAC",
    "WALLET": "WALLET",
    "OTHAC": "OTHAC"
}
//# sourceURL=js/utils/stringUtils.js