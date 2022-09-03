export const LoadingManager = {
  showLoading: () => {
    $('.loader')
      .addClass('is-active');
  },
  hideLoading: () => {
    $('.loader')
      .removeClass('is-active');
  },
  _showLoading: (loadingID) => {
    if (!loadingID) {
      loadingID = '#main-loading-wrapper';
    }
    $(loadingID)
      .show();
  },
  _hideLoading: (loadingID) => {
    if (!loadingID) {
      loadingID = '#main-loading-wrapper';
    }
    $(loadingID)
      .hide();
  }
};

//# sourceURL=js/utils/loadingManager.js
