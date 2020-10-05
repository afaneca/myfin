"use strict";

var Stats = {
    initTabEvolutionOfPatrimony: () => {
        /* let cData = [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000];
         let cLabels = ["01/2020", "02/2020", "03/2020", "04/2020", "05/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020"];*/

        LoadingManager.showLoading()
        StatServices.getUserAccountsBalanceSnapshot((resp) => {
            // SUCCESS
            LoadingManager.hideLoading()
            Stats.transformList(resp)
        }, (err) => {
            // FAILURE
            LoadingManager.hideLoading()
            DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
        })
    },
    initTabProjections: () => {
        LoadingManager.showLoading()
        StatServices.getMonthlyPatrimonyProjections((resp) => {
            // SUCCESS
            LoadingManager.hideLoading()
            let initialAssetsValue = Stats.getInitialAssetsBalance()
            for (let budget of resp) {
                budget["planned_final_balance_assets_only"] = initialAssetsValue
                    + StringUtils.convertIntegerToFloat((StringUtils.convertFloatToInteger(budget.planned_final_balance) - StringUtils.convertFloatToInteger(budget.planned_initial_balance)))
                initialAssetsValue = budget["planned_final_balance_assets_only"]
            }
            let chartData = resp.map(budget => parseFloat(budget.planned_final_balance).toFixed(2));
            let chartLabels = resp.map(budget => budget.month + "/" + budget.year);
            let extraChartData = [{
                borderColor: "#FF5722",
                data: resp.map(budget => parseFloat(budget.planned_final_balance_assets_only).toFixed(2) /*Stats.getFinalBalanceForAssetsOnly(budget.planned_final_balance)*/),
                fill: true,
                hidden: true,
                label: "Balanço Projetado (Ativos)",
            }];
            Stats.setupPatrimonyProjectionsLineChart(chartData, chartLabels, extraChartData)
            Stats.setupPatrimonyProjectionsList(resp)
        }, (err) => {
            // FAILURE
            LoadingManager.hideLoading()
            DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
        })
    },
    changeTabs: activeID => {
        switch (activeID) {
            case "tab-ev-pat":
                Stats.initTabEvolutionOfPatrimony()
                break;
            case "tab-projections":
                Stats.initTabProjections()
                break;
            default:
                break;
        }
    },
    transformList: list => {
        let tempList = []
        let cLabels = []
        let cData = []
        let accsList = []
        let extraChartData = []
        /**
         * [account_id] = { }
         */
        accsList = LocalDataManager.getUserAccounts()


        for (const elem of list) {
            const genKey = `${elem.month}/${elem.year}`

            if (!tempList[genKey]) {
                // if this key doesn't exist yet  -> create sub-array
                tempList[genKey] = []
                cLabels.push(genKey)
            }

            tempList[genKey].push(elem)
        }


        cData["sum"] = []
        for (const elem of cLabels) {
            if (!tempList[elem]) continue

            let total = tempList[elem].reduce((acc, item) => {
                return acc + StringUtils.convertFloatToInteger(item.balance)
            }, 0)

            for (const elem1 of accsList) {
                // loop trough the accs associated with each month
                let accsInSnapshot = tempList[elem].filter((acc) => {
                    return acc.account_id == elem1.account_id
                })

                if (!cData[elem1.name]) cData[elem1.name] = []

                if (!accsInSnapshot[0]) {
                    cData[elem1.name].push(0)
                } else {
                    cData[elem1.name].push(accsInSnapshot[0].balance)
                }
            }

            cData["sum"].push(StringUtils.convertIntegerToFloat(total))
        }


        const cDataKeysArr = Object.keys(cData)

        for (const dataKey of cDataKeysArr) {
            if (dataKey === "sum") continue;

            extraChartData.push(
                {
                    data: cData[dataKey],
                    label: dataKey,
                    borderColor: chartUtils.getPieChartColorsList()[0],
                    fill: true,
                    hidden: true,
                },
            )
        }

        //chartUtils.setupSimpleLineChart("chart_pie_patrimony_evolution", cData, cLabels, "asdfsa")
        Stats.setupPatrimonyLineChart(cData["sum"], cLabels, extraChartData)
        Stats.setupPatrimonyTable(cData["sum"].slice().reverse(), cLabels.slice().reverse())
        tableUtils.setupStaticTable("#ev-pat-table")
    },
    setupPatrimonyTable: (sumArr, sumLabels) => {
        $("#patrimony-table").html(Stats.renderPatrimonyTable(sumArr, sumLabels))
    },
    renderPatrimonyTable: (sumArr, sumLabels) => {
        return `
        <table id="ev-pat-table" class="centered" style="margin-top: 10px;">
            <thead>
                <tr>
                    <th>Mês</th>
                    <th>Balanço Prévio</th>
                    <th>Balanço Final</th>
                    <th>Saldo Mensal</th>
                    <th>Crescimento</th>
                </tr>
            </thead>
            <tbody>
                ${sumLabels.map((label, index) => Stats.renderPatrimonyTableRow(label, sumArr[index + 1], sumArr[index])).join("")}
            </tbody>
        </table>
      `
    },
    renderPatrimonyTableRow: (label, starValue, endValue) => {
        return `
        <tr>
            <td>${label}</td>
            <td>${(starValue) ? StringUtils.formatStringToCurrency(starValue) : "-"}</td>
            <td>${StringUtils.formatStringToCurrency(endValue)}</td>
            <td>${(starValue) ? StringUtils.formatStringToCurrency(endValue - starValue) : "-"}</td>
            <td>${(starValue) ? Stats.calculateGrowthPercentage(starValue, endValue) : "-"}</td>
        </tr>
      `
    },
    calculateGrowthPercentage: (val1, val2) => {
        const percentageChange = (((parseFloat(val2) - parseFloat(val1)) / Math.abs(parseFloat(val1))) * 100)
            .toFixed(2)

        if (percentageChange == 0)
            return `<span>${percentageChange}%</span>`;
        else if (percentageChange < 0)
            return `<span class="badge pink-text text-accent-2">${percentageChange}%</span>`;
        else {
            return `<span class="badge green-text text-accent-4">${percentageChange}%</span>`;
        }
    },
    setupPatrimonyLineChart: (chartData, chartLabels, extraChartData) => {
        var ctx = document.getElementById("chart_pie_patrimony_evolution").getContext('2d');

        const chartTitle = "Evolução do Património"
        var customOptions = {
            title: {
                display: true,
                text: chartTitle,
                position: "top",
                fontColor: "white"
            },
            legend: {
                labels: {
                    fontColor: 'rgba(255, 255, 255, 0.7)'
                }
            },
        }

        /*let extraChartData = [
            {
                data: chartData,
                label: "v1",
                borderColor: "#3e95cd",
                fill: true
            },
            {
                data: chartData,
                label: "v2",
                borderColor: "#3e95cd",
                fill: true
            },
        ]*/

        var data = {
            labels: chartLabels,
            /* datasets: [{
                data: [0, 10, 20, 30, 100, 40, 56, 60, 70, 91, 300],
                backgroundColor: chartUtils.getPieChartColorsList()

            }] */
            datasets: [{
                data: chartData,
                label: "Acumulado",
                borderColor: "#3e95cd",
                fill: true
            },
                ...extraChartData
            ]
        };


        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: customOptions
        });
    },
    setupPatrimonyProjectionsList(resp) {
        $("#patrimony-projections-table").html(Stats.renderPatrimonyProjectionsTable(resp))
        tableUtils.setupStaticTable("#ev-pat-projections-table")
    },
    getInitialAssetsBalance() {
        const allAccs = LocalDataManager.getUserAccounts()
        const assetsAccounts = allAccs.filter(function (acc) {
            return acc.type === "CHEAC" || acc.type === "SAVAC"
                || acc.type === "INVAC" || acc.type === "OTHACC"
        })

        let assetsBalance = assetsAccounts.reduce((acc, val) => {
            return acc + parseFloat(val.balance)
        }, 0)

        return assetsBalance
    },
    renderPatrimonyProjectionsTable: budgets => {
        return `
        <table id="ev-pat-projections-table" class="centered" style="margin-top: 10px;">
            <thead>
                <tr>
                    <th>Mês</th>
                    <th>Balanço Prévio<span class="projections-table-footnotes">*</span></th>
                    <th>Balanço Final<span class="projections-table-footnotes">*</span></th>
                    <th>Balanço Final - ATIVOS<span class="projections-table-footnotes">**</span></th>
                    <th>Crescimento</th>
                </tr>
            </thead>
            <tbody>
                ${budgets.map((budget, index) => Stats.renderPatrimonyProjectionsTableRow(budget)).join("")}
            </tbody>
        </table>
        <style>
            .projections-table-footnotes{
                font-size: small;
            }
        </style>
        <p class="right-align grey-text text-accent-4 projections-table-footnotes">* Este é um valor projetado através dos dados orçamentados</p>
        <p class="right-align grey-text text-accent-4 projections-table-footnotes">** Este é um valor projetado através dos dados orçamentados, desconsiderando o passivo</p>
      `
    },
    renderPatrimonyProjectionsTableRow: (budget) => {
        return `
        <tr>
            <td>${budget.month}/${budget.year}</td>
            <td>${StringUtils.formatStringToCurrency(budget.planned_initial_balance)}</td>
            <td>${StringUtils.formatStringToCurrency(budget.planned_final_balance)}</td>
            <td>${StringUtils.formatStringToCurrency(budget.planned_final_balance_assets_only/*Stats.getFinalBalanceForAssetsOnly(budget.planned_final_balance)*/)}</td>
            <td>${(budget.planned_initial_balance) ? Stats.calculateGrowthPercentage(budget.planned_initial_balance, budget.planned_final_balance) : "-"}</td>
        </tr>
      `
    },
    getFinalBalanceForAssetsOnly: (totalBalance) => {
        const debtAccounts = LocalDataManager.getDebtAccounts()
        let debtTotals = debtAccounts.reduce((acc, val) => {
            return acc + parseFloat(val.balance)
        }, 0)

        return totalBalance - debtTotals
    },
    setupPatrimonyProjectionsLineChart: (chartData, chartLabels, extraChartData) => {
        var ctx = document.getElementById("chart_pie_patrimony_projection").getContext('2d');

        const chartTitle = "Projeção de Evolução do Património"
        var customOptions = {
            title: {
                display: true,
                text: chartTitle,
                position: "top",
                fontColor: "white"
            },
            legend: {
                labels: {
                    fontColor: 'rgba(255, 255, 255, 0.7)'
                }
            },
        }

        var data = {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                label: "Balanço Projetado (Ativos + Passivos)",
                borderColor: "#3e95cd",
                fill: true
            },
                ...extraChartData
            ]
        };


        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: customOptions
        });
    },
}

//# sourceURL=js/stats.js