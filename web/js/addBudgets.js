"use strict";

let currentBudgetID;

var AddBudgets = {
    init: (isOpen, isNew, budgetID) => {
        currentBudgetID = budgetID;
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
            AddBudgets.initNewBudget()
        } else {
            $("#conclusion-btn-text").text("Atualizar Orçamento")
            AddBudgets.initBudget(budgetID)
        }


    },
    initBudget: budgetID => {
        LoadingManager.showLoading()
        BudgetServices.getBudget(budgetID, (resp) => {
            // SUCCESS
            LoadingManager.hideLoading()
            const debitCategories = resp['categories'].filter((cat) => cat.type === 'D');
            const creditCategories = resp['categories'].filter((cat) => cat.type === 'C');
            const observations = resp['observations']
            const initialBalance = resp['initial_balance']
            const month = resp['month']
            const year = resp['year']

            AddBudgets.setMonthPickerValue(month, year)
            AddBudgets.setInitialBalance(initialBalance)
            AddBudgets.setObservations(observations)
            AddBudgets.setupBudgetInputs("#new-budget-debit-inputs", debitCategories, false)
            AddBudgets.setupBudgetInputs("#new-budget-credit-inputs", creditCategories, true)
            AddBudgets.setupInputListenersAndUpdateSummary("#estimated_expenses_value", "#estimated_income_value", "#estimated_balance_value")
            AddBudgets.updateSummaryValues("#estimated_expenses_value", "#estimated_income_value", "#estimated_balance_value")
        }, (err) => {
            // FAILURE
            LoadingManager.hideLoading()
            DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
        })
    },
    initNewBudget: () => {
        AddBudgets.setMonthPickerValue(null, null)
        LoadingManager.showLoading()
        BudgetServices.getAddBudgetStep0((resp) => {
            // SUCCESS
            LoadingManager.hideLoading()
            const debitCategories = resp['categories'].filter((cat) => cat.type === 'D');
            const creditCategories = resp['categories'].filter((cat) => cat.type === 'C');

            AddBudgets.setInitialBalance(resp.initial_balance)
            AddBudgets.setupBudgetInputs("#new-budget-debit-inputs", debitCategories, false)
            AddBudgets.setupBudgetInputs("#new-budget-credit-inputs", creditCategories, true)
            AddBudgets.setupInputListenersAndUpdateSummary("#estimated_expenses_value", "#estimated_income_value", "#estimated_balance_value")
        }, (err) => {
            // FAILURE
            LoadingManager.hideLoading()
            DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
        })

        /*var bar = new ProgressBar.Line("#container1", {
             strokeWidth: 4,
             easing: 'easeInOut',
             duration: 1400,
             color: '#FFEA82',
             trailColor: '#eee',
             trailWidth: 1,
             svgStyle: {width: '100%', height: '100%'},
             from: {color: '#FFEA82'},
             to: {color: '#ED6A5A'},
             step: (state, bar) => {
                 bar.path.setAttribute('stroke', state.color);
             }
         });
         bar.animate(0.5);  // Number from 0.0 to 1.0*/
    },
    setupBudgetInputs: (selectorID, categoriesArr, isCredit) => {
        $(selectorID).html(AddBudgets.buildBudgetInputs(categoriesArr, isCredit))
        ProgressBarUtils.setupProgressBar("cat_progressbar_1", 13)
    },
    buildBudgetInputs: (categoriesArr, isCredit) => {
        return `
        <table class="responsive-table">
            <thead>
                <th>Tipo</th>
                <th>Valor Previsto</th>
                <th>Valor Atual</th>
            </thead>
            <tbody>
                ${categoriesArr.map(cat => AddBudgets.renderInputRow(cat, isCredit)).join("")}
            </tbody>
        </table>
        `
    },
    renderInputRow: (cat, isCredit) => {
        return `
            <tr>
                <td>${cat.name}</td>
                <td><div class="input-field inline">
                    <input ${(isOpen) ? "" : " disabled "}id="${cat.category_id}" onClick="this.select();" value="${(cat.planned_amount) ? cat.planned_amount : '0.00'}" type="number" class="cat-input validate ${(isCredit) ? 'credit-input' : 'debit-input'} input" min="0.00" value="0.00" step="0.01" required>
                    <label for="${cat.category_id}" class="active">Valor (€)</label>
                </div></td>
                <td><div class="input-field inline">
                    <input disabled id="${StringUtils.normalizeStringForHtml(cat.name)}_inline" value="${(cat.current_amount) ? cat.current_amount : '0.00'}" type="number" class="validate ${(isCredit) ? 'credit-input' : 'debit-input'} input" min="0.00" value="0.00" step="0.01" required>
                    <label for="${StringUtils.normalizeStringForHtml(cat.name)}_inline" class="active">Valor (€)</label>
                </div></td>
            </tr>
            <tr>
                <td colspan="3">
                    <div id="myProgress">
                        <div class="afaneca_progressbar cat_progressbar_${cat.category_id}">90%</div>
                    </div>
                 </td>
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
            AddBudgets.updateSummaryValues(expensesID, incomeID, balanceID)
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

        $(expensesID).text(StringUtils.formatStringToCurrency(expensesAcc))
        $(incomeID).text(StringUtils.formatStringToCurrency(incomeAcc))
        $(balanceID).text(StringUtils.formatStringToCurrency(balance))
    },
    setMonthPickerValue: (month, year) => {
        PickerUtils.setupMonthPickerWithDefaultDate("#budgets-monthpicker", month, year, () => {
            $("#budgets-monthpicker").val();
        })
    },
    setInitialBalance: value => {
        $("span#estimated_initial_balance_value").text(StringUtils.formatStringToCurrency(value))
    },
    setObservations: value => {
        $("textarea#budget_observations").text(value)
    },
    onConclusionClicked: () => {
        let observations = StringUtils.normalizeStringForHtml($("#budget_observations").val())
        let datepickerValue = $("#budgets-monthpicker").val()
        let month = parseInt(datepickerValue.substring(0, 2))
        let year = parseInt(datepickerValue.substring(3, 7))
        let catValuesArr = AddBudgets.buildCatValuesArr();


        if (!datepickerValue || datepickerValue === "") {
            DialogUtils.showErrorMessage("Por favor, preencha todos os campos!")
            return
        }

        LoadingManager.showLoading()

        if (isNew) {
            BudgetServices.addBudget(month, year, observations, catValuesArr,
                (resp) => {
                    // SUCCESS
                    LoadingManager.hideLoading()
                    configs.goToPage('addBudget', {'new': false, 'open': true, 'id': resp["budget_id"]}, true);
                }, (err) => {
                    // FAILURE
                    LoadingManager.hideLoading()
                    DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
                })
        } else {
            BudgetServices.editBudget(currentBudgetID, month, year, observations, catValuesArr,
                (resp) => {
                    // SUCCESS
                    LoadingManager.hideLoading()
                    configs.goToPage('addBudget', {'new': false, 'open': true, 'id': currentBudgetID}, true);
                }, (err) => {
                    // FAILURE
                    LoadingManager.hideLoading()
                    DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
                })
        }

    },
    buildCatValuesArr: () => {
        let inputs = $("input[type=number].cat-input")
        let catValsArr = new Array()

        inputs.each(function () {
            const obj = $(this)

            const catID = obj[0]["id"]
            const plannedAmount = obj.val()

            catValsArr.push({
                "category_id": catID,
                "planned_value": plannedAmount
            })
        })

        return catValsArr
    },
    onBudgetCloseClicked: () => {
        BudgetServices.editBudgetStatus(currentBudgetID, !isOpen,
            (resp) => {
                // SUCCESS
                LoadingManager.hideLoading()
                configs.goToPage('addBudget', {'new': false, 'open': !isOpen, 'id': currentBudgetID}, true);
            }, (err) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    }
}


//# sourceURL=js/addBudgets.js