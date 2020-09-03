"use strict";

var PickerUtils = {
    setupMonthPickerWithDefaultDate: (selectorID, defaultMonth, defaultYear, onSelectCallback, minValue = "04/2015", maxValue = "07/2021") => {
        $(selectorID).Monthpicker({
            minValue: minValue,
            maxValue: maxValue,
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
    getDatePickerDefault18nStrings: () => {
        return {
            months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
            monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            weekdays: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
            weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            weekdaysAbbrev: ["D", "S", "T", "Q", "Q", "S", "S"]
        }
    },
}

//# sourceURL=js/utils/pickerUtils.js