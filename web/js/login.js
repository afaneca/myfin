
"use strict";


const SIGN_UP_HTML = "Ainda não está registado?"
const SIGN_IN_HTML = "Já está registado?"
const SIGN_UP_BTN_TXT = "Criar Conta"
const SIGN_IN_BTN_TXT = "Entrar"

var isSignUp = false;

$(".login-form").submit(function (e) {
    e.preventDefault();
    //configs.switchApp("myfin");

    var email = $("#email-input").val()
    var username = $("#login-input").val()
    var pw = $("#pw-input").val()

    if (isSignUp) {
        addUser(username, email, pw);
    } else {
        performLogin(username, pw);
    }
});

function signUpLinkWasClicked() {
    isSignUp = !isSignUp

    if (isSignUp) {
        showSignUp()
    } else {
        showSignIn()
    }
}

function showSignUp() {
    const signUpSelector = $("#change-login-type")
    const emailInputSelector = $("#email-input")
    const btnSelector = $("#btn-login")

    btnSelector.html(SIGN_UP_BTN_TXT)
    signUpSelector.html(SIGN_UP_HTML)
    //emailInputSelector.show()
    emailInputSelector.removeClass("input_hidden")
    emailInputSelector.addClass("input_shown")



}

function showSignIn() {
    const signInSelector = $("#change-login-type")
    const emailInputSelector = $("#email-input")
    const btnSelector = $("#btn-login")

    btnSelector.html(SIGN_IN_BTN_TXT);
    signInSelector.html(SIGN_IN_HTML)
    //emailInputSelector.hide()
    emailInputSelector.removeClass("input_shown")
    emailInputSelector.addClass("input_hidden")

    var username = $("#username-input").val()
    var pw = $("#pw-input").val()
}


function checkCredentials() {
    if (browserHasGoodCookies()) {
        validateSession();

    } else {
        resetSession();
    }
}

function validateSession(renewValidity = undefined) {
    var loginInvalid = true;
    var pageUrl = REST_SERVER_PATH + "validity/";
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
            renewValidity: renewValidity
        },
        url: pageUrl,
        success: function (response) {
            if (response == "1") loginInvalid = false;
            // there's a valid sessionkey, skip the login stages (if we're in login page)
            if (window.location.pathname.split("/").pop() == "login.html")
                configs.switchApp("myfin");
        },
        error: function (response) {
            if (window.location.pathname.split("/").pop() != "login.html") // If we are not already on the login page
                configs.switchApp("login");
        }
    });

    return !loginInvalid;
}



function checkPreAuthWithInterval(interval = 300000) { // 300000 ms = 5 mins
    setInterval(() => { checkPreAuth(undefined, false) }, interval);
}

function checkPreAuth(failFunction = undefined, renewValidity = undefined) {

    if (Cookies.get("username") && Cookies.get("sessionkey")) // If there are records of username & sessionkey in Cookies
        validateSession(renewValidity); // Check if those credentials are still valid

    else {
        //console.log("Não presente nas Cookies. Pedir Login.");
        if (failFunction) failFunction;
        if (window.location.pathname.split("/").pop() != "login.html") // If we are not already on the login page
            window.location = configs.defaultApp + ".html"; // Redirect to login page
    }
}

function addUser(username, email, password) {
    if (!email || !username || !password) {
        M.toast({ html: "Não deixe campos em branco!" });
        return;
    }
    disableLoginBtn()
    var pageUrl = REST_SERVER_PATH + "users/";
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
            username,
            email,
            password,
        },
        url: pageUrl,
        success: (response) => {
            M.toast({ html: "Utilizador adicionado com sucesso!" });
            signUpLinkWasClicked()
            enableLoginBtn()
        },
        error: (response) => {
            M.toast({ html: "Ocorreu um erro. Tente novamente!" });
            enableLoginBtn()
        }

    })
}

function disableLoginBtn() {
    $("#btn-login").prop('disabled', true);
}

function enableLoginBtn() {
    $("#btn-login").prop('disabled', false);
}

function performLogin(username, password) {
    var pageUrl = REST_SERVER_PATH + "auth/";

    disableLoginBtn()
    $.ajax({
        async: true,
        type: "POST",
        dataType: "json",
        cache: false,
        data: { username: $("#login-input").val(), password: $("#pw-input").val() },
        url: pageUrl,
        success: function (response) {
            //console.log(response);
            enableLoginBtn()
            Cookies.set("actions", response["actions"]);
            Cookies.set("sessionkey", response["sessionkey"]);
            Cookies.set("username", response["username"]);
            Cookies.set("trustlimit", response["trustlimit"]);
            CookieUtils.setUserAccounts(response["accounts"])

            configs.switchApp("myfin");
            /* if (!misc.checkIfUserHasAction("canAccessBackoffice")) {
              M.toast({
                html: "Não tem permissões para aceder ao Backoffice!"
              });
            } else {
              Cookies.set("sessionkey", response["sessionkey"]);
              Cookies.set("username", response["username"]);
              ensoConf.switchApp("enso_life");
            } */
        },
        error: function (response) {
            enableLoginBtn()
            if (response.status == EnsoShared.ENSO_REST_NOT_AUTHORIZED) {
                /* M.toast('Autenticação falhada.', 3000, 'rounded'); */

            }
            M.toast({ html: "Username/password errados. Tente novamente!" });
        }
    });
}

/* Removes all user data from Cookies */
function resetSession() {
    Cookies.remove("sessionkey");
    Cookies.remove("actions");
    Cookies.remove("username");
    Cookies.remove("trustlimit");

    if (window.location.pathname.split("/").pop() != "login.html") // if we're not in the login page
        window.location = configs.defaultApp + ".html"; // redirect to login page
}

/* Checks if the browser has stored all the user information required */
function browserHasGoodCookies() {
    return (
        Cookies.get("sessionkey") !== undefined &&
        Cookies.get("actions") !== undefined &&
        Cookies.get("username") !== undefined &&
        Cookies.get("trustlimit") !== undefined
    );
}