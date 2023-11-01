import { LayoutUtils } from "./layoutUtils.js";
import { ArrayUtils } from "./arrayUtils.js";
import { StringUtils } from "./stringUtils.js";
import {Localization} from "./localization.js";

let red_gradient,
  green_gradient,
  orange_gradient,
  blue_gradient,
  dark_gray_gradient,
  purple_gradient,
  pink_gradient,
  dark_blue_gradient,
  brown_gradient,
  light_green_gradient,
  dark_red_gradient,
  yellow_gradient,
  roseanna_gradient,
  mauve_gradient,
  lush_gradient,
  pale_wood_gradient,
  aubergine_gradient,
  orange_coral_gradient,
  decent_gradient,
  dusk_gradient

export const chartUtils = {
  setupAngularChart: (
    elementID, chartData, customText, customLabels, usedRatio = 0.5) => {

    if (customText) {
      Chart.pluginService.register({
        beforeDraw: function (chart) {
          if (chart.config.options.elements.center) {
            //Get ctx from string
            var ctx = chart.chart.ctx

            //Get options from the center object in options
            var centerConfig = chart.config.options.elements.center
            var fontStyle = centerConfig.fontStyle || 'Arial'
            var txt = centerConfig.text
            var color = centerConfig.color || '#fff'
            var sidePadding = centerConfig.sidePadding || 20
            var sidePaddingCalculated = (sidePadding / 100) *
              (chart.innerRadius * 2)
            //Start with a base font of 30px
            ctx.font = '30px ' + fontStyle

            //Get the width of the string and also the width of the element
            // minus 10 to give it 5px side padding
            var stringWidth = ctx.measureText(txt).width
            var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated

            // Find out how much the font can grow in width.
            var widthRatio = elementWidth / stringWidth
            var newFontSize = Math.floor(20 * widthRatio)
            var elementHeight = (chart.innerRadius * 2)

            // Pick a new font sizeso it will not be larger than the height of
            // label.
            var fontSizeToUse = Math.min(newFontSize, elementHeight)

            //Set font settings to draw it correctly.
            ctx.textAlign = 'center'
            ctx.textBaseline = 'center'
            var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2)
            var centerY = chart.chartArea.bottom - 20 //((chart.chartArea.top
            // +
            // chart.chartArea.bottom)
            // / 2);
            ctx.font = fontSizeToUse + 'px ' + fontStyle
            ctx.fillStyle = color

            //Draw text in center
            ctx.fillText(txt, centerX, centerY)
          }
        },
      })
    }

    var ctx = document.getElementById(elementID).getContext('2d')

    var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0)
    if ((Math.abs(usedRatio) >= 1)) {
      gradientStroke.addColorStop(0, '#ff5252')
      gradientStroke.addColorStop(1, '#f48fb1')
    }
    else if ((Math.abs(usedRatio) > 0.75)) {
      gradientStroke.addColorStop(0, '#ff6f00')
      gradientStroke.addColorStop(1, '#ffca28')
    }
    else {
      gradientStroke.addColorStop(0, '#43a047')
      gradientStroke.addColorStop(1, '#1de9b6')
    }

    var customData = {
      datasets: [
        {
          data: chartData,
          backgroundColor: [
            gradientStroke,
            /*'#d5d5d5',*/
            LayoutUtils.getCSSVariableValue(
              '--main-dashboard-angular-chart-background'),
            /*'#1f2029'*/
          ],
          borderWidth: 0,

        }],
      labels: customLabels,
    }

    var customOptions = {
      aspectRatio: 1.5,
      maintainAspectRatio: true,
      responsive: true,
      rotation: -90,
      circumference: 180,
      cutout: '70%',
      layout: {
        padding: {
          left: 0,
          top: 10,
          right: 10,
          bottom: 0,
        },
      },
      elements: {
        center: {
          text: customText,
          color: '#fff', // Default is #000000
          fontStyle: 'Arial', // Default is Arial
          sidePadding: 10, // Default is 20 (as a percentage)
        },
      },
      plugins: {
        legend: {
          display: false,
          labels: {
            color: LayoutUtils.getCSSVariableValue('--main-text-headline-color'),
          },
        },
        title: {
          display: true,
          text: Localization.getString('dashboard.monthlyOverview'),
          position: 'bottom',
          color: LayoutUtils.getCSSVariableValue('--main-text-headline-color'),
          padding: {
            top: -20,
          },
        },
      },

      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']]
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(
              data['datasets'][0]['data'][tooltipItem['index']])
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
            var percent = Math.abs(Math.round(
              (dataset['data'][tooltipItem['index']] / totalAmount) * 100))
            return '(' + percent + '%)'
          },
        },
      },
    }

    return new Chart(ctx, {
      type: 'doughnut',
      data: customData,
      options: customOptions,
    })
  },
  setupPieChart: (elementID, chartData, chartLabels, chartTitle) => {
    var ctx = document.getElementById(elementID).getContext('2d')

    var customOptions = {

      plugins: {
        title: {
          display: true,
          text: chartTitle,
          position: 'top',
          color: LayoutUtils.getCSSVariableValue('--main-text-headline-color'),
        },
        legend: {
          labels: {
            color: LayoutUtils.getCurrentThemeName() === MYFIN.APP_THEMES.LIGHT ? '#000000' : '#ffffff',
          },
        },
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']]
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(
              data['datasets'][0]['data'][tooltipItem['index']])
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
            var percent = Math.abs(Math.round(
              (dataset['data'][tooltipItem['index']] / totalAmount) * 100))
            return '(' + percent + '%)'
          },
        },
      },
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
    }

    var chartData = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: chartUtils.getPieChartGradientsList(ctx),

        }],
    }

    var myPieChart = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: customOptions,
    })

    return myPieChart
  },
  setupDistributionPieChart: (
    elementID, chartData, chartLabels, chartTitle) => {
    var ctx = document.getElementById(elementID).getContext('2d')

    var customOptions = {
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          position: 'top',
        },
        legend: {
          labels: {
            color: LayoutUtils.getCSSVariableValue('--main-text-color'),
          },
        },
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']]
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(
              data['datasets'][0]['data'][tooltipItem['index']])
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
            var percent = Math.abs(Math.round(
              (dataset['data'][tooltipItem['index']] / totalAmount) * 100))
            return '(' + percent + '%)'
          },
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              color: LayoutUtils.getCSSVariableValue('--main-text-color'),
            },
          }],
        xAxes: [
          {
            ticks: {
              color: LayoutUtils.getCSSVariableValue('--main-text-color'),
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
      type: 'pie',
      data: chartDataVar,
      options: customOptions,
    })

    return myPieChart
  },
  setupDebtDistributionPieChart: (
    elementID, chartData, chartLabels, chartTitle, catColors) => {
    var ctx = document.getElementById(elementID).getContext('2d')
    if (!catColors) {
      catColors = []
    }
    var catColorsArr = []

    for (var i = 0; i < catColors.length; i++) {
      let colorGradient
      let gradientsArr = chartUtils.getPieChartGradientsList(ctx)
      if (catColors[i]) {
        colorGradient = eval(catColors[i].replaceAll('-', '_'))
      }
      else {
        colorGradient = gradientsArr[0]
      }
      catColorsArr.push(colorGradient)
    }
    var customOptions = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
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
            filter: (legendItem, data) => showOnlyTopLegendsFilter(legendItem, 5),
          },
        },
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']]
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(
              data['datasets'][0]['data'][tooltipItem['index']])
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
            var percent = Math.abs(Math.round(
              (dataset['data'][tooltipItem['index']] / totalAmount) * 100))
            return '(' + percent + '%)'
          },
        },
      },
      /*scales: {
          yAxes: [{
              ticks: {
                  fontColor: LayoutUtils.getCSSVariableValue('--main-text-color'),
              }
          }],
          xAxes: [{
              ticks: {
                  fontColor: LayoutUtils.getCSSVariableValue('--main-text-color'),
              }
          }]
      }*/
    }

    function showOnlyTopLegendsFilter (legendItem, legendsNr) {
      let label = legendItem.text
      if (typeof (label) !== 'undefined') {
        if (legendItem.index >= legendsNr) {
          return false
        }
      }
      return label
    }

    var chartDataVar = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: (catColorsArr.length > 0)
            ? catColorsArr
            : chartUtils.getPieChartGradientsList(ctx),

        }],
    }

    var myPieChart = new Chart(ctx, {
      type: 'pie',
      data: chartDataVar,
      options: customOptions,
    })

    return myPieChart
  },
  setupSimpleLineChart: (elementID, chartData, chartLabels, chartTitle) => {
    const ctx = document.getElementById(elementID).getContext('2d')

    const customOptions = {
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          position: 'top',
        },
      },
    }

    const data = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          label: '',
          borderColor: '#3e95cd',
          fill: true,
        },
      ],
    }

    return new Chart(ctx, {
      type: 'line',
      data: data,
      options: customOptions,
    })
  },
  getPieChartColorsList: () => {
    return ArrayUtils.shuffle([
      '#F44336',
      '#E91E63',
      '#9C27B0',
      '#673AB7',
      '#3F51B5',
      '#2196F3',
      '#03A9F4',
      '#00BCD4',
      '#009688',
      '#4CAF50',
      '#8BC34A',
      '#CDDC39',
      '#FFEB3B',
      '#FFC107',
      '#FF9800',
      '#FF5722',
      '#795548',
      '#9E9E9E',
      '#607D8B',
      /*'#000000'*/
    ])
  },
  getRandomVariantOfGreen: () => {
    const variants = [
      '#0a790a',
      '#008000',
      '#085308',
      '#084508',
      '#209720',
      '#2cb62c',
      '#3bce3b',
      '#56f156',
      '#12e312',
      '#347f34',
    ]

    return ArrayUtils.shuffle(variants)[0]
  },
  getRandomVariantOfOrange: () => {
    const variants = [
      'orange',
      '#ff7b72',
      '#dc5e57',
      '#bd3d35',
      '#951d16',
      '#7b2623',
      '#974544',
      '#aa5832',
      '#d76c42',
      '#d0410d',
    ]

    return ArrayUtils.shuffle(variants)[0]
  },
  getPieChartGradientsList: (ctx) => {
    red_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    red_gradient.addColorStop(0, '#ff5252')
    red_gradient.addColorStop(1, '#f48fb1')

    green_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    green_gradient.addColorStop(0, '#43a047')
    green_gradient.addColorStop(1, '#1de9b6')

    orange_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    orange_gradient.addColorStop(0, '#ff6f00')
    orange_gradient.addColorStop(1, '#ffca28')

    blue_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    blue_gradient.addColorStop(0, '#0288d1')
    blue_gradient.addColorStop(1, '#26c6da')
    //
    dark_gray_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    dark_gray_gradient.addColorStop(0, '#29323c')
    dark_gray_gradient.addColorStop(1, '#485563')

    purple_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    purple_gradient.addColorStop(0, '#667eea')
    purple_gradient.addColorStop(1, '#764ba2')

    pink_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    pink_gradient.addColorStop(0, '#ee9ca7')
    pink_gradient.addColorStop(1, '#ffdde1')

    dark_blue_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    dark_blue_gradient.addColorStop(0, '#243949')
    dark_blue_gradient.addColorStop(1, '#517fa4')

    brown_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    brown_gradient.addColorStop(0, '#c79081')
    brown_gradient.addColorStop(1, '#dfa579')

    light_green_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    light_green_gradient.addColorStop(0, '#96e6a1')
    light_green_gradient.addColorStop(1, '#d4fc79')

    dark_red_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    dark_red_gradient.addColorStop(0, '#ED213A')
    dark_red_gradient.addColorStop(1, '#93291E')

    yellow_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    yellow_gradient.addColorStop(0, '#FFE884')
    yellow_gradient.addColorStop(1, '#FFF493')

    roseanna_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    roseanna_gradient.addColorStop(0, '#ffafbd')
    roseanna_gradient.addColorStop(1, '#ffc3a0')

    mauve_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    mauve_gradient.addColorStop(0, '#42275a')
    mauve_gradient.addColorStop(1, '#734b6d')

    lush_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    lush_gradient.addColorStop(0, '#56ab2f')
    lush_gradient.addColorStop(1, '#a8e063')

    pale_wood_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    pale_wood_gradient.addColorStop(0, '#eacda3')
    pale_wood_gradient.addColorStop(1, '#d6ae7b')

    aubergine_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    aubergine_gradient.addColorStop(0, '#aa076b')
    aubergine_gradient.addColorStop(1, '#61045f')

    orange_coral_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    orange_coral_gradient.addColorStop(0, '#ff9966')
    orange_coral_gradient.addColorStop(1, '#ff5e62')

    decent_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    decent_gradient.addColorStop(0, '#4ca1af')
    decent_gradient.addColorStop(1, '#c4e0e5')

    dusk_gradient = ctx.createLinearGradient(500, 0, 100, 0)
    dusk_gradient.addColorStop(0, '#ffd89b')
    dusk_gradient.addColorStop(1, '#19547b')

    return ArrayUtils.shuffle([
      red_gradient,
      green_gradient,
      orange_gradient,
      blue_gradient,
      dark_gray_gradient,
      purple_gradient,
      pink_gradient,
      dark_blue_gradient,
      brown_gradient,
      light_green_gradient,
      dark_red_gradient,
      yellow_gradient,
      roseanna_gradient,
      mauve_gradient,
      lush_gradient,
      pale_wood_gradient,
      aubergine_gradient,
      orange_coral_gradient,
      decent_gradient,
      dusk_gradient,
    ])
  },
  getColorGradientsArr: (catColorGradient) => {
    return [
      {
        id: 'red-gradient',
        text: '<div style="width: 75px; height: 50px;" class="red-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="red-gradient-bg"></div>',
        title: 'red-gradient',
        selected: (catColorGradient == 'red-gradient'),
      },
      {
        id: 'blue-gradient',
        text: '<div style="width: 75px; height: 50px;" class="blue-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="blue-gradient-bg"></div>',
        title: 'blue-gradient',
        selected: (catColorGradient == 'blue-gradient'),
      }, {
        id: 'green-gradient',
        text: '<div style="width: 75px; height: 50px;" class="green-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="green-gradient-bg"></div>',
        title: 'green-gradient',
        selected: (catColorGradient == 'green-gradient'),
      }, {
        id: 'orange-gradient',
        text: '<div style="width: 75px; height: 50px;" class="orange-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="orange-gradient-bg"></div>',
        title: 'orange-gradient',
        selected: (catColorGradient == 'orange-gradient'),
      }, {
        id: 'dark-gray-gradient',
        text: '<div style="width: 75px; height: 50px;" class="blue-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="blue-gradient-bg"></div>',
        title: 'dark-gray-gradient',
        selected: (catColorGradient == 'dark-gray-gradient'),
      }, {
        id: 'purple-gradient',
        text: '<div style="width: 75px; height: 50px;" class="purple-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="purple-gradient-bg"></div>',
        title: 'purple-gradient',
        selected: (catColorGradient == 'purple-gradient'),
      }, {
        id: 'pink-gradient',
        text: '<div style="width: 75px; height: 50px;" class="pink-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="pink-gradient-bg"></div>',
        title: 'pink-gradient',
        selected: (catColorGradient == 'pink-gradient'),
      }, {
        id: 'dark-blue-gradient',
        text: '<div style="width: 75px; height: 50px;" class="dark-blue-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="dark-blue-gradient-bg"></div>',
        title: 'dark-blue-gradient',
        selected: (catColorGradient == 'dark-blue-gradient'),
      }, {
        id: 'brown-gradient',
        text: '<div style="width: 75px; height: 50px;" class="brown-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="brown-gradient-bg"></div>',
        title: 'brown-gradient',
        selected: (catColorGradient == 'brown-gradient'),
      }, {
        id: 'light-green-gradient',
        text: '<div style="width: 75px; height: 50px;" class="light-green-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="light-green-gradient-bg"></div>',
        title: 'light-green-gradient',
        selected: (catColorGradient == 'light-green-gradient'),
      }, {
        id: 'dark-red-gradient',
        text: '<div style="width: 75px; height: 50px;" class="dark-red-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="dark-red-gradient-bg"></div>',
        title: 'dark-red-gradient',
        selected: (catColorGradient == 'dark-red-gradient'),
      }, {
        id: 'yellow-gradient',
        text: '<div style="width: 75px; height: 50px;" class="yellow-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="yellow-gradient-bg"></div>',
        title: 'yellow-gradient',
        selected: (catColorGradient == 'yellow-gradient'),
      }, {
        id: 'roseanna-gradient',
        text: '<div style="width: 75px; height: 50px;" class="roseanna-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="roseanna-gradient-bg"></div>',
        title: 'roseanna-gradient',
        selected: (catColorGradient == 'roseanna-gradient'),
      },
      {
        id: 'mauve-gradient',
        text: '<div style="width: 75px; height: 50px;" class="mauve-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="mauve-gradient-bg"></div>',
        title: 'mauve-gradient',
        selected: (catColorGradient == 'mauve-gradient'),
      }, {
        id: 'lush-gradient',
        text: '<div style="width: 75px; height: 50px;" class="lush-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="lush-gradient-bg"></div>',
        title: 'lush-gradient',
        selected: (catColorGradient == 'lush-gradient'),
      }, {
        id: 'pale-wood-gradient',
        text: '<div style="width: 75px; height: 50px;" class="pale-wood-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="pale-wood-gradient-bg"></div>',
        title: 'pale-wood-gradient',
        selected: (catColorGradient == 'pale-wood-gradient'),
      }, {
        id: 'aubergine-gradient',
        text: '<div style="width: 75px; height: 50px;" class="aubergine-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="aubergine-gradient-bg"></div>',
        title: 'aubergine-gradient',
        selected: (catColorGradient == 'aubergine-gradient'),
      }, {
        id: 'orange-coral-gradient',
        text: '<div style="width: 75px; height: 50px;" class="orange-coral-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="orange-coral-gradient-bg"></div>',
        title: 'orange-coral-gradient',
        selected: (catColorGradient == 'orange-coral-gradient'),
      }, {
        id: 'decent-gradient',
        text: '<div style="width: 75px; height: 50px;" class="decent-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="decent-gradient-bg"></div>',
        title: 'decent-gradient',
        selected: (catColorGradient == 'decent-gradient'),
      }, {
        id: 'dusk-gradient',
        text: '<div style="width: 75px; height: 50px;" class="dusk-gradient-bg"></div>',
        html: '<div style="width: 75px; height: 50px;" class="dusk-gradient-bg"></div>',
        title: 'dusk-gradient',
        selected: (catColorGradient == 'dusk-gradient'),
      },

    ]
  },
  addData: (chart, label, data) => {
    chart.data.labels.push(label)
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(data)
    })
    chart.update()
  },
  removeData: (chart) => {
    chart.destroy()
  },
  getTrendLineObject: () => {
    return {
      style: 'rgb(66, 87, 255, 0.3)',
      colorMin: 'rgb(86, 87, 255, 0.3)',
      colorMax: 'rgba(86,87,255,0.7)',
      lineStyle: 'dotted|solid',
      width: 2,
      projection: true,
    }
  },
  getDefaultCustomOptionsForLineChart: (chartTitle) => {
    return {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          position: 'top',
          color: LayoutUtils.getCSSVariableValue('--main-text-color'),
        },
        legend: {
          labels: {
            color: LayoutUtils.getCSSVariableValue('--main-text-color'),
          },
        },
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']]
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(tooltipItem.value)
          },
        },
      },
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
    }
  },
  setupSankeyChart: (chartId, label, dataset, getColor) => {
    var ctx = document.getElementById(chartId).getContext('2d')

    var colors = {
      Oil: 'black',
      Coal: 'gray',
      'Fossil Fuels': 'slategray',
      Electricity: 'blue',
      Energy: 'orange',
    }

    // the y-order of nodes, smaller = higher
    return new Chart(ctx, {
      type: 'sankey',
      data: {
        datasets: [
          {
            label: label,
            data: dataset,
            /*priority,*/
            /*labels,*/
            colorFrom: (c) => getColor(c.dataset.data[c.dataIndex].from, true),
            colorTo: (c) => getColor(c.dataset.data[c.dataIndex].to, false),
            colorMode: 'gradient',
            borderWidth: 0,
            borderColor: 'black',
            size: 'max',
          },
        ],
      },
    })

  },
}

//# sourceURL=js/utils/chartUtils.js