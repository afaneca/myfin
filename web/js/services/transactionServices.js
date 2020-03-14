"use strict";

var TransactionServices = {
    getAllTransactions: (successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "trxs/"
        $.ajax({
            async: true,
            type: "GET",
            dataType: "json",
            cache: false,
            headers: {
                authusername: Cookies.get("username"),
                sessionkey: Cookies.get("sessionkey"),
            },
            data: {
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
    // TODO
    addEntity: (name, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "entities/"

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
                name,
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
    // TODO
    removeTransaction: (trxID, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "trxs/"

        $.ajax({
            async: true,
            type: "DELETE",
            dataType: "json",
            cache: false,
            headers: {
                authusername: Cookies.get("username"),
                sessionkey: Cookies.get("sessionkey"),
            },
            data: {
                transaction_id: trxID,
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
    // TODO
    editEntity: (entID, newName, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "entities/"

        $.ajax({
            async: true,
            type: "PUT",
            dataType: "json",
            cache: false,
            headers: {
                authusername: Cookies.get("username"),
                sessionkey: Cookies.get("sessionkey"),
            },
            data: {
                entity_id: entID,
                new_name: newName,
            },
            url: pageUrl,
            success: function (response) {
                if (successCallback) successCallback(response)
            },
            error: function (response) {
                if (errorCallback) errorCallback(response)
            }
        });
    }
}

//# sourceURL=js/actions/transactionServices.js