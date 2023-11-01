import { LocalDataManager } from "./localDataManager.js";
import { Localization } from "./localization.js";

export var LayoutUtils = {
  smoothScrollToDiv: (divStr, animationDurationInMs = 500) => {
    $('html, body').animate({
      scrollTop: $(divStr).offset().top,
    }, animationDurationInMs)
  },
  getCSSVariableValue: (varName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName)
  },
  changeTheme: (themeName) => {
    switch (themeName) {
      case MYFIN.APP_THEMES.DARK_BLUE:
        // unload theme's css
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.LIGHT)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.SOLARIZED_GREEN)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.MAUVE_THEME)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.NORD_NIGHTFALL)
        LocalDataManager.setCurrentTheme(MYFIN.APP_THEMES.DARK_BLUE);
        break;
      case MYFIN.APP_THEMES.DARK_GRAY:
      default:
        // unload light theme css
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.LIGHT)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.SOLARIZED_GREEN)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.MAUVE_THEME)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.NORD_NIGHTFALL)
        // load dark gray theme css
        LayoutUtils.loadTheme(MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY)
        LocalDataManager.setCurrentTheme(MYFIN.APP_THEMES.DARK_GRAY)
        break
      case MYFIN.APP_THEMES.LIGHT:
        // unload dark gray theme css
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.SOLARIZED_GREEN)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.MAUVE_THEME)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.NORD_NIGHTFALL)
        // load dark gray theme css
        LayoutUtils.loadTheme(MYFIN.APP_THEMES_CSS_PATH.LIGHT)
        LocalDataManager.setCurrentTheme(MYFIN.APP_THEMES.LIGHT)
        // custom logo for light theme
        $('#side-nav-logo-img').attr('src', '../img/logo/logo_transparent_bg_v2.png')
        break
      case MYFIN.APP_THEMES.SOLARIZED_GREEN:
        // unload dark gray theme and light theme css
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.LIGHT)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.NORD_NIGHTFALL)
        // load solarized green theme css
        LayoutUtils.loadTheme(MYFIN.APP_THEMES_CSS_PATH.SOLARIZED_GREEN)
        LocalDataManager.setCurrentTheme(MYFIN.APP_THEMES.SOLARIZED_GREEN)
        break
      case MYFIN.APP_THEMES.MAUVE_THEME:
        // unload dark gray theme and light theme css
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.LIGHT)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.NORD_NIGHTFALL)
        // load solarized green theme css
        LayoutUtils.loadTheme(MYFIN.APP_THEMES_CSS_PATH.MAUVE_THEME)
        LocalDataManager.setCurrentTheme(MYFIN.APP_THEMES.MAUVE_THEME)
        break
      case MYFIN.APP_THEMES.NORD_NIGHTFALL:
        // unload dark gray theme and light theme css
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.LIGHT)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.SOLARIZED_GREEN)
        LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.MAUVE_THEME)
        // load solarized green theme css
        LayoutUtils.loadTheme(MYFIN.APP_THEMES_CSS_PATH.NORD_NIGHTFALL)
        LocalDataManager.setCurrentTheme(MYFIN.APP_THEMES.NORD_NIGHTFALL)
        break
    }

  },
  unloadAllThemes: (excludeThemePath) => {
    if (excludeThemePath !== MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY) {
      LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY)
    }
    if (excludeThemePath !== MYFIN.APP_THEMES_CSS_PATH.LIGHT) {
      LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.LIGHT)
    }
    if (excludeThemePath !== MYFIN.APP_THEMES_CSS_PATH.SOLARIZED_GREEN) {
      LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.SOLARIZED_GREEN)
    }
    if (excludeThemePath !== MYFIN.APP_THEMES_CSS_PATH.DARK_BLUE) {
      LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.DARK_BLUE)
    }
    if (excludeThemePath !== MYFIN.APP_THEMES_CSS_PATH.MAUVE_THEME) {
      LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.MAUVE_THEME)
    }
    if (excludeThemePath !== MYFIN.APP_THEMES_CSS_PATH.NORD_NIGHTFALL) {
      LayoutUtils.unloadtheme(MYFIN.APP_THEMES_CSS_PATH.NORD_NIGHTFALL)
    }
  },
  unloadtheme: (themePath) => {
    $('link[href=\'' + themePath + '\']').remove()
  },
  loadTheme: (themePath) => {
    $('head').append('<link type="text/css" rel="stylesheet" href="' + themePath + '" id="removable-css">')
  },
  getCurrentThemeName: () => {
    return LocalDataManager.getCurrentTheme() ? LocalDataManager.getCurrentTheme() : MYFIN.APP_THEMES.NORD_NIGHTFALL
  },
  getCurrentThemePath: () => {
    switch (LocalDataManager.getCurrentTheme()) {
      case MYFIN.APP_THEMES.DARK_GRAY:
      default:
        return MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY
      case MYFIN.APP_THEMES.DARK_BLUE:
        return MYFIN.APP_THEMES_CSS_PATH.DARK_BLUE
      case MYFIN.APP_THEMES.LIGHT:
        return MYFIN.APP_THEMES_CSS_PATH.LIGHT

    }
  },
  scrollToWithAnimation: (elementLocator, scrollInterval = 500) => {
    const element = $(elementLocator);
    if(!element || !element.offset()) return;
    $('html, body').animate({
      scrollTop: $(elementLocator).offset().top,
    }, scrollInterval)
  },
  buildEssentialTransactionBadge: () => {
    return `
      <span class="badge white-text purple-gradient-bg" style="font-size:small;" data-badge-caption="">${Localization.getString(
      'transactions.essential')}</span>
    `
  },
  scaleOutElement: (elementLocator) => {
    $(elementLocator).removeClass('scale-transition').removeClass('scale-in').addClass('scale-transition').addClass('scale-out')
  },
  scaleInElement: (elementLocator) => {
    $(elementLocator).removeClass('scale-transition').removeClass('scale-out').addClass('scale-transition').addClass('scale-in')
  },
}

//# sourceURL=js/utils/layoutUtils.js