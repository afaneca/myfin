export const ImportTransactionsServices = {
    doImportTransactionsStep0: (successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "trxs/import/step0"
        $.ajax({
            async: true,
            type: "POST",
            dataType: "json",
            cache: true,
            headers: {
                authusername: Cookies.get("username"),
                sessionkey: Cookies.get("sessionkey"),
            },
            data: {},
            url: pageUrl,
            success: function (response) {
                if (successCallback) successCallback(response)
            },
            error: function (response) {
                if (errorCallback) errorCallback(response)
            }
        });
    },
    doImportTransactionsStep1: (trxList, accountID, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "trxs/import/step1"
        $.ajax({
            async: true,
            type: "POST",
            dataType: "json",
            cache: false,
            headers: {
                authusername: Cookies.get("username"),
                sessionkey: Cookies.get("sessionkey"),
            },
            data: {
                account_id: accountID,
                trx_list: JSON.stringify(trxList)
            },
            url: pageUrl,
            success: function (response) {
                if (successCallback) successCallback(response)
            },
            error: function (response) {
                if (errorCallback) errorCallback(response)
            }
        });
    },
    doImportTransactionsStep2: (trxList, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "trxs/import/step2"
        $.ajax({
            async: true,
            type: "POST",
            dataType: "json",
            cache: false,
            headers: {
                authusername: Cookies.get("username"),
                sessionkey: Cookies.get("sessionkey"),
            },
            data: {
                trx_list: JSON.stringify(trxList)
            },
            url: pageUrl,
            success: function (response) {
                if (successCallback) successCallback(response)
            },
            error: function (response) {
                if (errorCallback) errorCallback(response)
            }
        });
    },
}

//# sourceURL=js/services/importTransactionsServices.js