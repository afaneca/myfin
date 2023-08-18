export const BudgetServices = {
  getBudgetsByPage: (
      page, pageSize, searchQuery = null, status = null, successCallback,
      errorCallback) => {
    var pageUrl = REST_SERVER_PATH + `budgets/filteredByPage/${page}`;
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
        page_size: pageSize,
        query: searchQuery,
        status: (status) ? status : null,
      },
      url: pageUrl,
      success: function(response) {
        if (successCallback) {
          successCallback(response);
        }
      },
      error: function(response) {
        if (errorCallback) {
          errorCallback(response);
        }
      },
    });
  },
  getBudget: (budgetID, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'budgets/' + budgetID;

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
      success: function(response) {
        if (successCallback) {
          successCallback(response);
        }
      },
      error: function(response) {
        if (errorCallback) {
          errorCallback(response);
        }
      },
    });
  },
  getAllBudgets: (status, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'budgets/';

    $.ajax({
      async: true,
      type: 'GET',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      data: (status) ? {status} : null,
      url: pageUrl,
      success: function(response) {
        if (successCallback) {
          successCallback(response);
        }
      },
      error: function(response) {
        if (errorCallback) {
          errorCallback(response);
        }
      },
    });
  },
  getBudgetsListForUser: (successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'budgets/list/summary';

    $.ajax({
      async: true,
      type: 'GET',
      dataType: 'json',
      cache: false,
      headers: {
        authusername: Cookies.get('username'),
        sessionkey: Cookies.get('sessionkey'),
      },
      url: pageUrl,
      success: function(response) {
        if (successCallback) {
          successCallback(response);
        }
      },
      error: function(response) {
        if (errorCallback) {
          errorCallback(response);
        }
      },
    });
  },
  getAddBudgetStep0: (successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'budgets/step0';

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
      success: function(response) {
        if (successCallback) {
          successCallback(response);
        }
      },
      error: function(response) {
        if (errorCallback) {
          errorCallback(response);
        }
      },
    });
  },
  addBudget: (
      month, year, observations, catValuesArr, successCallback,
      errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'budgets/step1';

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
        month,
        year,
        observations,
        cat_values_arr: JSON.stringify(catValuesArr),
      },
      url: pageUrl,
      success: function(response) {
        if (successCallback) {
          successCallback(response);
        }
      },
      error: function(response) {
        if (errorCallback) {
          errorCallback(response);
        }
      },
    });
  },
  editBudget: (
      budgetID, month, year, observations, catValuesArr, successCallback,
      errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'budgets/';

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
        budget_id: budgetID,
        month,
        year,
        observations,
        cat_values_arr: JSON.stringify(catValuesArr),
      },
      url: pageUrl,
      success: function(response) {
        if (successCallback) {
          successCallback(response);
        }
      },
      error: function(response) {
        if (errorCallback) {
          errorCallback(response);
        }
      },
    });
  },
  editBudgetStatus: (budgetID, isOpen, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'budgets/status';

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
        budget_id: budgetID,
        is_open: isOpen,
      },
      url: pageUrl,
      success: function(response) {
        if (successCallback) {
          successCallback(response);
        }
      },
      error: function(response) {
        if (errorCallback) {
          errorCallback(response);
        }
      },
    });
  },
  removeBudget: (budgetID, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'budgets/';

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
        budget_id: budgetID,
      },
      url: pageUrl,
      success: function(response) {
        if (successCallback) {
          successCallback(response);
        }
      },
      error: function(response) {
        if (errorCallback) {
          errorCallback(response);
        }
      },
    });
  },
};

//# sourceURL=js/actions/budgetServices.js