"use strict";

const USER_ACCOUNTS_TAG = "USER_ACCOUNTS_TAG"

var CookieUtils = {

    getUserAccounts: () => {
        return JSON.parse(Cookies.get(USER_ACCOUNTS_TAG))
    },
    getUserAccount: (accountID) => {
        return CookieUtils.getUserAccounts().find(acc => acc.account_id == accountID)
    },
    setUserAccounts: (accounts) => {
        return Cookies.set(USER_ACCOUNTS_TAG, JSON.stringify(accounts))
    }

}

//# sourceURL=js/cookieUtils.js