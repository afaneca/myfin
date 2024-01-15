export const TransactionServices = {
  getTransactionsByPage: (
    page, pageSize, searchQuery = null, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + `trxs/filteredByPage/${page}`
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
  getAllTransactions: (trxLimit, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'trxs/'
    $.ajax({
      async: true,
      type: 'GET',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      data: { trx_limit: trxLimit },
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
  getXTransactions: (nrOfTransactions, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'trxs/'
    $.ajax({
      async: true,
      type: 'GET',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      data: { trx_limit: nrOfTransactions },
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
  getTransactionsFromMonthAndCategory: (
    month, year, cat_id, type, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'trxs/inMonthAndCategory'
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
        month,
        year,
        cat_id,
        type,
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
  getAddTransactionStep0: (successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'trxs/step0'

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
      },
    })
  },
  addTransaction: (
    amount, type, description, entity_id, account_from_id, account_to_id,
    category_id, date_timestamp, is_essential, tagsArr, successCallback,
    errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'trxs/step1'

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
        amount,
        type,
        description,
        entity_id,
        account_from_id,
        account_to_id,
        category_id,
        date_timestamp,
        is_essential,
        tags: JSON.stringify(tagsArr),
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
  /*editTransaction: (trxID, new_amount, new_type, new_description, new_entity_id, new_account_from_id, new_account_to_id, new_category_id, new_date_timestamp, successCallback, errorCallback) => {
      var pageUrl = REST_SERVER_PATH + "trxs/"

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
              transaction_id: trxID,
              new_amount,
              new_type,
              new_description,
              new_entity_id,
              new_account_from_id,
              new_account_to_id,
              new_category_id,
              new_date_timestamp
          },
          url: pageUrl,
          success: function (response) {
              if (successCallback) successCallback(response)
          },
          error: function (response) {
              if (errorCallback) errorCallback(response)
          }
      });
  },*/
  editTransaction: (trxID, new_amount, new_type, new_description, new_entity_id,
    new_account_from_id, new_account_to_id, new_category_id,
    new_date_timestamp, new_is_essential, new_tags,
    is_split, split_amount, split_category, split_entity, split_type,
    split_account_from, split_account_to, split_description,
    split_is_essential, split_tags,
    successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'trxs/'

    if (new_type !== MYFIN.TRX_TYPES.EXPENSE) {
      new_is_essential = false
    }
    if (split_type !== MYFIN.TRX_TYPES.EXPENSE) {
      split_is_essential = false
    }

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
        transaction_id: trxID,
        new_amount,
        new_type,
        new_description,
        new_entity_id,
        new_account_from_id,
        new_account_to_id,
        new_category_id,
        new_date_timestamp,
        new_is_essential,
        tags: JSON.stringify(new_tags),
        is_split,
        split_amount,
        split_category,
        split_entity,
        split_type,
        split_account_from,
        split_account_to,
        split_description,
        split_is_essential,
        split_tags: JSON.stringify(split_tags),
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
  removeTransaction: (trxID, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'trxs/'

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
        transaction_id: trxID,
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
  autoCategorizeTrx: (
    description, amount, type, account_from_id, account_to_id,
    successCallback, errorCallback) => {

    var pageUrl = REST_SERVER_PATH + 'trxs/auto-cat-trx'

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
        description,
        amount,
        type,
        account_from_id,
        account_to_id,
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

//# sourceURL=js/services/transactionServices.js