import { DialogUtils } from "../utils/dialogUtils.js";
import { BudgetDetails } from "../budgetDetails.js";
import { LoadingManager } from "../utils/loadingManager.js";
import { BudgetServices } from "../services/budgetServices.js";
import { Localization } from "../utils/localization.js";
import { DateUtils } from "../utils/dateUtils.js";

export const CloneMonthFunc = {
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
                <h4>${Localization.getString("budgetDetails.cloneAPreviousMonth")}</h4>
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

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
            <a id="modal-clone-month-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("budgetDetails.cloneBudgetCTA")}</a>`;

        $("#modal-global .modal-content").html(txt);
        $("#modal-global .modal-footer").html(actionLinks);
        $("#modal-clone-month-btn").click(() => CloneMonthFunc.cloneSpecificMonth())
        $('#specific-budget-select').formSelect();
    },
    renderBudgetsListRow: (budgetID, month, year) => {
        return `
            <option value="${budgetID}">${CloneMonthFunc.buildBudgetStringLabel(month, year)}</option>
        `
    },
    buildBudgetStringLabel: (month, year) => {
        const monthName = DateUtils.getMonthsFullName(month)
        return monthName + " " + year
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
                DialogUtils.showErrorMessage()
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

        BudgetDetails.updateSummaryValues("#estimated_expenses_value", "#estimated_income_value", "#estimated_balance_value")
    },
}
//# sourceURL=js/funcs/cloneMonthFunc.js