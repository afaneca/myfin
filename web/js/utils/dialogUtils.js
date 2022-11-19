export var DialogUtils = {
  showGenericMessage: (messageToShow) => {
    M.toast({ text: messageToShow });
  },
  showErrorMessage: (errorMessage
    = 'Ocorreu um erro. Por favor, tente novamente mais tarde!') => {
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