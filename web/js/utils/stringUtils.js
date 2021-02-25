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
        return (ogStr == null) ? "" : ogStr.replace(/[\r\n]+/gm, "")
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
    formatMoney: (amount, decimalCount = 2, decimal = ".", thousands = ",", currency = "€") => {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? "-" : "";

            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;

            return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "") + "" + currency;
        } catch (e) {
            console.log(e)
        }
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