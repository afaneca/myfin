"use strict";

var Dashboard = {
    init: () => {

        Dashboard.setupLastTransactionsTable()
        Dashboard.setupDebtDistributionChart()
        Dashboard.setupInvestmentDistributionChart()
        Dashboard.setupIncomeDistributionChart()

        PickerUtils.setupMonthPickerWithDefaultDate("#dashboard-monthpicker", moment().month() + 1, moment().year(), () => {
            const selectedMonth = $("#dashboard-monthpicker").val();

            console.log("New Month Selected: " + selectedMonth);
            Dashboard.refreshDashboard(selectedMonth)
        },
            moment().month() + 1 + "/" + (moment().year() - 10), moment().month() + 1 + "/" + moment().year())
        var isShowing = false;
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
    setupIncomeDistributionChart: () => {
        var dataset = [10, 20, 30, 20, 20];

        var labels = [
            'Red',
            'Yellow',
            'Blue',
            'fdsad',
            'fdsa',
        ];

        chartUtils.setupPieChart("chart_pie_income_distribution", dataset, labels, "Distribuição de Receita");
    },
    refreshDashboard: (newMonth) => {
        // TODO DASHBOARD: setup refresh of data
    }
}

//# sourceURL=js/dashboard.js