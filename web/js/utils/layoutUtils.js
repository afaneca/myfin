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
    changeTheme: (themePath) => {
        switch (themePath) {
            case MYFIN.APP_THEMES_CSS_PATH.DARK_BLUE:
                // unload dark gray theme css
                $("link[href='" + MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY + "']").remove();
                break;
            case MYFIN.APP_THEMES_CSS_PATH.DARK_GRAY:
            default:
                // load dark gray theme css
                $('head').append('<link type="text/css" rel="stylesheet" href="' + themePath + '" id="bt-removable-css">')
                break;
        }
    }
}

//# sourceURL=js/utils/layoutUtils.js