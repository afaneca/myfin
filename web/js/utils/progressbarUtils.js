
"use strict";

var ProgressbarUtils = {
    getCorrectPercentageValue: (current_value, budgeted_value) => {
        if(current_value == 0) return 0
        if(budgeted_value == 0) return 100

        const percentage = (100 * current_value) / budgeted_value

        return percentage
    },
}

//# sourceURL=js/utils/progressbarUtils.js
