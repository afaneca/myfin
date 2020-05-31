"use strict";

var Dashboard = {
    init: () => {

        Dashboard.setupDebtDistributionChart()
        Dashboard.setupIncomeDistributionChart()

        PickerUtils.setupMonthPicker("#dashboard-monthpicker", (selected) => {

        })
        var isShowing = false;
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
    }
}

//# sourceURL=js/dashboard.js