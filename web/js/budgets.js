import { DialogUtils } from './utils/dialogUtils.js'
import { LayoutUtils } from './utils/layoutUtils.js'
import { tableUtils } from './utils/tableUtils.js'
import { LoadingManager } from './utils/loadingManager.js'
import { BudgetServices } from './services/budgetServices.js'
import { DateUtils } from './utils/dateUtils.js'
import { StringUtils } from './utils/stringUtils.js'
import { Localization } from './utils/localization.js'

let showOnlyOpen = false

export const Budgets = {
  init: () => {

    $('input#show_only_open_cb').change(() => {
      showOnlyOpen = $('input#show_only_open_cb').val($(this).is(':checked'))[0].checked
      Budgets.getAllBudgets((showOnlyOpen === true) ? 'O' : null)
    })

    Budgets.getAllBudgets(null)
  },
  getAllBudgets: (status) => {
    LoadingManager.showLoading()

    BudgetServices.getAllBudgets(status,
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        Budgets.initTable(resp)
      }, (err) => {
        // ERROR
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  initTable: (resp) => {
    $('#table-wrapper').html(Budgets.renderTable(resp))
    tableUtils.setupStaticTableWithCustomColumnWidths('#budgets-table', [
      {
        'width': '5%',
        'targets': 1,
      }], () => {
      Budgets.bindClickListenersForGoToDetailsAction()
      Budgets.bindClickListenersForRemoveAction()
    }, false, 20)
    LayoutUtils.scrollToWithAnimation('.highlighted-budget-item', 400)
  },
  bindClickListenersForGoToDetailsAction: () => {
    $('.table-action-icons.modal-go-to-details-action').each(function () {
      $(this).on('click', function () {
        Budgets.goToBudget(
          this.dataset.budgetId,
          this.dataset.budgetIsOpen,
        )
      })
    })
  },
  bindClickListenersForRemoveAction: () => {
    $('.table-action-icons.modal-remove-action').each(function () {
      $(this).on('click', function () {
        Budgets.showRemoveBudgetModal(
          this.dataset.budgetId,
          this.dataset.budgetMonth,
          this.dataset.budgetYear,
        )
      })
    })
  },
  renderTable: (budgetsList) => {
    return `
            <table id="budgets-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th></th>
                <th>${Localization.getString("budgets.month")}</th>
                <th>${Localization.getString("budgets.observations")}</th>
                <th>${Localization.getString("transactions.expense")}</th>
                <th>${Localization.getString("transactions.income")}</th>
                <th>${Localization.getString("budgets.balance")}</th>
                <th>${Localization.getString("budgets.savings")}</th>
                <th>${Localization.getString("common.actions")}</th>
            </tr>
        </thead>
        <tbody>
        ${budgetsList.map(budget => Budgets.renderBudgetsRow(budget)).join('')}
        </tbody>
        </table>
        `
  },
  renderBudgetsRow: (budget) => {
    const currentMonth = moment().month() + 1
    const currentYear = moment().year()
    return `
            <tr data-id='${budget.budget_id}' class="${(budget.month == currentMonth && budget.year == currentYear) ? 'highlighted-budget-item' : ''}">
                <td><i class="material-icons">${budget.is_open == true ? 'lock_open' : 'lock'}</i></td>
                <td><span style="font-weight: bold;">${DateUtils.getMonthsFullName(
      budget.month)}</span></br><span style="font-size: small;">${budget.month}/${budget.year}</span></td>
                <td style="cursor: pointer;" data-budget-id="${budget.budget_id}" data-budget-is-open="${budget.is_open}" class="table-action-icons modal-go-to-details-action">${budget.observations}</td>
                <td>${StringUtils.formatMoney(budget.debit_amount)}</td>
                <td>${StringUtils.formatMoney(budget.credit_amount)}</td>
                <td>${Budgets.buildBudgetBalanceRow(budget.balance_value, budget.balance_change_percentage,
      (budget.month == currentMonth && budget.year == currentYear))}</td>
                <td>${Budgets.buildBudgetSavingsRateRow(budget.savings_rate_percentage, (budget.month == currentMonth && budget.year == currentYear))}</td>
                <td>
                    <i data-budget-id="${budget.budget_id}" data-budget-is-open="${budget.is_open}" class="material-icons table-action-icons modal-go-to-details-action" style="font-size: larger;">remove_red_eye</i>
                    <i data-budget-id="${budget.budget_id}" data-budget-month="${budget.month}" data-budget-year="${budget.year}" class="material-icons table-action-icons modal-remove-action" style="margin-left:3px;font-size: larger;">delete</i>
                </td>
            </tr>
        `
  },
  buildBudgetSavingsRateRow: (savingsPercentage, isCurrentMonth) => {
    let strToReturn = ''

    if (savingsPercentage > 0) {
      strToReturn = `<span class="${!isCurrentMonth ? 'green-text text-accent-4' : ''}">+${StringUtils.formatStringToPercentage(
        savingsPercentage)}</span>`
    }
    else if (savingsPercentage < 0) {
      strToReturn = `<span class="${!isCurrentMonth ? 'pink-text text-accent-1' : ''}" >${StringUtils.formatStringToPercentage(
        savingsPercentage)}</span>`
    }
    else {
      strToReturn = `<span class="">${StringUtils.formatStringToPercentage(savingsPercentage)}</span>`
    }

    return strToReturn
  },
  buildBudgetBalanceRow: (balanceValue, balanceChangePercentage, isCurrentMonth) => {
    let strToReturn = ''

    if (balanceValue > 0) {
      strToReturn = `+${StringUtils.formatStringToCurrency(balanceValue)} <span class="${!isCurrentMonth
        ? 'green-text text-accent-4'
        : ''}" style="font-size: small;"><br>(+${StringUtils.formatStringToPercentage(balanceChangePercentage)})</span>`
    }
    else if (balanceValue < 0) {
      strToReturn = `${StringUtils.formatStringToCurrency(balanceValue)} <span class="${!isCurrentMonth
        ? 'pink-text text-accent-1'
        : ''}" style="font-size: small;"><br>(${StringUtils.formatStringToPercentage(balanceChangePercentage)})</span>`
    }
    else {
      strToReturn = `${StringUtils.formatStringToCurrency(
        balanceValue)} <span class="" style="font-size: small;">(${StringUtils.formatStringToPercentage(balanceChangePercentage)})</span>`
    }

    return strToReturn
  },
  goToBudget: (budgetID, isOpen) => {
    configs.goToPage('budgetDetails', {
      'new': false,
      'open': (isOpen == 1) ? true : false,
      'id': budgetID,
    }, true)
  },
  showRemoveBudgetModal: (budgetID, month, year) => {
    $('#modal-global').modal('open')
    let txt = `
                <h4>${Localization.getString("budgets.deleteBudgetModalTitle", {month: month, year: year})}</h4>
                <div class="row">
                    <p>${Localization.getString("budgets.deleteBudgetModalSubtitle")}</p>
                    <b>${Localization.getString("budgets.deleteBudgetModalAlert")}</b>
                </div>
                `
    let actionLinks = `<a class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
            <a id="modal-remove-budget-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.delete")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#modal-remove-budget-btn').click(() => Budgets.removeBudget(budgetID))
  },
  removeBudget: (budgetID) => {
    LoadingManager.showLoading()
    BudgetServices.removeBudget(budgetID,
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        configs.goToPage('budgets', null, true)
      },
      (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
}

//# sourceURL=js/budgets.js
