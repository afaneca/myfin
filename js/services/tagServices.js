export const TagServices = {
  getTransactionsByPage: (page, pageSize, searchQuery = null, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + `tags/filteredByPage/${page}`
    $.ajax({
      async: true,
      type: 'GET',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      data: { page_size: pageSize, query: searchQuery },
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
  addTag: (name, description, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'tags/'

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
        description: description || "",
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
  removeTag: (tagId, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + `tags/${tagId}`

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
        tag_id: tagId,
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
  editTag: (tagId, newName, newDescription, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + `tags/${tagId}`

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
        new_name: newName,
        new_description: newDescription,
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

//# sourceURL=js/services/tagServices.js