import { LayoutUtils } from "../utils/layoutUtils.js";
import { chartUtils } from "../utils/chartUtils.js";
import { StringUtils } from "../utils/stringUtils.js";
import { Localization } from "../utils/localization.js";

export const InvestmentDashboardChartsFunc = {
  buildInvestmentsvolutionLineChart: (canvasId, chartLabels, chartData, extraChartData) => {
    var ctx = document.getElementById(canvasId).getContext('2d')

    const chartTitle = Localization.getString('investments.portfolioEvolution')
    var customOptions = {
      scales: {
        y: {
          ticks: {
            color: LayoutUtils.getCSSVariableValue('--main-text-color'),
            beginAtZero: true,
          },
        },
        x: {
          ticks: {
            color: LayoutUtils.getCSSVariableValue('--main-text-color'),
            beginAtZero: true,
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          position: 'top',
          color: LayoutUtils.getCSSVariableValue('--main-text-headline-color'),
        },
        legend: {
          labels: {
            color: LayoutUtils.getCSSVariableValue('--main-text-color'),
          },
          display: false,
        },
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']]
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(tooltipItem.value/*data['datasets'][0]['data'][tooltipItem['index']]*/)
          },
          afterLabel: (tooltipItem, data) => {
          },
        },
      },
    }

    var data = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          label: Localization.getString('common.accumulated'),
          borderColor: '#3e95cd',
          fill: true,
          /*lineTension: 0,*/
        },
        ...extraChartData,
      ],
    }

    var myLineChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: customOptions,
    })
  },
  buildDashboardAssetsDistributionPieChartv2: (elementId, chartData) => {
    $('#' + elementId).empty()
    window.morrisObj = new Morris.Donut({
      element: elementId,
      data: chartData,
      colors: chartUtils.getPieChartColorsList(),
      labelColor: LayoutUtils.getCurrentThemeName() === MYFIN.APP_THEMES.LIGHT ? '#2f2d2d' : '#ffffff',
      resize: true,
      formatter: (y, data) => {
        return parseFloat(y).toFixed(2) + '%'
      },
    })
  },
  buildDashboardAssetsDistributionPieChart: (canvasId, chartLabels, chartData, chartTitle) => {
    var ctx = document.getElementById(canvasId).getContext('2d')

    var customOptions = {
      borderWidth: 0,
      cutoutPercentage: 70,
      title: {
        display: true,
        text: chartTitle,
        position: 'top',
      },
      legend: {
        labels: {
          fontColor: LayoutUtils.getCSSVariableValue('--main-text-color'),
        },
        display: false,
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']]
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(data['datasets'][0]['data'][tooltipItem['index']])
          },
          afterLabel: (tooltipItem, data) => {
            var dataset = data['datasets'][0]
            //debugger
            //var metaData = dataset["_meta"].find(x => x !== undefined);
            var totalAmount = (() => {
              return dataset.data.reduce((acc, item) => {
                return acc + Math.abs(parseFloat(item))
              }, 0)
            })()
            //debugger
            var percent = Math.abs(Math.round((dataset['data'][tooltipItem['index']] / totalAmount) * 100))
            return '(' + percent + '%)'
          },
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              fontColor: LayoutUtils.getCSSVariableValue('--main-text-color'),
            },
          }],
        xAxes: [
          {
            ticks: {
              fontColor: LayoutUtils.getCSSVariableValue('--main-text-color'),
            },
          }],
      },
    }

    var chartDataVar = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: chartUtils.getPieChartGradientsList(ctx),

        }],
    }

    var myPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartDataVar,
      options: customOptions,
    })

    return myPieChart
  },
}

//# sourceURL=js/funcs/investmentDashboardChartsFunc.js