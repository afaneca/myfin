"use strict";

var DialogUtils = {
    showGenericMessage: (messageToShow) => {
        M.toast({ html: messageToShow });
    },
    showErrorMessage: (errorMessage) => {
        DialogUtils.showGenericMessage(errorMessage)
    },
    showWarningMessage: (warningMessage) => {
        DialogUtils.showGenericMessage(warningMessage)
    },
    showSuccessMessage: (successMessage) => {
        DialogUtils.showGenericMessage(successMessage)
    }
}

//# sourceURL=js/utils/dialogUtils.js