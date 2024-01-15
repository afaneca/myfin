import { LocalDataManager } from './utils/localDataManager.js'
import { LoadingManager } from './utils/loadingManager.js'
import { Localization } from './utils/localization.js'
import { DialogUtils } from './utils/dialogUtils.js'

var isSignUp = false

$('.login-form').submit(function (e) {
  e.preventDefault()
  //configs.switchApp("myfin");

  var email = $('#email-input').val()
  var username = $('#login-input').val()
  var pw = $('#pw-input').val()

  if (isSignUp) {
    addUser(username, email, pw)
  } else {
    performLogin(username, pw)
  }
})

export function signUpLinkWasClicked () {
  isSignUp = !isSignUp

  if (isSignUp) {
    showSignUp()
  } else {
    showSignIn()
  }
}

export function showSignUp () {
  const signUpSelector = $('#change-login-type')
  const emailInputSelector = $('#email-input')
  const btnSelector = $('#btn-login')

  emailInputSelector.removeClass('input_hidden')
  emailInputSelector.addClass('input_shown')
  btnSelector.html(Localization.getString(
    'login.signUp'))
  signUpSelector.html(Localization.getString('login.alreadyRegisteredQuestion'))
}

export function showSignIn () {
  const signInSelector = $('#change-login-type')
  const emailInputSelector = $('#email-input')
  const btnSelector = $('#btn-login')

  emailInputSelector.removeClass('input_shown')
  emailInputSelector.addClass('input_hidden')
  btnSelector.html(Localization.getString('login.signIn'))
  signInSelector.html(Localization.getString('login.notYetRegisteredQuestion'))
}

export function checkCredentials () {
  if (browserHasGoodCookies()) {
    validateSession()

  } else {
    resetSession()
  }
}

async function validateSession (renewValidity = undefined) {
  var loginInvalid = true
  var pageUrl = REST_SERVER_PATH + 'validity/'
  const { configs } = await import('./configs.js')
  $.ajax({
    async: true, type: 'POST', dataType: 'json', cache: false, headers: {
      authusername: Cookies.get('username'),
      sessionkey: Cookies.get('sessionkey'),
    }, data: {
      renewValidity: renewValidity,
    }, url: pageUrl, success: function (response) {
      if (response == '1') {
        loginInvalid = false
      }
      // there's a valid sessionkey, skip the login stages (if we're in login
      // page)
      if (window.location.pathname.split('/').pop() == 'login.html') {
        configs.switchApp('myfin')
      }
    }, error: function (response) {
      if (window.location.pathname.split('/').pop() != 'login.html') // If we are not
        // already
        // on the
        // login
        // page
      {
        configs.switchApp('login')
      }
    },
  })

  return !loginInvalid
}

export function checkPreAuthWithInterval (interval = 300000) { // 300000 ms = 5 mins
  setInterval(() => {
    checkPreAuth(undefined, false)
  }, interval)
}

export async function checkPreAuth (
  failFunction = undefined, renewValidity = undefined) {

  if (Cookies.get('username') && Cookies.get('sessionkey')) // If there are
    // records of
    // username &
    // sessionkey in
    // Cookies
  {
    await validateSession(renewValidity)
  }// Check if those credentials are still valid

  else {
    //console.log("Não presente nas Cookies. Pedir Login.");
    if (failFunction) {
      failFunction
    }
    if (window.location.pathname.split('/').pop() != 'login.html') // If we are not
      // already on
      // the login
      // page
    {
      const { configs } = await import('./configs.js').then((c) => {
        window.location = c.defaultApp + '.html'
      })

    } // Redirect to login page
  }
}

function addUser (username, email, password) {
  if (!email || !username || !password) {
    DialogUtils.showSuccessMessage(
      Localization.getString('login.fillAllFields'))
    return
  }
  disableLoginBtn()
  showLoading().then(r => {
    var pageUrl = REST_SERVER_PATH + 'users/'
    $.ajax({
      async: true, type: 'POST', dataType: 'json', cache: false, headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      }, data: {
        username, email, password,
      }, url: pageUrl, success: (response) => {
        hideLoading().then(r => {
          DialogUtils.showSuccessMessage(
            Localization.getString('login.userSuccessfullyAdded'))
          signUpLinkWasClicked()
          enableLoginBtn()
        })
      }, error: (response) => {
        hideLoading().then(r => {
          DialogUtils.showErrorMessage(
            response.status === 401 ? Localization.getString(
              'login.addUserDisabledError') : undefined)
          enableLoginBtn()
        })
      },

    })
  })
}

function disableLoginBtn () {
  $('#btn-login').prop('disabled', true)
}

function enableLoginBtn () {
  $('#btn-login').prop('disabled', false)
}

async function performLogin (username, password) {
  var pageUrl = REST_SERVER_PATH + 'auth/'
  const { configs } = await import('./configs.js')
  disableLoginBtn()
  showLoading().then(r => {
    $.ajax({
      async: true, type: 'POST', dataType: 'json', cache: false, data: {
        username: $('#login-input').val(), password: $('#pw-input').val(),
      }, url: pageUrl, success: function (response) {
        //console.log(response);
        enableLoginBtn()
        hideLoading().then(r => {
          Cookies.set('sessionkey', response['sessionkey'])
          Cookies.set('username', response['username'])
          Cookies.set('trustlimit', response['trustlimit'])
          LocalDataManager.setUserAccounts(response['accounts'])

          configs.switchApp('myfin')
          /* if (!misc.checkIfUserHasAction("canAccessBackoffice")) {
            M.toast({
              html: "Não tem permissões para aceder ao Backoffice!"
            });
          } else {
            Cookies.set("sessionkey", response["sessionkey"]);
            Cookies.set("username", response["username"]);
            ensoConf.switchApp("enso_life");
          } */
        })
      }, error: function (response) {
        enableLoginBtn()
        hideLoading().then(r => {
          if (response.status == EnsoShared.ENSO_REST_NOT_AUTHORIZED) {
            /* M.toast('Autenticação falhada.', 3000, 'rounded'); */
          }

          DialogUtils.showErrorMessage(
            Localization.getString('login.wrongCredentialsError'))
        })
      },
    })
  })
}

async function showLoading () {
  LoadingManager.showLoading()
}

async function hideLoading () {
  LoadingManager.hideLoading()
}

/* Removes all user data from Cookies */
export async function resetSession () {
  Cookies.remove('sessionkey')
  Cookies.remove('username')
  Cookies.remove('trustlimit')

  LocalDataManager.clearLocalSessionData()

  if (window.location.pathname.split('/').pop() != 'login.html') // if we're not
    // in the login
    // page
  {
    const { configs } = await import('./configs.js')

    window.location = configs.defaultApp + '.html'
  } // redirect to login page
}

/* Checks if the browser has stored all the user information required */
function browserHasGoodCookies () {
  return (Cookies.get('sessionkey') !== undefined && Cookies.get('username') !==
    undefined && Cookies.get('trustlimit') !== undefined)
}