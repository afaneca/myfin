"use strict";

/* TYPES OF ACCOUNTS:
    - Checking Accounts (CHEAC)
    - Saving Accounts (SAVAC)
    - Investment Accounts (INVAC)
    - Credit Accounts (CREAC)
    - Other Accounts (OTHAC) */

var TopNav = {
    setupTopNavSummaryAmounts: () => {
        const current_savings_element = $("#top-summary-col-current-savings-value")
        const investments_element = $("#top-summary-col-investments-value")
        const credits_element = $("#top-summary-col-credits-value")
        const globalPatrimony_element = $("#top-summary-col-patrimony-value")

        let accsArr = CookieUtils.getUserAccounts()

        current_savings_element.text(StringUtils.formatStringToCurrency(TopNav.calculateCurrentSavingsBalance(accsArr)))
        investments_element.text(StringUtils.formatStringToCurrency(TopNav.calculateInvestmentsBalance(accsArr)))
        credits_element.text(StringUtils.formatStringToCurrency(TopNav.calculateCreditsBalance(accsArr)))
        globalPatrimony_element.text(StringUtils.formatStringToCurrency(TopNav.calculateCurrentPatrimony(accsArr)))
    },
    calculateCurrentSavingsBalance: (accsArr) => {
        const savingsAndCurrentAccounts = accsArr.filter(function (acc) {
            return acc.type === "CHEAC" || acc.type === "SAVAC"
        })


        return savingsAndCurrentAccounts.reduce((acc, item) => {
            return acc + parseFloat(item.balance)
        }, 0)
    },
    calculateInvestmentsBalance: (accsArr) => {
        const investmentAccounts = accsArr.filter(function (acc) {
            return acc.type === "INVAC"
        })

        return investmentAccounts.reduce((acc, item) => {
            return acc + parseFloat(item.balance)
        }, 0)
    },
    calculateCreditsBalance: (accsArr) => {
        const creditAccounts = accsArr.filter(function (acc) {
            return acc.type === "CREAC"
        })

        return creditAccounts.reduce((acc, item) => {
            return acc + parseFloat(item.balance)
        }, 0)
    },
    calculateCurrentPatrimony: (accsArr) => {
        return accsArr.reduce((acc, item) => {
            return acc + parseFloat(item.balance)
        }, 0)
    },
}


//# sourceURL=js/topNav.js