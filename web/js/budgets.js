"use strict";

var Budgets = {
    init: (isOpen, isNew) => {
        if (isOpen == true) {
            $("#conclusion-close-btn").show()
            $("#conclusion-close-btn-text").text("Fechar Orçamento")
        } else {
            $("#conclusion-close-btn").hide()
            $("#conclusion-close-btn").show()
            $("#conclusion-close-btn-text").text("Reabrir Orçamento")
        }

        if (isNew == true) {
            $("#conclusion-btn-text").text("Adicionar Orçamento")
        } else {
            $("#conclusion-btn-text").text("Atualizar Orçamento")
        }


    },
    setupBudgetInputs: (selectorID, categoriesArr, isCredit) => {
        $(selectorID).html(Budgets.buildBudgetInputs(categoriesArr, isCredit))
    },
    buildBudgetInputs: (categoriesArr, isCredit) => {
        return `
        <table class="responsive-table">
            <thead>
                <th>Tipo</th>
                <th>Valor Previsto</th>
            </thead>
            <tbody>
                ${categoriesArr.map(cat => Budgets.renderInputRow(cat, isCredit)).join("")}
            </tbody>
        </table>
        `
    },
    renderInputRow: (cat, isCredit) => {
        return `
            <tr>
                <td>${cat}</td>
                <td><div class="input-field inline">
                    <input id="${StringUtils.normalizeStringForHtml(cat)}_inline" type="number" class="validate ${(isCredit) ? 'credit-input' : 'debit-input'} input" min="0.00" value="0.00" step="0.01" required>
                    <label for="${StringUtils.normalizeStringForHtml(cat)}_inline" class="active">Valor (€)</label>
                </div></td>
            </tr>
            
        `
        /* <div class="row">
            ${cat}:
                <div class="input-field inline">
                    <input id="${cat}_inline" type="number" class="validate" min="0" value="0" step="0.01">
                    <label for="${cat}_inline">Valor (€)</label>
                </div>
        </div> */
    },
    setupInputListenersAndUpdateSummary: (expensesID, incomeID, balanceID) => {
        $('.input').change((input) => {
            Budgets.updateSummaryValues(expensesID, incomeID, balanceID)
        })
    },
    updateSummaryValues: (expensesID, incomeID, balanceID) => {
        let expensesAcc = 0.00;
        let incomeAcc = 0.00;
        let balance = 0.00;

        $('.credit-input').each((i, input) => {
            let inputValue = $('#' + input.id).val()
            incomeAcc += parseFloat(inputValue)

        })

        $('.debit-input').each((i, input) => {
            let inputValue = $('#' + input.id).val()
            expensesAcc += parseFloat(inputValue)
        })

        balance = incomeAcc - expensesAcc

        $(expensesID).text(StringUtils.formatStringtoCurrency(expensesAcc))
        $(incomeID).text(StringUtils.formatStringtoCurrency(incomeAcc))
        $(balanceID).text(StringUtils.formatStringtoCurrency(balance))
    }
}


//# sourceURL=js/budgets.js