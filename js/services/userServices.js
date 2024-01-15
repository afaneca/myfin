export const UserServices = {
  changeUserPassword: (current_password, new_password, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'users/changePW/'

    $.ajax({
      async: true,
      type: 'PUT',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      data: {
        current_password,
        new_password,
      },
      url: pageUrl,
      success: function (response) {
        if (successCallback) {
          successCallback(response)
        }
      },
      error: function (response) {
        if (errorCallback) {
          errorCallback(response)
        }
      },
    })
  },
  getAllCategoriesEntitiesTagsForUser: (successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'user/categoriesEntitiesTags'
    $.ajax({
      async: true,
      type: 'GET',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      data: {},
      url: pageUrl,
      success: function (response) {
        if (successCallback) {
          successCallback(response)
        }
      },
      error: function (response) {
        if (errorCallback) {
          errorCallback(response)
        }
      },
    })
  },
  populateWithDemoData: (successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'users/demo/'

    $.ajax({
      async: true,
      type: 'POST',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      data: {},
      url: pageUrl,
      success: function (response) {
        if (successCallback) {
          successCallback(response)
        }
      },
      error: function (response) {
        if (errorCallback) {
          errorCallback(response)
        }
      }
    });
  },
}

//# sourceURL=js/actions/userService.js
