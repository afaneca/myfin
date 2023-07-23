export const RuleServices = {
  getAllRules: (successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'rules/';
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
        if (successCallback) successCallback(response);
      },
      error: function (response) {
        if (errorCallback) errorCallback(response);
      }
    });
  },
  addRule: (matcher_description_operator, matcher_description_value, matcher_amount_operator, matcher_amount_value, matcher_type_operator, matcher_type_value, matcher_account_to_id_operator, matcher_account_to_id_value,
    matcher_account_from_id_operator, matcher_account_from_id_value, assign_category_id, assign_entity_id, assign_account_to_id, assign_account_from_id, assign_type, assign_essential, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'rules/';

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
        matcher_description_operator,
        matcher_description_value,
        matcher_amount_operator,
        matcher_amount_value,
        matcher_type_operator,
        matcher_type_value,
        matcher_account_to_id_operator,
        matcher_account_to_id_value,
        matcher_account_from_id_operator,
        matcher_account_from_id_value,
        assign_category_id,
        assign_entity_id,
        assign_account_to_id,
        assign_account_from_id,
        assign_type,
        assign_essential,
      },
      url: pageUrl,
      success: function (response) {
        if (successCallback) successCallback(response);
      },
      error: function (response) {
        if (errorCallback) errorCallback(response);
      }
    });
  },
  removeRule: (ruleID, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'rules/';

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
        rule_id: ruleID,
      },
      url: pageUrl,
      success: function (response) {
        if (successCallback) successCallback(response);
      },
      error: function (response) {
        if (errorCallback) errorCallback(response);
      }
    });
  },
  editRule: (rule_id, matcher_description_operator, matcher_description_value, matcher_amount_operator, matcher_amount_value, matcher_type_operator, matcher_type_value, matcher_account_to_id_operator, matcher_account_to_id_value,
    matcher_account_from_id_operator, matcher_account_from_id_value, assign_category_id, assign_entity_id, assign_account_to_id, assign_account_from_id, assign_type, assign_essential, successCallback, errorCallback) => {
    var pageUrl = REST_SERVER_PATH + 'rules/';

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
        rule_id,
        matcher_description_operator,
        matcher_description_value,
        matcher_amount_operator,
        matcher_amount_value,
        matcher_type_operator,
        matcher_type_value,
        matcher_account_to_id_operator,
        matcher_account_to_id_value,
        matcher_account_from_id_operator,
        matcher_account_from_id_value,
        assign_category_id,
        assign_entity_id,
        assign_account_to_id,
        assign_account_from_id,
        assign_type,
        assign_essential,
      },
      url: pageUrl,
      success: function (response) {
        if (successCallback) successCallback(response);
      },
      error: function (response) {
        if (errorCallback) errorCallback(response);
      }
    });
  },
};

//# sourceURL=js/services/ruleServices.js