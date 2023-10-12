import { Localization } from "./localization.js";

export const PickerUtils = {
    setupMonthPickerWithDefaultDate: (selectorID, defaultMonth, defaultYear, onSelectCallback, minValue = PickerUtils.getMonthPickersMinValue(), maxValue = PickerUtils.getMonthPickersMaxValue()) => {
        $(selectorID).Monthpicker({
            minValue: minValue,
            maxValue: maxValue,
            defaultYear,
            defaultMonth,
            monthLabels: PickerUtils.getDatePickerDefault18nStrings().monthsShort,
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
            monthLabels: PickerUtils.getDatePickerDefault18nStrings().monthsShort,
            onSelect: onSelectCallback

        });
    },
    getDatePickerDefault18nStrings: () => {
        return {
            months: [
                Localization.getString('monthsLong.january'),
                Localization.getString('monthsLong.february'),
                Localization.getString('monthsLong.march'),
                Localization.getString('monthsLong.april'),
                Localization.getString('monthsLong.may'),
                Localization.getString('monthsLong.june'),
                Localization.getString('monthsLong.july'),
                Localization.getString('monthsLong.august'),
                Localization.getString('monthsLong.september'),
                Localization.getString('monthsLong.october'),
                Localization.getString('monthsLong.november'),
                Localization.getString('monthsLong.december'),
            ],
            monthsShort: [
                Localization.getString("monthsShort.jan"),
                Localization.getString("monthsShort.feb"),
                Localization.getString("monthsShort.mar"),
                Localization.getString("monthsShort.apr"),
                Localization.getString("monthsShort.may"),
                Localization.getString("monthsShort.jun"),
                Localization.getString("monthsShort.jul"),
                Localization.getString("monthsShort.aug"),
                Localization.getString("monthsShort.sep"),
                Localization.getString("monthsShort.oct"),
                Localization.getString("monthsShort.nov"),
                Localization.getString("monthsShort.dec"),
            ],
            weekdays: [
                Localization.getString("weekDaysLong.sunday"),
                Localization.getString("weekDaysLong.monday"),
                Localization.getString("weekDaysLong.tuesday"),
                Localization.getString("weekDaysLong.wednesday"),
                Localization.getString("weekDaysLong.thursday"),
                Localization.getString("weekDaysLong.friday"),
                Localization.getString("weekDaysLong.saturday"),
            ],
            weekdaysShort: [
                Localization.getString("weekDaysShort.sun"),
                Localization.getString("weekDaysShort.mon"),
                Localization.getString("weekDaysShort.tue"),
                Localization.getString("weekDaysShort.wed"),
                Localization.getString("weekDaysShort.thu"),
                Localization.getString("weekDaysShort.fri"),
                Localization.getString("weekDaysShort.sat"),
            ],
            weekdaysAbbrev: [
                Localization.getString("weekDaysAbbrev.sun"),
                Localization.getString("weekDaysAbbrev.mon"),
                Localization.getString("weekDaysAbbrev.tue"),
                Localization.getString("weekDaysAbbrev.wed"),
                Localization.getString("weekDaysAbbrev.thu"),
                Localization.getString("weekDaysAbbrev.fri"),
                Localization.getString("weekDaysAbbrev.sat"),
            ]
        }
    },
}

//# sourceURL=js/utils/pickerUtils.js