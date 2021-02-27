"use strict";

var LayoutUtils = {
    smoothScrollToDiv: (divStr, animationDurationInMs = 500) => {
        $('html, body').animate({
            scrollTop: $(divStr).offset().top
        }, animationDurationInMs);
    },
    getCSSVariableValue: (varName) => {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
    },
    changeTheme: (themeName) => {
        switch (themeName) {
            case MYFIN.APP_THEMES.DARK_BLUE:
                // unload dark gray theme css
                $("link[href='" + MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY + "']").remove();
                LocalDataManager.setCurrentTheme(MYFIN.APP_THEMES.DARK_BLUE)
                break;
            case MYFIN.APP_THEMES.DARK_GRAY:
            default:
                // load dark gray theme css
                $('head').append('<link type="text/css" rel="stylesheet" href="' + MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY + '" id="bt-removable-css">')
                LocalDataManager.setCurrentTheme(MYFIN.APP_THEMES.DARK_GRAY)
                break;
        }
    },
    getCurrentThemePath: () => {
        switch (LocalDataManager.getCurrentTheme()) {
            case MYFIN.APP_THEMES.DARK_GRAY:
            default:
                return MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY
                break;
            case MYFIN.APP_THEMES.DARK_BLUE:
                return MYFIN.APP_THEMES_CSS_PATH.DARK_BLUE
        }
    },
    getCurrentThemeName: () => {
        return LocalDataManager.getCurrentTheme() ? LocalDataManager.getCurrentTheme() : MYFIN.APP_THEMES.DARK_GRAY
    }
}

//# sourceURL=js/utils/layoutUtils.js