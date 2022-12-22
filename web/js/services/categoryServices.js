export const CategoryServices = {
  getAllCategories: (type = undefined, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'cats/'
    $.ajax({
      async: true,
      type: 'GET',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      data: {
        type: undefined,
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
  addCategory: (name, description, color_gradient, status, exclude_from_budgets, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'cats/'

    $.ajax({
      async: true,
      type: 'POST',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      data: {
        name,
        description,
        color_gradient,
        status,
        exclude_from_budgets,
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
  removeCategory: (catID, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'cats/'

    $.ajax({
      async: true,
      type: 'DELETE',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      data: {
        category_id: catID,
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
  editCategory: (catID, newName, newDescription, new_color_gradient, catNewStatus, new_exclude_from_budgets, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'cats/'

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
        category_id: catID,
        new_name: newName,
        new_description: newDescription,
        new_color_gradient,
        new_status: catNewStatus,
        new_exclude_from_budgets,
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
}

//# sourceURL=js/actions/categoryServices.js