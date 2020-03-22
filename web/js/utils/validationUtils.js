
"use strict";

var ValidationUtils = {
    checkIfFieldsAreFilled: (fieldsArr, emptyStr) => {
        let emptyRepStr = (emptyStr) ? emptyStr : ""

        fieldsArr.forEach((field) => {
            if (!field || field == emptyStr) return false
        })

        return true
    }
}

//# sourceURL=js/utils/validationUtils.js