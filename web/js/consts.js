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
    TRX_STATUS: {
        ACTIVE: "Ativa",
        INACTIVE: "Inativa"
    },
    CATEGORY_STATUS: {
        ACTIVE: "Ativa",
        INACTIVE: "Inativa"
    },
    TRX_TYPE_LABEL: {
        DEBIT: "Débito",
        CREDIT: "Crédito"
    },
    RULES_OPERATOR: {
        DEFAULT_RULES_OPERATOR_IGNORE: "IG",
        DEFAULT_RULES_OPERATOR_EQUALS: "EQ",
        DEFAULT_RULES_OPERATOR_NOT_EQUALS: "NEQ",
        DEFAULT_RULES_OPERATOR_CONTAINS: "CONTAINS",
        DEFAULT_RULES_OPERATOR_NOT_CONTAINS: "NOTCONTAINS"
    },
    APP_THEMES_CSS_PATH: {
        DARK_BLUE: "./css/main.css",
        DARK_GRAY: "./css/themes/dark_gray_theme.css",
        LIGHT: "./css/themes/light_theme.css",
    },
    APP_THEMES: {
        DARK_BLUE: "DARK_BLUE",
        DARK_GRAY: "DARK_GRAY",
        LIGHT: "LIGHT",
    },
    TRX_FETCH_LIMIT: 300,
}

var EXTERNAL_ACCOUNT_LABEL = "** Conta Externa **"


var FRONT_SERVER_PATH =
    window.location.protocol +
    "//" +
    window.location.hostname +
    window.location.pathname;
//var REST_SERVER_PATH = RemoveLastDirectoryPartOf(RemoveLastDirectoryPartOf(FRONT_SERVER_PATH)) + "/api/index.php/"
var REST_SERVER_PATH = "https://nodeapi.myfin.test/";


//# sourceURL=consts.js