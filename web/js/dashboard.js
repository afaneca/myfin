"use strict";

var CHART_INCOME_DISTRIBUTION
var CHART_EXPENSES_DISTRIBUTION
var CHART_MONTHLY_OVERVIEW

var Dashboard = {
    init: () => {

        PickerUtils.setupMonthPickerWithDefaultDate("#dashboard-monthpicker", moment().month() + 1, moment().year(), () => {
            const selectedMonth = $("#dashboard-monthpicker").val();

            console.log("New Month Selected: " + selectedMonth);
            Dashboard.refreshDashboard(selectedMonth)
        },
            moment().month() + 1 + "/" + (moment().year() - 10), moment().month() + 1 + "/" + moment().year())

        Dashboard.setupLastTransactionsTable()
        Dashboard.setupDebtDistributionChart()
        Dashboard.setupInvestmentDistributionChart()
        Dashboard.setupIncomeExpensesDistributionChart()


        var isShowing = false;
    },
    setupMonthlyOverviewChart: (budgetedAmount, realAmount) => {
        if (!budgetedAmount) budgetedAmount = 0
        if (!realAmount) realAmount = 0

        $("#chart-monthly-overview-real-amount").text(StringUtils.formatStringToCurrency(Math.abs(realAmount)))
        $("#chart-monthly-overview-budgeted-amount").text(StringUtils.formatStringToCurrency(Math.abs(budgetedAmount)))

        let maxValue = Math.abs(budgetedAmount) - Math.abs(realAmount)
        if (maxValue < 0) maxValue = 0

        var data = [Math.abs(realAmount), maxValue];
        var customLabels = [
            'Atual',
            'Restante'
        ];

        if (CHART_MONTHLY_OVERVIEW)
            chartUtils.removeData(CHART_MONTHLY_OVERVIEW)

        let realToBudgetedRatio = ((realAmount * 100) / budgetedAmount) / 100

        CHART_MONTHLY_OVERVIEW = chartUtils.setupAngularChart('chart-angular-target-goals', data, null, customLabels, realToBudgetedRatio);

    },
    setupLastTransactionsTable: () => {
        TransactionServices.getXTransactions(5,
            (list) => {
                // SUCCESS
                Dashboard.setupLastMovementsTable(list)
            }, (err) => {
                // FAILURE
            })
    },
    setupLastMovementsTable: list => {
        $('#last_movements_table_wrapper').html(`
         <table class="responsive-table">
            <thead>
                <th>Data</th>
                <th>Descrição</th>
                <th>Montante</th>
            </thead>
            <tbody>
                ${list.map(mov => Dashboard.renderLastMovementsRow(mov)).join("")}
            </tbody>
        </table>
      
      `)
    },
    renderLastMovementsRow: mov => {
        return `
            <tr data-id='${mov.transaction_id}'>
                <td>${DateUtils.convertUnixTimestampToDateString(mov.date_timestamp)}</td>
                <td>${mov.description}</td>
                <td><span class="${(mov.type == 'I') ? 'badge green lighten-5 green-text text-accent-4' : 'badge pink lighten-5 pink-text text-accent-2'} ">${StringUtils.formatStringToCurrency(mov.amount)}</span></td>
            </tr>
        `
    },
    setupDebtDistributionChart: () => {

        const accsArr = CookieUtils.getUserAccounts()

        const creditAccounts = accsArr.filter(function (acc) {
            return acc.type === "CREAC"
        })

        let dataset = []
        let labels = []

        for (const cacc of creditAccounts) {
            dataset.push(parseFloat(cacc.balance).toFixed(2))
            labels.push(cacc.name)
        }


        chartUtils.setupDebtDistributionPieChart("chart_pie_debt_distribution", dataset, labels, "Distribuição da Dívida");
    },
    setupInvestmentDistributionChart: () => {

        const accsArr = CookieUtils.getUserAccounts()

        const investmentAccounts = accsArr.filter(function (acc) {
            return acc.type === "INVAC" || acc.type === "SAVAC"
        })

        let dataset = []
        let labels = []

        for (const invAcc of investmentAccounts) {
            dataset.push(parseFloat(invAcc.balance).toFixed(2))
            labels.push(invAcc.name)
        }


        chartUtils.setupDebtDistributionPieChart("chart_pie_investing_portfolio", dataset, labels, "Portefólio de Investimento");
    },
    setupIncomeExpensesDistributionChart: () => {
        let datasetDebit = []
        let labelsDebit = []
        let datasetCredit = []
        let labelsCredit = []

        const selectedMonth = $("#dashboard-monthpicker").val();

        const month = parseInt(selectedMonth.split("/")[0]);
        const year = parseInt(selectedMonth.split("/")[1]);

        LoadingManager.showLoading()
        StatServices.getDashboardExpensesIncomeDistributionStats(month, year,
            (resp) => {
                // SUCCESS
                const creditCategories = resp.categories.filter((cat) => {
                    return cat.type === "C"
                })
                const deditCategories = resp.categories.filter((cat) => {
                    return cat.type === "D"
                })

                creditCategories.forEach((cat) => {
                    datasetCredit.push(cat.current_amount)
                    labelsCredit.push(cat.name)

                })

                let totalExpensesRealAmount = 0
                let totalExpensesBudgetedAmount = 0
                deditCategories.forEach((cat) => {
                    datasetDebit.push(cat.current_amount)
                    labelsDebit.push(cat.name)
                    totalExpensesRealAmount += parseFloat(cat.current_amount)
                    totalExpensesBudgetedAmount += parseFloat(cat.planned_amount)
                })
                Dashboard.setupMonthlyOverviewChart(totalExpensesBudgetedAmount, totalExpensesRealAmount)

                if (CHART_INCOME_DISTRIBUTION)
                    chartUtils.removeData(CHART_INCOME_DISTRIBUTION)
                if (CHART_EXPENSES_DISTRIBUTION)
                    chartUtils.removeData(CHART_EXPENSES_DISTRIBUTION)

                CHART_INCOME_DISTRIBUTION = chartUtils.setupDebtDistributionPieChart("chart_pie_income_distribution", datasetCredit, labelsCredit, "Distribuição de Receita");
                CHART_EXPENSES_DISTRIBUTION = chartUtils.setupDebtDistributionPieChart("chart_pie_spending_distribution", datasetDebit, labelsDebit, "Distribuição de Despesa");


                LoadingManager.hideLoading()
            }, (err) => {
                // FAILURE
                /*chartUtils.setupPieChart("chart_pie_income_distribution", ["Sem dados"], [100], "Distribuição de Receita");
                chartUtils.setupPieChart("chart_pie_spending_distribution", ["Sem dados"], [0], "Distribuição de Despesa");*/
                LoadingManager.hideLoading()
                if (CHART_INCOME_DISTRIBUTION)
                    chartUtils.removeData(CHART_INCOME_DISTRIBUTION)
                if (CHART_EXPENSES_DISTRIBUTION)
                    chartUtils.removeData(CHART_EXPENSES_DISTRIBUTION)

                CHART_INCOME_DISTRIBUTION = chartUtils.setupPieChart("chart_pie_income_distribution", [], [], "Distribuição de Receita");
                CHART_EXPENSES_DISTRIBUTION = chartUtils.setupPieChart("chart_pie_spending_distribution", [], [], "Distribuição de Despesa");

                Dashboard.setupMonthlyOverviewChart(0, 0)
            })
    },
    refreshDashboard: (newMonth) => {
        // TODO DASHBOARD: setup refresh of data
        Dashboard.setupLastTransactionsTable()
        Dashboard.setupDebtDistributionChart()
        Dashboard.setupInvestmentDistributionChart()
        Dashboard.setupIncomeExpensesDistributionChart()
    }
}

//# sourceURL=js/dashboard.js