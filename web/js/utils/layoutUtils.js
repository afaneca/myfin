"use strict";

var LayoutUtils = {
    smoothScrollToDiv: (divStr, animationDurationInMs = 500) => {
        $('html, body').animate({
            scrollTop: $(divStr).offset().top
        }, animationDurationInMs);
    },
}

//# sourceURL=js/utils/layoutUtils.js