
"use strict";

export const ValidationUtils = {
    checkIfFieldsAreFilled: (fieldsArr, emptyStr) => {
        let emptyRepStr = (emptyStr) ? emptyStr : ""
        

        for (let field of fieldsArr)
            if (!field || field == emptyStr) return false
        return true
    }
}

//# sourceURL=js/utils/validationUtils.js