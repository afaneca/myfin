"use strict";

let showOnlyOpen = false;

var Budgets = {
    init: () => {

        $("input#show_only_open_cb").change(() => {
            showOnlyOpen = $('input#show_only_open_cb').val($(this).is(':checked'))[0].checked
            Budgets.getAllBudgets((showOnlyOpen === true) ? 'O' : null)
        });

        Budgets.getAllBudgets(null);
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
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    },
    initTable: (resp) => {
        $("#table-wrapper").html(Budgets.renderTable(resp))
        tableUtils.setupStaticTableWithCustomColumnWidths("#budgets-table", [{"width": "5%", "targets": 0}]);
    },
    renderTable: (budgetsList) => {
        return `
            <table id="budgets-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Mês</th>
                <th>Observações</th>
                <th>Despesa</th>
                <th>Receita</th>
                <th>Balanço</th>
                <th>Estado</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        ${budgetsList.map(budget => Budgets.renderBudgetsRow(budget)).join("")}
        </tbody>
        </table>
        `
    },
    renderBudgetsRow: (budget) => {
        const currentMonth = moment().month() + 1;
        const currentYear = moment().year();
        return `
            <tr data-id='${budget.budget_id}' class="${(budget.month == currentMonth && budget.year == currentYear) ? 'highlighted-budget-item' : ''}">
                <td>${budget.month}/${budget.year}</td>
                <td>${budget.observations}</td>
                <td>${StringUtils.formatStringToCurrency(budget.debit_amount)}</td>
                <td>${StringUtils.formatStringToCurrency(budget.credit_amount)}</td>
                <td>${Budgets.buildBudgetBalanceRow(budget.balance_value, budget.balance_change_percentage, (budget.month == currentMonth && budget.year == currentYear))}</td>
                <td><span class="${(budget.month == currentMonth && budget.year == currentYear) ? '' : (budget.is_open == 1) ? 'badge green-text text-accent-4' : 'badge pink-text text-accent-2'} ">${(budget.is_open == 1) ? "Aberto" : "Fechado"}</span></td>
                <td>
                    <i onClick="Budgets.goToBudget(${budget.budget_id}, ${budget.is_open})" class="material-icons table-action-icons">remove_red_eye</i>
                    <i onClick="Budgets.showRemoveBudgetModal(${budget.budget_id}, ${budget.month}, ${budget.year})" class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
    },
    buildBudgetBalanceRow: (balanceValue, balanceChangePercentage, isCurrentMonth) => {
        let strToReturn = "";

        if (balanceValue > 0) {
            strToReturn = `+${StringUtils.formatStringToCurrency(balanceValue)} <span class="${!isCurrentMonth ? 'green-text text-accent-4' : ''}" style="font-size: small;">(+${StringUtils.formatStringToPercentage(balanceChangePercentage)})</span>`;
        } else if (balanceValue < 0) {
            strToReturn = `${StringUtils.formatStringToCurrency(balanceValue)} <span class="${!isCurrentMonth ? 'pink-text text-accent-2' : ''}" style="font-size: small;">(${StringUtils.formatStringToPercentage(balanceChangePercentage)})</span>`;
        } else {
            strToReturn = `${StringUtils.formatStringToCurrency(balanceValue)} <span class="" style="font-size: small;">(${StringUtils.formatStringToPercentage(balanceChangePercentage)})</span>`;
        }

        return strToReturn
    },
    goToBudget: (budgetID, isOpen) => {
        configs.goToPage('budgetDetails', {'new': false, 'open': (isOpen == 1) ? true : false, 'id': budgetID}, true);
    },
    showRemoveBudgetModal: (budgetID, month, year) => {
        $("#modal-global").modal("open")
        let txt = `
                <h4>Remover orçamento de <b>${month}/${year}</b></h4>
                <div class="row">
                    <p>Tem a certeza de que pretende remover este orçamento?</p>
                    <b>Esta ação é irreversível!</b>

                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a onClick="Budgets.removeBudget(${budgetID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Remover</a>`;
        $("#modal-global .modal-content").html(txt);
        $("#modal-global .modal-footer").html(actionLinks);
    },
    removeBudget: (budgetID) => {
        LoadingManager.showLoading()
        BudgetServices.removeBudget(budgetID,
            (resp) => {
                // SUCCESS
                LoadingManager.hideLoading()
                configs.goToPage("budgets", null, true)
            },
            (err) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    },
}


//# sourceURL=js/budgets.js