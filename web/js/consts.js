function RemoveLastDirectoryPartOf(the_url) {
    var the_arr = the_url.split("/");
    the_arr.pop();
    return the_arr.join("/");
}

var MYFIN = {
    TRX_TYPES : {
        INCOME: "I",
        EXPENSE: "E",
        TRANSFER: "T"
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