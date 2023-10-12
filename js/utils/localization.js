import { LocalDataManager } from "./localDataManager.js";

export var Localization = {
  initLocale: () => {
    const currentLocale = LocalDataManager.getCurrentLanguage()

    // use plugins and options as needed, for options, detail see
    // https://www.i18next.com
    i18next
      // i18next-http-backend
      // loads translations from your server
      // https://github.com/i18next/i18next-http-backend
      .use(i18nextHttpBackend)
      // detect user language
      // learn more: https://github.com/i18next/i18next-browser-languageDetector
      .use(i18nextBrowserLanguageDetector)
      // init i18next
      // for all options read: https://www.i18next.com/overview/configuration-options
      .init({
        debug: false,
        fallbackLng: MYFIN.DEFAULT_LOCALE_CODE,
        lng: currentLocale,
        backend: {
          loadPath: '../../locales/{{lng}}/{{ns}}.json',
        },
        maxRetries: 3,
        retryTimeout: 200,
      }, (err, t) => {
        if (err) {
          return console.error(err)
        }

        // for options see
        // https://github.com/i18next/jquery-i18next#initialize-the-plugin
        jqueryI18next.init(i18next, $, { useOptionsAttr: true })

        // start localizing, details:
        // https://github.com/i18next/jquery-i18next#usage-of-selector-function
        Localization.localize()
      })
  },
  localize: () => {
    setTimeout(() => {
      $('body').localize()
    }, 300)
  },
  /*getString: (key) => {
    return i18next.t(key)
  },*/
  getString: (key, placeholders = undefined) => {
    return i18next.t(key, placeholders)
  },
}