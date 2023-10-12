export const ProgressbarUtils = {
    getCorrectPercentageValue: (current_value, budgeted_value) => {
        if(current_value == 0) return 0
        if(budgeted_value == 0) return 100

        const percentage = (100 * current_value) / budgeted_value

        return parseFloat(percentage).toFixed(2)
    },
    getCorrectPercentageValueWithMaximumValue: (current_value, budgeted_value, maximumValue = 100) => {
            if(current_value == 0) return 0
            if(budgeted_value == 0) return 100

            let percentage = (100 * current_value) / budgeted_value

            if(percentage > maximumValue) percentage = maximumValue

            return parseFloat(percentage).toFixed(2)
        },
}

//# sourceURL=js/utils/progressbarUtils.js
