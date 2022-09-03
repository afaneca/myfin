export const StatServices = {
    getUserCounterStats: (successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "stats/userStats"
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
    getDashboardExpensesIncomeDistributionStats: (month, year, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "stats/dashboard/month-expenses-income-distribution"
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
                month,
                year
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
    getMonthlyPatrimonyProjections: (successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "stats/stats/monthly-patrimony-projections"
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
    getCategoryExpensesEvolution: (selectedCatID, selectedEntId, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "stats/category-expenses-evolution"
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
                cat_id: selectedCatID,
                ent_id: selectedEntId
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
    getCategoryIncomeEvolution: (selectedCatID, selectedEntId, successCallback, errorCallback) => {
        var pageUrl = REST_SERVER_PATH + "stats/category-income-evolution"
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
                cat_id: selectedCatID,
                ent_id: selectedEntId
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

//# sourceURL=js/services/statServices.js