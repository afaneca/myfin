function RemoveLastDirectoryPartOf(the_url) {
    var the_arr = the_url.split("/");
    the_arr.pop();
    return the_arr.join("/");
}

var MYFIN = {
    TRX_TYPES: {
        INCOME: "I",
        EXPENSE: "E",
        TRANSFER: "T"
    },
    RULES_OPERATOR: {
        DEFAULT_RULES_OPERATOR_EQUALS: "EQ",
        DEFAULT_RULES_OPERATOR_NOT_EQUALS: "NEQ",
        DEFAULT_RULES_OPERATOR_CONTAINS: "CONTAINS",
        DEFAULT_RULES_OPERATOR_NOT_CONTAINS: "NOTCONTAINS"
    }
}

var EXTERNAL_ACCOUNT_LABEL = "** Conta Externa **"


var FRONT_SERVER_PATH =
    window.location.protocol +
    "//" +
    window.location.hostname +
    window.location.pathname;
//var REST_SERVER_PATH = RemoveLastDirectoryPartOf(RemoveLastDirectoryPartOf(FRONT_SERVER_PATH)) + "/api/index.php/"
var REST_SERVER_PATH = "https://api.myfin.test/";


//# sourceURL=consts.js