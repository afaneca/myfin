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
    }
}

//# sourceURL=js/utils/layoutUtils.js