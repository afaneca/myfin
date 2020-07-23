"use strict";

let currentBudgetID;
let BUDGET_INITIAL_BALANCE;
let IS_OPEN

var AddBudgets = {
    init: (isOpen, isNew, budgetID) => {
        IS_OPEN = isOpen
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

        $('.tooltipped').tooltip();
        $('.collapsible').collapsible();


    },
    initBudget: budgetID => {
        LoadingManager.showLoading()
        BudgetServices.getBudget(budgetID, (resp) => {
            // SUCCESS
            LoadingManager.hideLoading()
            const allCategories = resp['categories']
            const debitCategories = resp['categories'].filter((cat) => cat.type === 'D');
            const creditCategories = resp['categories'].filter((cat) => cat.type === 'C');
            const observations = resp['observations']
            BUDGET_INITIAL_BALANCE = resp['initial_balance']
            const month = resp['month']
            const year = resp['year']

            AddBudgets.setMonthPickerValue(month, year)
            AddBudgets.setInitialBalance(BUDGET_INITIAL_BALANCE)
            AddBudgets.setObservations(observations)
            AddBudgets.setupBudgetInputs("#new-budget-debit-inputs", allCategories, false)
            AddBudgets.setupBudgetInputs("#new-budget-credit-inputs", allCategories, true)
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
            const allCategories = resp['categories']
            const debitCategories = resp['categories'].filter((cat) => cat.type === 'D');
            const creditCategories = resp['categories'].filter((cat) => cat.type === 'C');

            AddBudgets.setInitialBalance(resp.initial_balance)
            AddBudgets.setupBudgetInputs("#new-budget-debit-inputs", allCategories, false)
            AddBudgets.setupBudgetInputs("#new-budget-credit-inputs", allCategories, true)

            AddBudgets.setupInputListenersAndUpdateSummary("#estimated_expenses_value", "#estimated_income_value", "#estimated_balance_value")
        }, (err) => {
            // FAILURE
            LoadingManager.hideLoading()
            DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
        })
    },
    setupBudgetInputs: (selectorID, categoriesArr, isCredit) => {
        $(selectorID).html(AddBudgets.buildBudgetInputs(categoriesArr, isCredit))
        //ProgressBarUtils.setupProgressBar(".cat_progressbar_1", 13)

        let incomeAcc = 0, expensesAcc = 0

        $('.credit-input-current').each((i, input) => {
            let inputValue = $('#' + input.id).val()
            if (inputValue)
                incomeAcc += parseFloat(inputValue)
        })

        $('.debit-input-current').each((i, input) => {
            let inputValue = $('#' + input.id).val()
            if (inputValue)
                expensesAcc += parseFloat(inputValue)
        })

        $("#table_total_credit_current").text(StringUtils.formatStringToCurrency(incomeAcc))
        $("#table_total_debit_current").text(StringUtils.formatStringToCurrency(expensesAcc))
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
                ${AddBudgets.buildTotalsRow(isCredit)}
                ${categoriesArr.map(cat => AddBudgets.renderInputRow(cat, isCredit)).join("")}
            </tbody>
        </table>
        `
    },
    buildTotalsRow: isCredit => {
        if (isCredit) {
            return `
                <tr style="text-decoration: underline;">
                    <td>TOTAL:</td>
                    <td><span id="table_total_credit_expected">0.0€</span></td>
                    <td><span id="table_total_credit_current">0.0€</span></td>
                </tr>
            `
        }

        return `
                <tr style="text-decoration: underline;">
                    <td>TOTAL:</td>
                    <td><span id="table_total_debit_expected">0.0€</span></td>
                    <td><span id="table_total_debit_current">0.0€</span></td>
                </tr>
            `
    },
    renderInputRow: (cat, isCredit) => {
        return `
            <tr>
                <td><div class="tooltip">
                        ${cat.name}
                        <span class="tooltiptext">${cat.description}</span>
                    </div>
                 </td>
                <td><div class="input-field inline tooltip">
                    <input ${(isOpen) ? "" : " disabled "} id="${cat.category_id}${(isCredit) ? 'credit' : 'debit'}" onClick="this.select();" value="${(isCredit) ? ((cat.planned_amount_credit) ? cat.planned_amount_credit : '0') : ((cat.planned_amount_debit) ? cat.planned_amount_debit : '0')}" type="number" class="cat-input validate ${(isCredit) ? 'credit-input-estimated' : 'debit-input-estimated'} input" min="0.00" value="0.00" step="0.01" required>
                    <label for="${cat.category_id}" class="active">Valor (€)</label>
                </div></td>
                <td><div class="input-field inline">
                    <input disabled id="${StringUtils.normalizeStringForHtml(cat.name)}_inline_${(isCredit) ? 'credit' : 'debit'}" value="${(isCredit) ? ((cat.current_amount_credit) ? cat.current_amount_credit : '0') : ((cat.current_amount_debit) ? cat.current_amount_debit : '0')}" type="number" class="validate ${(isCredit) ? 'credit-input-current' : 'debit-input-current'} input" min="0.00" value="0.00" step="0.01" required>
                    <label for="${StringUtils.normalizeStringForHtml(cat.name)}_inline_${(isCredit) ? 'credit' : 'debit'}" class="active">Valor (€)</label>
                </div></td>
            </tr>
            <tr>
                <td colspan="3">
                    <div id="modded">
                        <div class="progress medium-dark-gray-bg tooltipped" data-position="top" data-tooltip="${AddBudgets.buildCatTooltipText(cat.current_amount_credit, cat.current_amount_debit, cat.planned_amount_credit, cat.planned_amount_debit, isCredit)}">
                            <span>${cat.name}</span>
                            <div class="determinate ${isCredit ? 'red-gradient-bg' : 'green-gradient-bg'}" style="width: ${AddBudgets.getCorrectPercentageValueWithMaximumValue(cat.current_amount_credit, cat.current_amount_debit, cat.planned_amount_credit, cat.planned_amount_debit, isCredit)}%; animation: grow 2s;">
                                ${AddBudgets.getCorrectPercentageValue(cat.current_amount_credit, cat.current_amount_debit, cat.planned_amount_credit, cat.planned_amount_debit, isCredit)}%
                             </div>
                        </div>
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
    buildCatTooltipText: (current_amount_credit, current_amount_debit, planned_amount_credit, planned_amount_debit, isCredit) => {
        return "Gastou mais 2.35€ do que o planeado"
    },
    getCorrectPercentageValue: (current_amount_credit, current_amount_debit, planned_amount_credit, planned_amount_debit, isCredit) => {

        return ProgressbarUtils.getCorrectPercentageValue(parseFloat((isCredit) ? ((current_amount_credit) ? current_amount_credit : '0') : ((current_amount_debit) ? current_amount_debit : '0')), parseFloat((isCredit) ? ((planned_amount_credit) ? planned_amount_credit : '0') : ((planned_amount_debit) ? planned_amount_debit : '0')))
    },
    getCorrectPercentageValueWithMaximumValue: (current_amount_credit, current_amount_debit, planned_amount_credit, planned_amount_debit, isCredit, maximumValue = 100) => {
        return ProgressbarUtils.getCorrectPercentageValueWithMaximumValue(parseFloat((isCredit) ? ((current_amount_credit) ? current_amount_credit : '0') : ((current_amount_debit) ? current_amount_debit : '0')), parseFloat((isCredit) ? ((planned_amount_credit) ? planned_amount_credit : '0') : ((planned_amount_debit) ? planned_amount_debit : '0')), maximumValue)
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

        let creditAmoutsClassSelector
        let debitAmoutsClassSelector

        if(IS_OPEN){
            creditAmoutsClassSelector = ".credit-input-estimated"
            debitAmoutsClassSelector = ".debit-input-estimated"
        } else{
            creditAmoutsClassSelector = ".credit-input-current"
            debitAmoutsClassSelector = ".debit-input-current"

            // Also update labels
            $("span#estimated_expenses_label").text("Despesas Reais")
            $("span#estimated_balance_label").text("Balanço Real")
            $("span#estimated_income_label").text("Renda Real")
        }

        $(creditAmoutsClassSelector).each((i, input) => {
            let inputValue = $('#' + input.id).val()
            incomeAcc += parseFloat(inputValue)
            // debugger
        })

        $(debitAmoutsClassSelector).each((i, input) => {
            let inputValue = $("#" + input.id).val()
            expensesAcc += parseFloat(inputValue)
        })


        $("#table_total_credit_expected").text(StringUtils.formatStringToCurrency(incomeAcc))
        $("#table_total_debit_expected").text(StringUtils.formatStringToCurrency(expensesAcc))

        balance = incomeAcc - expensesAcc


        $(expensesID).text(StringUtils.formatStringToCurrency(expensesAcc))
        $(incomeID).text(StringUtils.formatStringToCurrency(incomeAcc))
        $(balanceID).text(StringUtils.formatStringToCurrency(balance))
        $("#estimated_closing_balance_value_amount").text(StringUtils.formatStringToCurrency((parseFloat(BUDGET_INITIAL_BALANCE) + parseFloat(balance))))
        $("#estimated_closing_balance_value_percentage").text(AddBudgets.calculatePercentageIncrease(BUDGET_INITIAL_BALANCE, (parseFloat(BUDGET_INITIAL_BALANCE) + parseFloat(balance))))
    },
    calculatePercentageIncrease: (val1, val2) => {
        return (((parseFloat(val2) - parseFloat(val1)) / Math.abs(parseFloat(val1))) * 100).toFixed(2)
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
        let observations = StringUtils.removeLineBreaksFromString($("#budget_observations").val())
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
        let catValsArr = []
        let creditValsArr = []
        let debitValsArr = []
        let creditInputs = $("input[type=number].credit-input-estimated")
        let debitInputs = $("input[type=number].debit-input-estimated")

        creditInputs.each(function () {
            const obj = $(this)

            const catID = parseInt(obj[0]["id"]) + ""
            const plannedAmount = obj.val()

            creditValsArr.push({
                "category_id": catID,
                "planned_value_credit": plannedAmount
            })
        })

        debitInputs.each(function () {
            const obj = $(this)

            const catID = parseInt(obj[0]["id"]) + ""
            const plannedAmount = obj.val()

            debitValsArr.push({
                "category_id": catID,
                "planned_value_debit": plannedAmount
            })
        })

        /* Merge them together */
        for (let i = 0; i < debitValsArr.length; i++) {
            catValsArr.push({
                    ...debitValsArr[i],
                    ...(creditValsArr.find((cat) => cat.category_id === debitValsArr[i].category_id))
                }
            );
        }

        /*  let inputs = $("input[type=number].cat-input")
          let catValsArr = new Array()

          inputs.each(function () {
              const obj = $(this)

              const catID = obj[0]["id"]
              const plannedAmount = obj.val()

              catValsArr.push({
                  "category_id": catID,
                  "planned_value": plannedAmount
              })
          })*/
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