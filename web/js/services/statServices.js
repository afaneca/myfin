"use strict";

var StatServices = {
    getUserAccountsBalanceSnapshot: (successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "accounts/stats/balance-snapshots/"
        $.ajax({
            async: true,
            type: "GET",
            dataType: "json",
            cache: false,
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
}

//# sourceURL=js/services/statServices.js