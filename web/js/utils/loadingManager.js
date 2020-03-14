"use strict";

var LoadingManager = {
    showLoading: (loadingID) => {
        if(!loadingID){
            loadingID = "#main-loading-wrapper"
        }
        $(loadingID).show()
    },
    hideLoading: (loadingID) => {
        if (!loadingID) {
            loadingID = "#main-loading-wrapper"
        }
        $(loadingID).hide()
    }
};

//# sourceURL=js/utils/loadingManager.js