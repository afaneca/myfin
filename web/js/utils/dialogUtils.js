"use strict";

var DialogUtils = {
    showGenericMessage: (messageToShow) => {
        M.toast({html: messageToShow});
    },
    showErrorMessage: (errorMessage) => {
        DialogUtils.showGenericMessage(errorMessage)
    },
    showWarningMessage: (warningMessage) => {
        DialogUtils.showGenericMessage(warningMessage)
    },
    showSuccessMessage: (successMessage) => {
        DialogUtils.showGenericMessage(successMessage)
    },
    preventScrollBug: () => {
        /* To prevent the no-scroll bug after closing a Materialize modal */
        $('body').css({
            overflow: 'visible'
        });
    },
    initStandardModal: (elementID = ".modal") => {
        $(elementID).modal({
            onOpenEnd: function (modal, trigger) {
                DialogUtils.preventScrollBug();
            },
        });
    }
}

//# sourceURL=js/utils/dialogUtils.js