"use strict";

var CategoryServices = {
    getAllCategories: (type = undefined, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "cats/";
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
                type: undefined
            },
            url: pageUrl,
            success: function (response) {
                successCallback(response)
            },
            error: function (response) {
                errorCallback(response)
            }
        });
    },
}

//# sourceURL=js/actions/categoryServices.js