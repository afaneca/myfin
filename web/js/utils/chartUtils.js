"use strict";


var chartUtils = {
    setupAngularChart: (elementID, chartData, customText, customLabels, usedRatio = 0.5) => {

        if (customText) {
            Chart.pluginService.register({
                beforeDraw: function (chart) {
                    if (chart.config.options.elements.center) {
                        //Get ctx from string
                        var ctx = chart.chart.ctx;


                        //Get options from the center object in options
                        var centerConfig = chart.config.options.elements.center;
                        var fontStyle = centerConfig.fontStyle || 'Arial';
                        var txt = centerConfig.text;
                        var color = centerConfig.color || '#000';
                        var sidePadding = centerConfig.sidePadding || 20;
                        var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
                        //Start with a base font of 30px
                        ctx.font = "30px " + fontStyle;

                        //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
                        var stringWidth = ctx.measureText(txt).width;
                        var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

                        // Find out how much the font can grow in width.
                        var widthRatio = elementWidth / stringWidth;
                        var newFontSize = Math.floor(20 * widthRatio);
                        var elementHeight = (chart.innerRadius * 2);

                        // Pick a new font size so it will not be larger than the height of label.
                        var fontSizeToUse = Math.min(newFontSize, elementHeight);

                        //Set font settings to draw it correctly.
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'center';
                        var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
                        var centerY = chart.chartArea.bottom - 20; //((chart.chartArea.top + chart.chartArea.bottom) / 2);
                        ctx.font = fontSizeToUse + "px " + fontStyle;
                        ctx.fillStyle = color;

                        //Draw text in center
                        ctx.fillText(txt, centerX, centerY);
                    }
                }
            });
        }

        var ctx = document.getElementById(elementID).getContext('2d');

        var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
        if ((Math.abs(usedRatio) >= 1)) {
            gradientStroke.addColorStop(0, "#ff5252");
            gradientStroke.addColorStop(1, "#f48fb1");
        } else if ((Math.abs(usedRatio) > 0.75)) {
            gradientStroke.addColorStop(0, "#ff6f00");
            gradientStroke.addColorStop(1, "#ffca28");
        } else {
            gradientStroke.addColorStop(0, "#43a047");
            gradientStroke.addColorStop(1, "#1de9b6");
        }


        var customData = {
            datasets: [{
                data: chartData,
                backgroundColor: [
                    gradientStroke,
                    '#d5d5d5',
                ],
                borderWidth: 1,

            }],
            labels: customLabels,
        };

        var customOptions = {
            rotation: 1 * Math.PI,
            circumference: Math.PI,
            cutoutPercentage: 70,
            elements: {
                center: {
                    text: customText,
                    color: '#000000', // Default is #000000
                    fontStyle: 'Arial', // Default is Arial
                    sidePadding: 10 // Defualt is 20 (as a percentage)
                }
            },
            legend: {
                display: false
            },
            title: {
                display: true,
                text: "Overview Mensal",
                position: "bottom"
            },
            tooltips: {
                callbacks: {
                    title: function (tooltipItem, data) {
                        return data['labels'][tooltipItem[0]['index']];
                    },
                    label: (tooltipItem, data) => {
                        return StringUtils.formatStringToCurrency(data['datasets'][0]['data'][tooltipItem['index']])
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
                    }
                }
            }
        }

        var myPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: customData,
            options: customOptions
        });


        return myPieChart
    },
    setupPieChart: (elementID, chartData, chartLabels, chartTitle) => {
        var ctx = document.getElementById(elementID).getContext('2d');

        var customOptions = {
            title: {
                display: true,
                text: chartTitle,
                position: "top"
            },
            tooltips: {
                callbacks: {
                    title: function (tooltipItem, data) {
                        debugger
                        return data['labels'][tooltipItem[0]['index']];
                    },
                    label: (tooltipItem, data) => {
                        return StringUtils.formatStringToCurrency(data['datasets'][0]['data'][tooltipItem['index']])
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
                    }
                }
            }
        }

        var chartData = {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: chartUtils.getPieChartGradientsList(ctx)

            }]
        };

        var myPieChart = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: customOptions
        });

        return myPieChart
    },
    setupDebtDistributionPieChart: (elementID, chartData, chartLabels, chartTitle) => {
        var ctx = document.getElementById(elementID).getContext('2d');

        var customOptions = {
            title: {
                display: true,
                text: chartTitle,
                position: "top"
            },
            tooltips: {
                callbacks: {
                    title: function (tooltipItem, data) {
                        return data['labels'][tooltipItem[0]['index']];
                    },
                    label: (tooltipItem, data) => {
                        return StringUtils.formatStringToCurrency(data['datasets'][0]['data'][tooltipItem['index']])
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
                    }
                }
            }
        }

        var chartDataVar = {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: chartUtils.getPieChartGradientsList(ctx)

            }]
        };

        var myPieChart = new Chart(ctx, {
            type: 'pie',
            data: chartDataVar,
            options: customOptions
        });

        return myPieChart
    },
    setupSimpleLineChart: (elementID, chartData, chartLabels, chartTitle) => {
        var ctx = document.getElementById(elementID).getContext('2d');

        var customOptions = {
            title: {
                display: true,
                text: chartTitle,
                position: "top"
            }
        }

        var data = {
            labels: chartLabels,
            /* datasets: [{
                data: [0, 10, 20, 30, 100, 40, 56, 60, 70, 91, 300],
                backgroundColor: chartUtils.getPieChartColorsList()

            }] */
            datasets: [{
                data: chartData,
                label: "Africa",
                borderColor: "#3e95cd",
                fill: true
            },
            ]
        };


        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: customOptions
        });

        return myLineChart
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
            '#000000'
        ]);
    },
    getPieChartGradientsList: (ctx) => {
        var redGradient = ctx.createLinearGradient(500, 0, 100, 0);
        redGradient.addColorStop(0, "#ff5252");
        redGradient.addColorStop(1, "#f48fb1");

        var greenGradient = ctx.createLinearGradient(500, 0, 100, 0);
        greenGradient.addColorStop(0, "#43a047");
        greenGradient.addColorStop(1, "#1de9b6");

        var orangeGradient = ctx.createLinearGradient(500, 0, 100, 0);
        orangeGradient.addColorStop(0, "#ff6f00");
        orangeGradient.addColorStop(1, "#ffca28");

        var blueGradient = ctx.createLinearGradient(500, 0, 100, 0);
        blueGradient.addColorStop(0, "#0288d1");
        blueGradient.addColorStop(1, "#26c6da");

        var darkGrayGradient = ctx.createLinearGradient(500, 0, 100, 0);
        darkGrayGradient.addColorStop(0, "#29323c");
        darkGrayGradient.addColorStop(1, "#485563");

        var purpleGradient = ctx.createLinearGradient(500, 0, 100, 0);
        purpleGradient.addColorStop(0, "#667eea");
        purpleGradient.addColorStop(1, "#764ba2");

        var pinkGradient = ctx.createLinearGradient(500, 0, 100, 0);
        pinkGradient.addColorStop(0, "#ee9ca7");
        pinkGradient.addColorStop(1, "#ffdde1");

        var darkBlueGradient = ctx.createLinearGradient(500, 0, 100, 0);
        darkBlueGradient.addColorStop(0, "#243949");
        darkBlueGradient.addColorStop(1, "#517fa4");

        var brownGradient = ctx.createLinearGradient(500, 0, 100, 0);
        brownGradient.addColorStop(0, "#c79081");
        brownGradient.addColorStop(1, "#dfa579");

        var lightGreenGradient = ctx.createLinearGradient(500, 0, 100, 0);
        lightGreenGradient.addColorStop(0, "#96e6a1");
        lightGreenGradient.addColorStop(1, "#d4fc79");

        var darkRedGradient = ctx.createLinearGradient(500, 0, 100, 0);
        darkRedGradient.addColorStop(0, "#ED213A");
        darkRedGradient.addColorStop(1, "#93291E");

        var yellowGradient = ctx.createLinearGradient(500, 0, 100, 0);
        yellowGradient.addColorStop(0, "#FFE884");
        yellowGradient.addColorStop(1, "#FFF493");

        return ArrayUtils.shuffle([
            redGradient,
            greenGradient,
            orangeGradient,
            blueGradient,
            darkGrayGradient,
            purpleGradient,
            pinkGradient,
            darkBlueGradient,
            brownGradient,
            lightGreenGradient,
            darkRedGradient,
            yellowGradient,
        ]);
    },
    addData: (chart, label, data) => {
        chart.data.labels.push(label);
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(data);
        });
        chart.update();
    },
    removeData: (chart) => {
        chart.data.labels = []
        chart.data.datasets.forEach((dataset) => {
            dataset.data = []
        });
        chart.update();
    },
}