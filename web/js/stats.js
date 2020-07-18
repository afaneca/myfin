"use strict";

var Stats = {
    init: () => {
        let cData = [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000];
        let cLabels = ["01/2020", "02/2020", "03/2020", "04/2020", "05/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020"];

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
    transformList: list => {
        let tempList = []
        let cLabels = []
        let cData = []
        let accsList = []
        let extraChartData = []
        /**
         * [account_id] = { }
         */
        accsList = CookieUtils.getUserAccounts()


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
    }, setupPatrimonyLineChart: (chartData, chartLabels, extraChartData) => {
        var ctx = document.getElementById("chart_pie_patrimony_evolution").getContext('2d');

        const chartTitle = "Evolução do Património"
        var customOptions = {
            title: {
                display: true,
                text: chartTitle,
                position: "top"
            }
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
    }
}

//# sourceURL=js/stats.js