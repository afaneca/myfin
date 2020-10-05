"use strict";

const USER_ACCOUNTS_TAG = "USER_ACCOUNTS_TAG"

var LocalDataManager = {

    // CRUD METHODS - LocalStorage
    getLocalItem: (tag) => {
        return window.localStorage.getItem(tag)
    },
    setLocalItem: (tag, value) => {
        return window.localStorage.setItem(tag, value)
    },
    removeLocalItem: (tag) => {
        return window.localStorage.removeItem(tag)
    },
    clearLocalData: () => {
        return window.localStorage.clear()
    },

    // ACCOUNTS DATA
    getUserAccounts: () => {
        //return JSON.parse(Cookies.get(USER_ACCOUNTS_TAG))
        return JSON.parse(LocalDataManager.getLocalItem(USER_ACCOUNTS_TAG))
    },
    getUserAccount: (accountID) => {
        return LocalDataManager.getUserAccounts().find(acc => acc.account_id == accountID)
    },
    setUserAccounts: (accounts) => {
        //return Cookies.set(USER_ACCOUNTS_TAG, JSON.stringify(accounts))
        return LocalDataManager.setLocalItem(USER_ACCOUNTS_TAG, JSON.stringify(accounts))
    },
    getDebtAccounts: () => {
        const accsArr = LocalDataManager.getUserAccounts()

        return accsArr.filter(function (acc) {
            return acc.type === "CREAC"
        })
    },

    // ...

}

//# sourceURL=js/localDataManager.js