"use strict";


var TopNav = {
    setupTopNavSummaryAmounts: () => {
        const current_savings_element = $("#top-summary-col-current-savings-value")
        const investments_element = $("#top-summary-col-investments-value")
        const credits_element = $("#top-summary-col-credits-value")
        const globalPatrimony_element = $("#top-summary-col-patrimony-value")

        current_savings_element.text("-1€")
        investments_element.text("1€")
        credits_element.text("3")
        globalPatrimony_element.text("4")
    },
}


//# sourceURL=js/topNav.js