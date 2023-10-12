import { LocalDataManager } from "./utils/localDataManager.js";
import { TableUtils } from "./utils/tableUtils.js";
import { DialogUtils } from "./utils/dialogUtils.js";
import { LayoutUtils } from "./utils/layoutUtils.js";
import { LoadingManager } from "./utils/loadingManager.js";
import { RuleServices } from "./services/ruleServices.js";
import { Localization } from "./utils/localization.js";

var accountsList1
var entitiesList1
var categoriesList1

export const Rules = {
  init: () => {
    Rules.getRules()
    $('#add-rule-collapsible-header').html(`<i class=\'material-icons\'>edit</i>${Localization.getString("rules.addRule")}`)
  },
  getRules: () => {
    LoadingManager.showLoading()
    RuleServices.getAllRules(
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        accountsList1 = resp.accounts
        LocalDataManager.setUserAccounts(accountsList1)
        entitiesList1 = resp.entities
        categoriesList1 = resp.categories
        Rules.initRulesTable(resp.rules)
        Rules.renderAddRuleForm(resp.accounts, resp.entities, resp.categories)
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      },
    )
  },
  initRulesTable: (rulesArr) => {
    $('#table-wrapper').html(Rules.renderRulesTable(rulesArr))
    TableUtils.setupStaticTable('#rules-table', () => {
      // Click listener for edit click
      Rules.bindClickListenersForEditAction()
      // Click listener for remove click
      Rules.bindClickListenersForRemoveAction()
    })
  },
  bindClickListenersForEditAction: () => {
    $('.table-action-icons.action-edit-rule').each(function () {
      $(this).on('click', function () {
        Rules.showEditRuleModal(
          this.dataset.ruleId,
          this.dataset.matcherDescriptionOperator,
          this.dataset.matcherDescriptionValue,
          this.dataset.matcherAmountOperator,
          this.dataset.matcherAmountValue,
          this.dataset.matcherTypeOperator,
          this.dataset.matcherTypeValue,
          this.dataset.matcherAccountFromIdOperator,
          this.dataset.matcherAccountFromIdValue,
          this.dataset.matcherAccountToIdOperator,
          this.dataset.matcherAccountToIdValue,
          this.dataset.assignAccountFromId,
          this.dataset.assignAccountToId,
          this.dataset.assignCategoryId,
          this.dataset.assignEntityId,
          this.dataset.assignType,
          this.dataset.assignIsEssential,
        )
      })
    })
  },
  bindClickListenersForRemoveAction: () => {
    $('.table-action-icons.action-remove-rule').each(function () {
      $(this).on('click', function () {
        Rules.showRemoveRuleModal(this.dataset.ruleId)
      })
    })
  },
  renderRulesTable: (rulesList) => {
    return `
            <table id="rules-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>${Localization.getString("rules.conditions")}</th>
                <th>${Localization.getString("rules.result")}</th>
                <th>${Localization.getString("common.actions")}</th>
            </tr>
        </thead>
        <tbody>
        ${rulesList.map(rule => Rules.renderRulesRow(rule)).join('')}
        </tbody>
        </table>
        `
  },
  renderRulesRow: (rule) => {
    return `
      <tr data-id='${rule.rule_id}'>
          <td>${Rules.buildConditionsString(rule)}</td>
          <td>${Rules.buildResulstsString(rule)}</td>               
          <td>
              <i
               data-rule-id="${rule.rule_id}"
               data-matcher-description-operator="${rule.matcher_description_operator ? (`${rule.matcher_description_operator}`) : null}"
               data-matcher-description-value="${rule.matcher_description_value ? (`${rule.matcher_description_value}`) : null}"
               data-matcher-amount-operator="${rule.matcher_amount_operator ? (`${rule.matcher_amount_operator}`) : null}"
               data-matcher-amount-value="${rule.matcher_amount_value ? (`${rule.matcher_amount_value}`) : null}"
               data-matcher-type-operator="${rule.matcher_type_operator ? (`${rule.matcher_type_operator}`) : null}"
               data-matcher-type-value="${rule.matcher_type_value ? (`${rule.matcher_type_value}`) : null}"
               data-matcher-account-from-id-operator="${rule.matcher_account_from_id_operator ? (`${rule.matcher_account_from_id_operator}`) : null}"
               data-matcher-account-from-id-value="${rule.matcher_account_from_id_value ? (`${rule.matcher_account_from_id_value}`) : null}"
               data-matcher-account-to-id-operator="${rule.matcher_account_to_id_operator ? (`${rule.matcher_account_to_id_operator}`) : null}"
               data-matcher-account-to-id-value="${rule.matcher_account_to_id_value ? (`${rule.matcher_account_to_id_value}`) : null}"
               data-assign-account-to-id="${rule.assign_account_to_id ? (`${rule.assign_account_to_id}`) : null}"
               data-assign-account-from-id="${rule.assign_account_from_id ? (`${rule.assign_account_from_id}`) : null}"
               data-assign-category-id="${rule.assign_category_id ? (`${rule.assign_category_id}`) : null}"
               data-assign-entity-id="${rule.assign_entity_id ? (`${rule.assign_entity_id}`) : null}"
               data-assign-type="${rule.assign_type ? (`${rule.assign_type}`) : null}"
               data-assign-is-essential="${rule.assign_is_essential == true ? (`${rule.assign_is_essential}`) : null}"
               class="material-icons table-action-icons action-edit-rule">create</i>
              <i data-rule-id="${rule.rule_id}" class="material-icons table-action-icons action-remove-rule" style="margin-left:10px">delete</i>
          </td>             
      </tr>
        `
  },
  buildConditionsString: rule => {
    let outputStr = ''
    if (rule.matcher_description_operator && rule.matcher_description_operator !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE &&
      rule.matcher_description_value) {
      outputStr += `<span style=\'color: #b5b5b5\'>${Localization.getString("common.description")}:</span> ` + rule.matcher_description_operator + ' => ' + '"' +
        rule.matcher_description_value + '"' + '<br>'
    }

    if (rule.matcher_amount_operator && rule.matcher_amount_operator !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE &&
      rule.matcher_amount_value) {
      outputStr += `<span style=\'color: #b5b5b5\'>${Localization.getString("common.value")}:</span> ` + rule.matcher_amount_operator + ' => ' + '"' + rule.matcher_amount_value + '"' +
        '<br>'
    }

    if (rule.matcher_type_operator && rule.matcher_type_operator !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE && rule.matcher_type_value) {
      outputStr += `<span style=\'color: #b5b5b5\'>${Localization.getString("common.type")}:</span> ` + rule.matcher_type_operator + ' => ' + '"' + rule.matcher_type_value + '"' +
        '<br>'
    }

    if (rule.matcher_account_from_id_operator && rule.matcher_account_from_id_operator !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE &&
      rule.matcher_account_from_id_value) {
      outputStr += `<span style=\'color: #b5b5b5\'>${Localization.getString("rules.fromAccount")}:</span> ` + rule.matcher_account_from_id_operator + ' => ' + '"' +
        LocalDataManager.getUserAccount(rule.matcher_account_from_id_value).name + '"' + '<br>'
    }

    if (rule.matcher_account_to_id_operator && rule.matcher_account_to_id_operator !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE &&
      rule.matcher_account_to_id_value) {
      outputStr += `<span style=\'color: #b5b5b5\'>${Localization.getString("rules.toAccount")}:</span> ` + rule.matcher_account_to_id_operator + ' => ' + '"' +
        LocalDataManager.getUserAccount(rule.matcher_account_to_id_value).name + '"' + '<br>'
    }

    return outputStr
  },
  buildResulstsString: rule => {
    let outputStr = ''
    if (rule.assign_category_id && rule.assign_category_id !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      outputStr += `<span style=\'color: #b5b5b5\'>${Localization.getString("rules.assignCategory")}:</span> ` + Rules.getCategoryName(rule.assign_category_id) + '<br>'
    }

    if (rule.assign_entity_id && rule.assign_entity_id !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      outputStr += `<span style=\'color: #b5b5b5\'>${Localization.getString("rules.assignEntity")}:</span> ` + Rules.getEntityName(rule.assign_entity_id) + '<br>'
    }

    if (rule.assign_account_from_id && rule.assign_account_from_id !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      outputStr += `<span style=\'color: #b5b5b5\'>${Localization.getString("rules.assignFromAccount")}:</span> ` +
        LocalDataManager.getUserAccount(rule.assign_account_from_id).name + '<br>'
    }

    if (rule.assign_account_to_id && rule.assign_account_to_id !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      outputStr += `<span style=\'color: #b5b5b5\'>${Localization.getString("rules.assignToAccount")}:</span> ` +
        LocalDataManager.getUserAccount(rule.assign_account_to_id).name + '<br>'
    }

    return outputStr
  },
  getCategoryName: (catID) => {
    const category = categoriesList1.find(cat => cat.category_id == catID)
    if (category) {
      return category.name
    }
    return catID
  },
  getEntityName: (entID) => {
    const entity = entitiesList1.find(ent => ent.entity_id == entID)
    if (entity) {
      return entity.name
    }
    return entID
  },
  showEditRuleModal: (ruleID, matcher_description_operator, matcher_description_value, matcher_amount_operator, matcher_amount_value,
    matcher_type_operator, matcher_type_value,
    matcher_account_from_id_operator, matcher_account_from_id_value, matcher_account_to_id_operator, matcher_account_to_id_value,
    assign_account_from_id, assign_account_to_id, assign_category_id, assign_entity_id, assign_type, assign_is_essential) => {
    // expand add rule form
    Rules.renderAddRuleForm(accountsList1, entitiesList1, categoriesList1, matcher_description_operator, matcher_description_value,
      matcher_amount_operator, matcher_amount_value, matcher_type_operator, matcher_type_value, matcher_account_from_id_operator,
      matcher_account_from_id_value,
      matcher_account_to_id_operator, matcher_account_to_id_value, assign_account_from_id, assign_account_to_id, assign_category_id, assign_entity_id,
      assign_type, assign_is_essential)
    $('.collapsible').collapsible('open')
    $('#add-rule-btn').text(Localization.getString("rules.updateRuleCTA"))
    $('#add-rule-collapsible-header').html(`<i class=\'material-icons\'>edit</i>${Localization.getString("rules.updateRuleCTA")}`)

    // set btn onClick
    $('#add-rule-btn').removeAttr('onclick')
    $('#add-rule-btn').unbind()
    $('#add-rule-btn').on('click', () => {
      Rules.editRule(ruleID)
    })

    // scroll to addRule form
    LayoutUtils.smoothScrollToDiv('#add-rule-collapsible-header')
  },
  editRule: ruleID => {

    const descriptionOperator = $('select#operator-select-description').val()
    const descriptionValue = $('input#value-input-description').val()
    const amountOperator = $('select#operator-select-amount').val()
    const amountValue = $('input#value-input-amount').val()
    const typeOperator = $('select#operator-select-type').val()
    const typeValue = $('select#value-select-type').val()
    const accountFromIDOperator = $('select#operator-select-account-from').val()

    let accountFromIDValue = $('select#operator-select-account-from-value').val()
    if (accountFromIDValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      accountFromIDValue = null
    }

    const accountToIDOperator = $('select#operator-select-account-to').val()

    let accountToIDValue = $('select#value-select-account-to').val()
    if (accountToIDValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      accountToIDValue = null
    }

    let categoryAssignValue = $('select#value-select-category-assign').val()
    if (categoryAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      categoryAssignValue = null
    }

    let entityAssignValue = $('select#value-select-entity-assign').val()
    if (entityAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      entityAssignValue = null
    }

    let accountFromAssignValue = $('select#value-select-account-from-assign').val()
    if (accountFromAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      accountFromAssignValue = null
    }

    let accountToAssignValue = $('select#value-select-account-to-assign').val()
    if (accountToAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      accountToAssignValue = null
    }

    let essentialValue = $('select#value-select-essential-assign').val()
    if (essentialValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      essentialValue = null
    }

    LoadingManager.showLoading()
    RuleServices.editRule(ruleID, descriptionOperator, descriptionValue, amountOperator, amountValue, typeOperator,
      typeValue, accountToIDOperator, accountToIDValue, accountFromIDOperator, accountFromIDValue, categoryAssignValue,
      entityAssignValue, accountToAssignValue, accountFromAssignValue, null, essentialValue,
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        configs.goToPage('rules', true)
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  showRemoveRuleModal: (ruleID) => {
    $('#modal-global').modal('open')
    let txt = `
                <h4>${Localization.getString("rules.deleteRuleModalTitle", {id: ruleID})}</h4>
                <div class="row">
                    <p>${Localization.getString("rules.deleteRuleModalSubtitle")}</p>
                    <b>${Localization.getString("rules.deleteRuleModalAlert")}</b>
                </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
            <a id="modal-remove-rule-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.delete")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#modal-remove-rule-btn').click(() => Rules.removeRule(ruleID))
  },
  removeRule: (ruleID) => {
    LoadingManager.showLoading()
    RuleServices.removeRule(ruleID,
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        configs.goToPage('rules', true)
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  renderAddRuleForm: (accountsList, entitiesList, categoriesList, matcher_description_operator = null, matcher_description_value = null,
    matcher_amount_operator = null, matcher_amount_value = null, matcher_type_operator = null, matcher_type_value = null,
    matcher_account_from_id_operator = null, matcher_account_from_id_value = null, matcher_account_to_id_operator = null,
    matcher_account_to_id_value = null,
    assign_account_from_id = null, assign_account_to_id = null, assign_category_id = null, assign_entity_id = null, assign_type = null,
    assign_is_essential = null) => {

    $('div#add-rule-form-wrapper').html(
      `
             <!---->
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-description">
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE}" ${(!matcher_description_operator ||
        matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'selected' : ''}>${Localization.getString("rules.ignore")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_CONTAINS}" ${(matcher_description_operator &&
        matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_CONTAINS) ? 'selected' : ''}>${Localization.getString("rules.contains")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_CONTAINS}" ${(matcher_description_operator &&
        matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_CONTAINS) ? 'selected' : ''}>${Localization.getString("rules.doesNotContain")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS}" ${(matcher_description_operator &&
        matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS) ? 'selected' : ''}>${Localization.getString("rules.equals")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS}" ${(matcher_description_operator &&
        matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS) ? 'selected' : ''}>${Localization.getString("rules.notEquals")}
                                </option>
                            </select>
                            <label>${Localization.getString("common.description")}</label>
                        </div>
                        <div class="input-field col s10">
                            <input id="value-input-description" type="text" maxlength="45" placeholder="${Localization.getString("rules.descriptionPlaceholder")}"
                                    ${(matcher_description_value) ? 'value="' + matcher_description_value + '"' : ''}
                                   ${(!matcher_description_operator || matcher_description_operator ==
        MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'disabled' : ''} />
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-amount">
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE}" ${(!matcher_amount_operator ||
        matcher_amount_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'selected' : ''}>${Localization.getString("rules.ignore")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS}" ${(matcher_amount_operator &&
        matcher_amount_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS) ? 'selected' : ''}>${Localization.getString("rules.equals")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS}" ${(matcher_amount_operator &&
        matcher_amount_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS) ? 'selected' : ''}>${Localization.getString("rules.notEquals")}
                                </option>
                            </select>
                            <label>${Localization.getString("common.amount")}</label>
                        </div>
                        <div class="input-field col s10">
                            <input id="value-input-amount" type="number" value="${matcher_amount_value ? matcher_amount_value : '0.00'}" step="0.01"
                             ${(!matcher_amount_operator || matcher_amount_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE)
        ? 'disabled'
        : ''} />
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-type">
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE}" ${(!matcher_type_operator ||
        matcher_type_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'selected' : ''}>${Localization.getString("rules.ignore")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS}" ${(matcher_type_operator &&
        matcher_type_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS) ? 'selected' : ''}>${Localization.getString("rules.equals")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS}" ${(matcher_type_operator &&
        matcher_type_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS) ? 'selected' : ''}>${Localization.getString("rules.notEquals")}
                                </option>
                            </select>
                            <label>${Localization.getString("common.type")}</label>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-type" ${(!matcher_type_operator || matcher_type_operator ==
        MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'disabled' : ''}>
                                <option value="" ${(!matcher_type_value) ? 'disabled' : ''}>${Localization.getString("rules.ignore")}</option>
                                <option value="${MYFIN.TRX_TYPES.EXPENSE}" ${(matcher_type_value && matcher_type_value == MYFIN.TRX_TYPES.EXPENSE)
        ? 'selected'
        : ''}>${Localization.getString("common.debit")}</option>
                                <option value="${MYFIN.TRX_TYPES.INCOME}" ${(matcher_type_value && matcher_type_value == MYFIN.TRX_TYPES.INCOME)
        ? 'selected'
        : ''}>${Localization.getString("common.credit")}</option>
                                <option value="${MYFIN.TRX_TYPES.TRANSFER}" ${(matcher_type_value && matcher_type_value == MYFIN.TRX_TYPES.TRANSFER)
        ? 'selected'
        : ''}>${Localization.getString("transactions.transfer")}</option>
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-account-from">
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE}" ${(!matcher_account_from_id_operator ||
        matcher_account_from_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'selected' : ''}>${Localization.getString("rules.ignore")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS}" ${(matcher_account_from_id_operator &&
        matcher_account_from_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS) ? 'selected' : ''}>${Localization.getString("rules.equals")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS}" ${(matcher_account_from_id_operator &&
        matcher_account_from_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS) ? 'selected' : ''}>${Localization.getString("rules.notEquals")}
                                </option>
                            </select>
                            <label>${Localization.getString("rules.fromAccount")}</label>
                        </div>
                        <div class="input-field col s10">
                            <select id="operator-select-account-from-value" ${(!matcher_account_from_id_operator ||
        matcher_account_from_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'disabled' : ''}>
                                <option value="" ${!matcher_account_from_id_value ? 'selected' : ''}>${Localization.getString("rules.ignore")}</option>
                                 ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name, matcher_account_from_id_value)).
        join('')}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-account-to">
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE}" ${(!matcher_account_to_id_operator ||
        matcher_account_to_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'selected' : ''}>${Localization.getString("rules.ignore")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS}" ${(matcher_account_to_id_operator &&
        matcher_account_to_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS) ? 'selected' : ''}>${Localization.getString("rules.equals")}
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS}" ${(matcher_account_to_id_operator &&
        matcher_account_to_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS) ? 'selected' : ''}>${Localization.getString("rules.notEquals")}
                                </option>
                            </select>
                            <label>${Localization.getString("rules.toAccount")}</label>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-account-to" ${(!matcher_account_to_id_operator || matcher_account_to_id_operator ==
        MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'disabled' : ''}>
                                <option value="" ${!matcher_account_to_id_value ? 'selected' : ''}>${Localization.getString("rules.ignore")}</option>
                                ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name, matcher_account_to_id_value)).
        join('')}
                            </select>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>${Localization.getString("rules.categoryToAssign")}</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-category-assign">
                                <option value="" ${!assign_category_id ? 'selected' : ''}>${Localization.getString("rules.ignore")}</option>
                                ${categoriesList.map(cat => Rules.renderCategoriesSelectOption(cat.category_id, cat.name, assign_category_id)).
        join('')}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>${Localization.getString("rules.entityToAssign")}</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-entity-assign">
                                <option value="" ${!assign_entity_id ? 'selected' : ''}>${Localization.getString("rules.ignore")}</option>
                                ${entitiesList.map(ent => Rules.renderEntitiesSelectOption(ent.entity_id, ent.name, assign_entity_id)).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>${Localization.getString("rules.fromAccountToAssign")}</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-account-from-assign">
                                <option value="" ${!assign_account_from_id ? 'selected' : ''}>${Localization.getString("rules.ignore")}</option>
                                ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name, assign_account_from_id)).
        join('')}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>${Localization.getString("rules.toAccountToAssign")}</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-account-to-assign">
                                <option value="" ${!assign_account_to_id ? 'selected' : ''}>${Localization.getString('rules.ignore')}</option>
                                ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name, assign_account_to_id)).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>${Localization.getString('rules.essential')}</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-essential-assign">
                                <option value="" ${!assign_is_essential ? 'selected' : ''}>${Localization.getString('rules.ignore')}</option>
                                <option value="0" ${assign_is_essential != true ? 'selected' : ''}>${Localization.getString('rules.no')}</option>
                                <option value="1" ${assign_is_essential == true ? 'selected' : ''}>${Localization.getString('rules.yes')}</option>
                            </select>
                        </div>
                    </div>

                    <a id="add-rule-btn" class="waves-effect waves-light btn green-gradient-bg" style="margin: -15px; float:right;"><i
                            class="material-icons left">add_circle</i>${Localization.getString('rules.addRule')}</a>
            `,
    )

    $('#add-rule-btn').click(() => Rules.addRule())
    $('select#operator-select-description').formSelect()
    $('select#operator-select-description').on('change', function () {
      if (this.value == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
        $('input#value-input-description').val('')
        $('input#value-input-description').prop('disabled', true)
      }
      else {
        $('input#value-input-description').prop('disabled', false)
      }
    })

    $('select#operator-select-amount').formSelect()
    $('select#operator-select-amount').on('change', function () {
      if (this.value == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
        $('input#value-input-amount').val('0.00')
        $('input#value-input-amount').prop('disabled', true)
      }
      else {
        $('input#value-input-amount').prop('disabled', false)
      }
    })

    $('select#operator-select-type').formSelect()
    $('select#value-select-type').formSelect()
    $('select#operator-select-type').on('change', function () {
      if (this.value == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
        $('select#value-select-type').prop('disabled', true)
        $('#value-select-type').formSelect('destroy')
        $('#value-select-type').prop('disabled', true)
        $('#value-select-type').formSelect()
      }
      else {
        $('select#value-select-type').prop('disabled', false)
        $('#value-select-type').formSelect('destroy')
        $('#value-select-type').prop('disabled', false)
        $('#value-select-type').formSelect()
      }
    })

    $('select#operator-select-account-from').formSelect()
    $('select#operator-select-account-from-value').select2()
    $('select#operator-select-account-from').on('change', function () {
      if (this.value == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
        $('#operator-select-account-from-value').select2('destroy')
        $('#operator-select-account-from-value').prop('disabled', true)
        $('#operator-select-account-from-value').select2()
        $('select#operator-select-account-from-value').prop('disabled', true)
      }
      else {
        $('select#operator-select-account-from-value').prop('disabled', false)
        $('#operator-select-account-from-value').select2('destroy')
        $('#operator-select-account-from-value').prop('disabled', false)
        $('#operator-select-account-from-value').select2()
      }
    })

    $('select#operator-select-account-to').formSelect()
    $('select#value-select-account-to').select2()
    $('select#operator-select-account-to').on('change', function () {
      if (this.value == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
        $('#value-select-account-to').select2('destroy')
        $('#value-select-account-to').prop('disabled', true)
        $('#value-select-account-to').select2()
        $('select#value-select-account-to').prop('disabled', true)
      }
      else {
        $('select#value-select-account-to').prop('disabled', false)
        $('#value-select-account-to').select2('destroy')
        $('#value-select-account-to').prop('disabled', false)
        $('#value-select-account-to').select2()
      }
    })

    $('select#value-select-category-assign').select2()//.formSelect();
    $('select#value-select-entity-assign').select2()//.formSelect();
    $('select#value-select-account-from-assign').select2()//.formSelect();
    $('select#value-select-account-to-assign').select2()//.formSelect();
    $('select#value-select-essential-assign').select2()//.formSelect();
  },
  addRule: () => {
    const descriptionOperator = $('select#operator-select-description').val()
    const descriptionValue = $('input#value-input-description').val()
    const amountOperator = $('select#operator-select-amount').val()
    const amountValue = $('input#value-input-amount').val()
    const typeOperator = $('select#operator-select-type').val()
    const typeValue = $('select#value-select-type').val()
    const accountFromIDOperator = $('select#operator-select-account-from').val()

    let accountFromIDValue = $('select#operator-select-account-from-value').val()
    if (accountFromIDValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      accountFromIDValue = null
    }
    const accountToIDOperator = $('select#operator-select-account-to').val()

    let accountToIDValue = $('select#value-select-account-to').val()
    if (accountToIDValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      accountToIDValue = null
    }

    let categoryAssignValue = $('select#value-select-category-assign').val()
    if (categoryAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      categoryAssignValue = null
    }

    let entityAssignValue = $('select#value-select-entity-assign').val()
    if (entityAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      entityAssignValue = null
    }

    let accountFromAssignValue = $('select#value-select-account-from-assign').val()
    if (accountFromAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      accountFromAssignValue = null
    }

    let accountToAssignValue = $('select#value-select-account-to-assign').val()
    if (accountToAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      accountToAssignValue = null
    }

    let essentialAssignValue = $('select#value-select-essential-assign').val()
    if (essentialAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
      accountToAssignValue = null
    }

    LoadingManager.showLoading()
    RuleServices.addRule(descriptionOperator, descriptionValue, amountOperator, amountValue, typeOperator,
      typeValue, accountToIDOperator, accountToIDValue, accountFromIDOperator, accountFromIDValue, categoryAssignValue,
      entityAssignValue, accountToAssignValue, accountFromAssignValue, null, essentialAssignValue,
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        configs.goToPage('rules', true)
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  renderAccountsSelectOption: (account_id, account_name, default_value = MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) => {
    return `
           <option value="${account_id}" ${(default_value == account_id) ? 'selected' : ''}>${account_name}</option>
        `
  },
  renderEntitiesSelectOption: (entity_id, name, default_value = MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) => {
    return `
           <option value="${entity_id}" ${(default_value == entity_id) ? 'selected' : ''}>${name}</option>
        `
  },
  renderCategoriesSelectOption: (category_id, name, default_value = MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) => {
    return `
           <option value="${category_id}" ${(default_value == category_id) ? 'selected' : ''}>${name}</option>
        `
  },
}

//# sourceURL=js/rules.js