"use strict";

var PickerUtils = {
    setupMonthPickerWithDefaultDate: (selectorID, defaultMonth, defaultYear, onSelectCallback) => {
        $(selectorID).Monthpicker({
            minValue: "04/2015",
            maxValue: "07/2021",
            defaultYear,
            defaultMonth,
            monthLabels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            onSelect: onSelectCallback

        });
    },
    setupMonthPicker: (selectorID, onSelectCallback) => {
        $(selectorID).Monthpicker({
            minValue: "04/2015",
            maxValue: "07/2021",
            monthLabels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            onSelect: onSelectCallback

        });
    },
}

//# sourceURL=js/utils/pickerUtils.js