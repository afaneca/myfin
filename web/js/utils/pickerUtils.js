"use strict";

var PickerUtils = {
    setupMonthPickerWithDefaultDate: (selectorID, defaultMonth, defaultYear, onSelectCallback, minValue = PickerUtils.getMonthPickersMinValue(), maxValue = PickerUtils.getMonthPickersMaxValue()) => {
        $(selectorID).Monthpicker({
            minValue: minValue,
            maxValue: maxValue,
            defaultYear,
            defaultMonth,
            monthLabels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            onSelect: onSelectCallback

        });
    },
    getMonthPickersMinValue: () => {
        /*const currentMonth = moment().month() + 1;
        const currentYear = moment().year();*/
        /*return currentMonth + "/" + currentYear - 5;*/
        return "01/1970"
    },
    getMonthPickersMaxValue: () => {
        const currentMonth = moment().month() + 1;
        const currentYear = moment().year();
        return currentMonth + "/" + (currentYear + 10);
    },
    setupMonthPicker: (selectorID, onSelectCallback) => {
        $(selectorID).Monthpicker({
            minValue: PickerUtils.getMonthPickersMinValue(),
            maxValue: PickerUtils.getMonthPickersMaxValue(),
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