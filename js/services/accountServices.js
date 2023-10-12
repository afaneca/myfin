export const AccountServices = {
    getAllAccounts: (successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "accounts/"
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
    recalculateAllUserAccountsBalances: (successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "accounts/recalculate-balance/all"
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
    addAccount: (name, description, type, exclude_from_budgets, status, current_balance, color_gradient, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "accounts/"
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
                type,
                description,
                exclude_from_budgets,
                status,
                current_balance,
                color_gradient
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
    removeAccount: (accID, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "accounts/"

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
                account_id: accID,
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
    editAccount: (account_id, name, description, type, exclude_from_budgets, status, current_balance, color_gradient, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "accounts/"

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
                account_id,
                new_name: name,
                new_type: type,
                new_description: description,
                exclude_from_budgets,
                new_status: status,
                current_balance,
                color_gradient
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

//# sourceURL=js/services/accountService.js
