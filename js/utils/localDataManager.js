const USER_ACCOUNTS_TAG = 'USER_ACCOUNTS_TAG'
const CURRENT_THEME_TAG = 'CURRENT_THEME_TAG'
const LAST_TRX_INPUT_DATA_TAG = 'LAST_TRX_INPUT_DATA_TAG'
const CURRENT_LANGUAGE_TAG = 'CURRENT_LANGUAGE_TAG'

export var LocalDataManager = {

  // CRUD METHODS - LocalStorage
  getLocalItem: (tag, defaultValue = null) => {
    const item = window.localStorage.getItem(tag)
    if (item) {
      return item
    }
    return defaultValue
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
  clearLocalSessionData: () => {
    window.localStorage.removeItem(USER_ACCOUNTS_TAG)
    window.localStorage.removeItem(LAST_TRX_INPUT_DATA_TAG)
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
      return acc.type === 'CREAC'
    })
  },
  getInvestmentAccounts: () => {
    const accsArr = LocalDataManager.getUserAccounts()

    return accsArr.filter(function (acc) {
      return acc.type === 'INVAC'
    })
  },

  // THEME
  setCurrentTheme: (theme) => {
    return LocalDataManager.setLocalItem(CURRENT_THEME_TAG, theme)
  },
  getCurrentTheme: () => {
    return LocalDataManager.getLocalItem(CURRENT_THEME_TAG)
  },

  // LAST TRX INPUT DATA
  setLastTrxInputData (trxType, accountFromId, accountToId, categoryId, entityId) {
    LocalDataManager.setLocalItem(LAST_TRX_INPUT_DATA_TAG, JSON.stringify({
      trxType,
      accountFromId,
      accountToId,
      categoryId,
      entityId,
    }))
  },
  getLastTrxInputData () {
    return JSON.parse(LocalDataManager.getLocalItem(LAST_TRX_INPUT_DATA_TAG))
  },

  /* LOCALIZATION */
  setCurrentLanguage (locale) {
    return LocalDataManager.setLocalItem(CURRENT_LANGUAGE_TAG, locale)
  },
  getCurrentLanguage () {
    return LocalDataManager.getLocalItem(CURRENT_LANGUAGE_TAG, MYFIN.DEFAULT_LOCALE_CODE)
  },
}

//# sourceURL=js/localDataManager.js