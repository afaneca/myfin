import { LocalDataManager } from "./utils/localDataManager.js";
import { TableUtils } from "./utils/tableUtils.js";
import { account_types_tag, StringUtils } from "./utils/stringUtils.js";
import { Categories } from "./categories.js";
import { chartUtils } from "./utils/chartUtils.js";
import { LoadingManager } from "./utils/loadingManager.js";
import { AccountServices } from "./services/accountServices.js";
import { DialogUtils } from "./utils/dialogUtils.js";
import { Localization } from "./utils/localization.js";

export var Accounts = {
  init: () => {
    Accounts.getAccounts()
  },
  getAccounts: () => {
    LoadingManager.showLoading()
    AccountServices.getAllAccounts((response) => {
        LoadingManager.hideLoading()
        LocalDataManager.setUserAccounts(response)
        const operatingFundAccs = response.filter(function (acc) {
          return (acc.type === account_types_tag.CHEAC || acc.type ===
              account_types_tag.SAVAC
              || acc.type === account_types_tag.MEALAC || acc.type ===
              account_types_tag.WALLET)
            && acc.status === MYFIN.TRX_STATUS.ACTIVE
        })
        const investmentAccs = response.filter(function (acc) {
          return acc.type === account_types_tag.INVAC && acc.status ===
            MYFIN.TRX_STATUS.ACTIVE
        })
        const creditAccs = response.filter(function (acc) {
          return acc.type === account_types_tag.CREAC && acc.status ===
            MYFIN.TRX_STATUS.ACTIVE
        })
        const otherAccs = response.filter(function (acc) {
          return acc.type !== account_types_tag.CHEAC && acc.type !==
            account_types_tag.SAVAC
            && acc.type !== account_types_tag.MEALAC && acc.type !==
            account_types_tag.WALLET
            && acc.type !== account_types_tag.CREAC && acc.type !==
            account_types_tag.INVAC
            && acc.status === MYFIN.TRX_STATUS.ACTIVE
        })
        Accounts.populateOperatingFundsGroup(operatingFundAccs)
        Accounts.populateInvestmentsGroup(investmentAccs)
        Accounts.populateCreditsGroup(creditAccs)
        Accounts.populateOthersGroup(otherAccs)
        Accounts.initTable(response)
      },
      (error) => {
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  populateOperatingFundsGroup: (accs) => {
    if (!accs || accs.length === 0) {
      return
    }
    let html = ''
    let totalBalance = 0

    for (let acc of accs) {
      html += `<p>${acc.name}<span style="float:right">${StringUtils.formatMoney(
        acc.balance)}</span></p><hr>`
      totalBalance += parseFloat(acc.balance)
    }

    $('#acc-operating-funds-accs-wrapper').html(html)
    $('#account-group-operating-funds-total-balance-value').
      html(StringUtils.formatMoney(totalBalance))
  },
  populateInvestmentsGroup: (accs) => {
    if (!accs || accs.length === 0) {
      return
    }
    let html = ''
    let totalBalance = 0

    for (let acc of accs) {
      html += `<p>${acc.name}<span style="float:right">${StringUtils.formatMoney(
        acc.balance)}</span></p><hr>`
      totalBalance += parseFloat(acc.balance)
    }

    $('#acc-investments-accs-wrapper').html(html)
    $('#account-group-investments-total-balance-value').
      html(StringUtils.formatMoney(totalBalance))
  },
  populateCreditsGroup: (accs) => {
    if (!accs || accs.length === 0) {
      return
    }
    let html = ''
    let totalBalance = 0

    for (let acc of accs) {
      html += `<p>${acc.name}<span style="float:right">${StringUtils.formatMoney(
        acc.balance)}</span></p><hr>`
      totalBalance += parseFloat(acc.balance)
    }

    $('#acc-credits-accs-wrapper').html(html)
    $('#account-group-credits-total-balance-value').
      html(StringUtils.formatMoney(totalBalance))
  },
  populateOthersGroup: (accs) => {
    if (!accs || accs.length === 0) {
      return
    }
    let html = ''
    let totalBalance = 0

    for (let acc of accs) {
      html += `<p>${acc.name}<span style="float:right">${StringUtils.formatMoney(
        acc.balance)}</span></p><hr>`
      totalBalance += parseFloat(acc.balance)
    }

    $('#acc-others-accs-wrapper').html(html)
    $('#account-group-others-total-balance-value').
      html(StringUtils.formatMoney(totalBalance))
  },
  initTable: (accountsList) => {
    $('#table-wrapper').html(Accounts.renderAccountsTable(accountsList))
    TableUtils.setupStaticTable('#accounts-table', () => {
      // Click listener for edit click
      $('.table-action-icons.action-edit-account').each(function () {
        $(this).on('click', function () {
          Accounts.showEditAccountModal(
            this.dataset.accName,
            this.dataset.accDescription,
            this.dataset.accType,
            this.dataset.accStatus,
            this.dataset.accBalance,
            this.dataset.accExcludeFromBudgets,
            this.dataset.accColorGradient,
            this.dataset.accAccountId,
          )
        })
      })

      // Click listener for remove click
      $('.table-action-icons.action-remove-account').each(function () {
        $(this).on('click', function () {
          Accounts.showRemoveAccountModal(
            this.dataset.accName,
            this.dataset.accountId,
          )
        })
      })
    })
    LoadingManager.hideLoading()
  },
  renderAccountsTable: (accountsList) => {
    return `
            <table id="accounts-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>${Localization.getString('accounts.color')}</th>
                <th>${Localization.getString('accounts.name')}</th>
                <th>${Localization.getString('accounts.type')}</th>
                <th>${Localization.getString('accounts.balance')}</th>
                <th>${Localization.getString('accounts.status')}</th>
                <th>${Localization.getString('common.actions')}</th>
            </tr>
        </thead>
        <tbody>
        ${accountsList.map(account => Accounts.renderAccountsRow(account)).
      join('')}
        </tbody>
        </table>
        `
  },
  renderAccountsRow: account => {
    return `
            <tr data-id='${account.account_id}'>
                <td>${Categories.renderColorColumn(account.color_gradient)}</td>
                <td>${account.name}</td>
                <td>${StringUtils.getAccountTypeName(account.type)}</td>
                <td>${StringUtils.formatMoney(account.balance)}</td>
                <td><span class="${(account.status === 'Ativa')
      ? 'badge green-text text-accent-4'
      : 'badge pink-text text-accent-1'} ">${Localization.getString(account.status === 'Ativa' ? 'accounts.active' : 'accounts.inactive')}</span></td>
                <td>
                    <i data-acc-name="${account.name}"
                    data-acc-description="${StringUtils.normalizeString(account.description)}"
                    data-acc-type="${account.type}"
                    data-acc-status="${account.status}"
                    data-acc-balance="${account.balance}"
                    data-acc-exclude-from-budgets="${account.exclude_from_budgets}"
                    data-acc-color-gradient="${account.color_gradient}"
                    data-acc-account-id="${account.account_id}"
                    class="material-icons table-action-icons action-edit-account">create</i>
                    <i data-acc-name="${account.name}" data-account-id="${account.account_id}" class="material-icons table-action-icons action-remove-account" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
  },
  addNewAccount: () => {

    $('#modal-global').modal('open')
    let txt = `
                <div class="row">
                    <h4 class="col s8">${Localization.getString('accounts.addNewAccountModalTitle')}</h4>
                    <div class="col s4 right-align">${Accounts.renderColorPickerSelect()}</div>
                </div>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                        <i class="material-icons prefix">account_circle</i>
                            <input id="account_name" type="text" class="validate">
                            <label for="account_name">${Localization.getString('accounts.accountName')}</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">note</i>
                            <select id="account_type_select">
                                <option value="" disabled selected>${Localization.getString('common.chooseAnOption')}</option>
                                <option value="CHEAC">${Localization.getString('accounts.cheac')}</option>
                                <option value="SAVAC">${Localization.getString('accounts.savac')}</option>
                                <option value="INVAC">${Localization.getString('accounts.invac')}</option>
                                <option value="CREAC">${Localization.getString('accounts.creac')}</option>
                                <option value="MEALAC">${Localization.getString('accounts.mealac')}</option>
                                <option value="WALLET">${Localization.getString('accounts.wallet')}</option>
                                <option value="OTHAC">${Localization.getString('accounts.othac')}</option>
                            </select>
                            <label>${Localization.getString('accounts.typeOfAccount')}</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">power_settings_new</i>
                            <select id="account_status_select">
                                <option value="" disabled selected>${Localization.getString('common.chooseAnOption')}</option>
                                <option value="Ativa">${Localization.getString('accounts.active')}</option>
                                <option value="Inativa">${Localization.getString('accounts.inactive')}</option>
                            </select>
                            <label>${Localization.getString('accounts.statusOfAccount')}</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">euro_symbol</i>
                            <input id="current_balance" type="number" step="0.01" min="0.00" class="validate" value="0.00" disabled>
                            <label for="current_balance" class="active">${Localization.getString('accounts.currentBalance')} (€)</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">description</i>
                            <label for="account_description" class="active">${Localization.getString('common.description')}</label>
                            <textarea id="account_description" maxlength="50" placeholder="${Localization.getString('common.description')}..." class="materialize-textarea"></textarea>
                        </div>
                        <div class="input-field col s6">
                            <label>
                                <input id="exclude_from_budgets" type="checkbox" />
                                <span>${Localization.getString('common.excludeFromBudgets')}</span>
                            </label>
                        </div>
                       
                    </form>
                </div>
                `

    /*
     <div class="input-field col s6">
                <i class="material-icons prefix">date_range</i>
                <input id="account_add_datepicker" type="text" class="datepicker">
                <label for="account_add_datepicker">Data do saldo</label>
            </div>
    */
    let actionLinks = `<a class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
    <a id="modal-add-account-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.add")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)

    $('#account_type_select').formSelect()
    $('#account_status_select').formSelect()
    $('#modal-add-account-btn').click(() => Accounts.addAccount())
    /* $('#account_add_datepicker').datepicker({
        container: 'body',
        format: 'dd/mm/yyyy'

    }); */

    const colorGradientsArr = chartUtils.getColorGradientsArr(null)

    $('select.acc-color-picker-select').select2({
      minimumResultsForSearch: -1,
      data: colorGradientsArr,
      escapeMarkup: function (markup) {
        return markup
      },
      templateResult: function (data) {
        return data.html
      },
      templateSelection: function (data) {
        return data.text
      },
    })
  },
  addAccount: () => {
    const name = $('#account_name').val()
    const description = StringUtils.normalizeString(
      $('textarea#account_description').val())
    const current_balance = $('input#current_balance').val()
    const type = $('select#account_type_select').val()
    const status = $('select#account_status_select').val()
    const exclude_from_budgets = $('#exclude_from_budgets').is(':checked')
    let accNewColorGradient = $('select.acc-color-picker-select').val()
    if (!accNewColorGradient) {
      accNewColorGradient = 'red-gradient'
    }

    if (!name || name === '' || !type || type === ''
      /*|| !description || description === ""*/ || !status || status === ''
      || !current_balance || current_balance === '') {
      DialogUtils.showErrorMessage('Por favor, preencha todos os campos!')
      return
    }

    LoadingManager.showLoading()
    AccountServices.addAccount(name, description, type, exclude_from_budgets,
      status, current_balance, accNewColorGradient,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage('Conta adicionada com sucesso!')
        configs.goToPage('accounts', null, true)
      },
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage(
          'Ocorreu um erro. Por favor, tente novamente mais tarde!')
      })

  },
  showRemoveAccountModal: (accName, accID) => {
    $('#modal-global').modal('open')
    let txt = `
                <h4>${Localization.getString("accounts.deleteAccountModalTitle", {name: accName})}</h4>
                <div class="row">
                    <p>${Localization.getString("accounts.deleteAccountModalSubtitle")}</p>
                    <b>${Localization.getString("accounts.deleteAccountModalAlert")}</b>

                </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.edit")}</a>
            <a id="modal-remove-acc-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.delete")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#modal-remove-acc-btn').click(() => Accounts.removeAccount(accID))
  },
  removeAccount: (accID) => {
    if (!accID) {
      return
    }

    LoadingManager.showLoading()
    AccountServices.removeAccount(accID,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString("accounts.accountSuccessfullyDeleted"))
        configs.goToPage('accounts', null, true)
      }),
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      }
  },
  renderColorPickerSelect: cat => {
    return `
            <style>
                /* Height fix for select2 */
                .select2-container .select2-selection--single, .select2-container--default .select2-selection--single .select2-selection__rendered, .select2-container--default .select2-selection--single .select2-selection__arrow {
                    height: 50px;
                }
                
                .select2-container--default .select2-selection--single .select2-selection__rendered {
                    line-height: 75px;
                }
            </style>
            <select style="width: 107px;" class="acc-color-picker-select">
                
            </select>
        `
  },
  showEditAccountModal: (
    accName, accDescription, accType, accStatus, current_balance,
    exclude_from_budgets, accColorGradient, accID) => {
    $('#modal-global').modal('open')
    let txt = `
                <div class="row">
                    <h4 class="col s8">${Localization.getString('accounts.editAccountModalTitle', { name: accName })}</h4>
                    <div class="col s4 right-align">${Accounts.renderColorPickerSelect(
      null)}</div>
                </div>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                        <i class="material-icons prefix">account_circle</i>
                            <input id="account_name" type="text" class="validate">
                            <label class="active" for="account_name">${Localization.getString('accounts.accountName')}</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">note</i>
                            <select id="account_type_select">
                                <option value="" disabled selected>${Localization.getString('common.chooseAnOption')}</option>
                                <option ${(accType === 'CHEAC')
      ? 'selected'
      : ''} value="CHEAC">${Localization.getString('accounts.cheac')}</option>
                                <option ${(accType === 'SAVAC')
      ? 'selected'
      : ''} value="SAVAC">${Localization.getString('accounts.savac')}</option>
                                <option ${(accType === 'INVAC')
      ? 'selected'
      : ''} value="INVAC">${Localization.getString('accounts.invac')}</option>
                                <option ${(accType === 'CREAC')
      ? 'selected'
      : ''} value="CREAC">${Localization.getString('accounts.creac')}</option>
                                <option ${(accType === 'MEALAC')
      ? 'selected'
      : ''} value="MEALAC">${Localization.getString('accounts.mealac')}</option>
                                <option ${(accType === 'WALLET')
      ? 'selected'
      : ''} value="WALLET">${Localization.getString('accounts.wallet')}</option>
                                <option ${(accType === 'OTHAC')
      ? 'selected'
      : ''} value="OTHAC">${Localization.getString('accounts.othac')}</option>
                            </select>
                            <label>${Localization.getString('accounts.typeOfAccount')}</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">power_settings_new</i>
                            <select id="account_status_select">
                                <option value="" disabled selected>${Localization.getString('common.chooseAnOption')}</option>
                                <option ${(accStatus === 'Ativa')
      ? 'selected'
      : ''} value="Ativa">${Localization.getString('accounts.active')}</option>
                                <option ${(accStatus === 'Inativa')
      ? 'selected'
      : ''} value="Inativa">${Localization.getString('accounts.inactive')}</option>
                            </select>
                            <label>${Localization.getString('accounts.statusOfAccount')}</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">euro_symbol</i>
                            <input id="current_balance" type="number" step="0.01" min="0.00" class="validate" disabled>
                            <label class="active" for="current_balance">${Localization.getString('accounts.currentBalance')} (€)</label>
                        </div>
                         <div class="input-field col s6">
                            <i class="material-icons prefix">description</i>
                            <label for="account_description" class="active">${Localization.getString('common.description')}</label>
                            <textarea id="account_description" maxlength="50" placeholder="${Localization.getString('common.description')}..." class="materialize-textarea"></textarea>
                        </div>
                        <div class="input-field col s6">
                            <label>
                                <input id="exclude_from_budgets" type="checkbox" />
                                <span>${Localization.getString('common.excludeFromBudgets')}</span>
                            </label>
                        </div>
                       
                    </form>
                </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString(
      'common.cancel')}</a>
    <a id="modal-edit-acc-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString(
      'common.edit')}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)

    $('#account_type_select').formSelect()
    $('#account_status_select').formSelect()
    $('#modal-edit-acc-btn').click(() => Accounts.editAccount(accID))

    /* AUTO-FILL INPUTS */
    $('input#account_name').val(accName)
    $('input#current_balance').val(current_balance)
    $('textarea#account_description').val(accDescription)

    if (exclude_from_budgets === '1') {
      $('input#exclude_from_budgets').prop('checked', 'checked')
    }

    const colorGradientsArr = chartUtils.getColorGradientsArr(accColorGradient)

    $('select.acc-color-picker-select').select2({
      minimumResultsForSearch: -1,
      data: colorGradientsArr,
      escapeMarkup: function (markup) {
        return markup
      },
      templateResult: function (data) {
        return data.html
      },
      templateSelection: function (data) {
        return data.text
      },
    })
  },
  editAccount: (accID) => {
    const name = $('#account_name').val()
    const description = StringUtils.removeLineBreaksFromString(
      $('textarea#account_description').val())
    const current_balance = $('input#current_balance').val()
    const type = $('select#account_type_select').val()
    const status = $('select#account_status_select').val()
    const exclude_from_budgets = $('#exclude_from_budgets').is(':checked')
    let accNewColorGradient = $('select.acc-color-picker-select').val()
    if (!accNewColorGradient) {
      accNewColorGradient = 'red-gradient'
    }

    if (!name || name === '' || !type || type === ''
      /*|| !description || description === ""*/ || !status || status === ''
      || !current_balance || current_balance === '') {
      DialogUtils.showErrorMessage(Localization.getString('common.fillAllFieldsTryAgain'))
      return
    }
    LoadingManager.showLoading()
    AccountServices.editAccount(accID, name, description, type,
      exclude_from_budgets, status, current_balance, accNewColorGradient,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString("accounts.accountSuccessfullyUpdated"))
        configs.goToPage('accounts', null, true)
      },
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
}
//# sourceURL=js/accounts.js