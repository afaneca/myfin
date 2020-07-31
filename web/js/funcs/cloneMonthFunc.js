"use strict";

var CloneMonthFunc = {
    onCloneMonthClicked: () => {
        LoadingManager.showLoading()
        BudgetServices.getBudgetsListForUser(
            (resp) => {
                // SUCCESS
                LoadingManager.hideLoading()
                CloneMonthFunc.showBudgetsListModal(resp)
            }, (err) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            }
        )
    },
    showBudgetsListModal: budgetsList => {
        $("#modal-global").modal("open")
        let txt = `
                <h4>Clonar um mês anterior</b></h4>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                            <i class="material-icons prefix">insert_invitation</i>
                            <select id="specific-budget-select">
                                ${budgetsList.map(budget => CloneMonthFunc.renderBudgetsListRow(budget.budget_id, budget.month, budget.year)).join("")}
                            </select>
                        </div>         
                    </form>
                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a onClick="CloneMonthFunc.cloneSpecificMonth()"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Clonar Orçamento</a>`;

        $("#modal-global .modal-content").html(txt);
        $("#modal-global .modal-footer").html(actionLinks);

        $('#specific-budget-select').formSelect();
    },
    renderBudgetsListRow: (budgetID, month, year) => {
        return `
            <option value="${budgetID}">${CloneMonthFunc.buildBudgetStringLabel(month, year)}</option>
        `
    },
    buildBudgetStringLabel: (month, year) => {
        const monthsArr = new Array("Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")
        return monthsArr[month - 1] + " de " + year
    },
    cloneSpecificMonth: () => {
        const selectedBudgetID = $("#specific-budget-select").val()

        LoadingManager.showLoading()
        BudgetServices.getBudget(selectedBudgetID,
            (resp) => {
                // SUCCESS
                LoadingManager.hideLoading()
                $("#modal-global").modal("close")
                CloneMonthFunc.bindCategoriesToValues(resp.categories)
            }, (err) => {
                // FAILURE
                LoadingManager.hideLoading()
                $("#modal-global").modal("close")
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    },
    bindCategoriesToValues: budgetCategories => {
        budgetCategories.forEach((elem) => {
            const catID = elem.category_id
            const plannedAmountCredit = elem.planned_amount_credit
            const plannedAmountDebit = elem.planned_amount_debit

            $("#" + catID + "credit").val(plannedAmountCredit)
            $("#" + catID + "debit").val(plannedAmountDebit)
        })

        AddBudgets.updateSummaryValues("#estimated_expenses_value", "#estimated_income_value", "#estimated_balance_value")
    },
}
//# sourceURL=js/funcs/cloneMonthFunc.js