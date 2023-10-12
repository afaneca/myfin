import { Localization } from "./localization.js";

export var DialogUtils = {
  showGenericMessage: (messageToShow) => {
    M.toast({ html: messageToShow });
  },
  showErrorMessage: (errorMessage
    = Localization.getString("common.somethingWentWrongTryAgain")) => {
    DialogUtils.showGenericMessage(errorMessage);
  },
  showWarningMessage: (warningMessage) => {
    DialogUtils.showGenericMessage(warningMessage);
  },
  showSuccessMessage: (successMessage) => {
    DialogUtils.showGenericMessage(successMessage);
  },
  preventScrollBug: () => {
    /* To prevent the no-scroll bug after closing a Materialize modal */
    /* $('body').css({
         overflow: 'visible'
     });*/

    /*$('body').classList.remove("noScroll");*/

    $('body')
      .removeClass('noScroll');
  },
  disableBodyScroll: () => {
    $('body')
      .addClass('noScroll');
  },
  initStandardModal: (elementID = '.modal') => {
    $(elementID)
      .modal({
        onOpenEnd: function (modal, trigger) {
          DialogUtils.disableBodyScroll();
        },
        onCloseStart: function (modal, trigger) {
          DialogUtils.preventScrollBug();
        },
      });
  }
};

//# sourceURL=js/utils/dialogUtils.js