"use strict";

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
                        var color = centerConfig.color || '#fff';
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
                    /*'#d5d5d5',*/
                    LayoutUtils.getCSSVariableValue('--main-dashboard-angular-chart-background')
                    /*'#1f2029'*/
                ],
                borderWidth: 0,

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
                    color: '#fff', // Default is #000000
                    fontStyle: 'Arial', // Default is Arial
                    sidePadding: 10 // Defualt is 20 (as a percentage)
                }
            },
            legend: {
                display: false,
                labels: {
                    fontColor: LayoutUtils.getCSSVariableValue("--main-text-headline-color")
                }
            },
            title: {
                display: true,
                text: "Overview Mensal",
                position: "bottom",
                fontColor: LayoutUtils.getCSSVariableValue("--main-text-headline-color")
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
                position: "top",
                fontColor: LayoutUtils.getCSSVariableValue("--main-text-headline-color")
            },
            legend: {
                labels: {
                    fontColor: LayoutUtils.getCSSVariableValue("--main-text-headline-color")
                }
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
    setupDistributionPieChart: (elementID, chartData, chartLabels, chartTitle) => {
        var ctx = document.getElementById(elementID).getContext('2d');

        var customOptions = {
            title: {
                display: true,
                text: chartTitle,
                position: "top"
            },
            legend: {
                labels: {
                    fontColor: LayoutUtils.getCSSVariableValue("--main-text-color")
                }
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
    setupDebtDistributionPieChart: (elementID, chartData, chartLabels, chartTitle, catColors) => {
        var ctx = document.getElementById(elementID).getContext('2d');
        if (!catColors) catColors = []
        var catColorsArr = []

        for (var i = 0; i < catColors.length; i++) {
            let colorGradient
            let gradientsArr = chartUtils.getPieChartGradientsList(ctx)
            if (catColors[i]) {
                colorGradient = eval(catColors[i].replaceAll("-", "_"))
            } else {
                colorGradient = gradientsArr[0]
            }
            catColorsArr.push(colorGradient)
        }

        var customOptions = {
            title: {
                display: true,
                text: chartTitle,
                position: "top",
                fontColor: LayoutUtils.getCSSVariableValue("--main-text-headline-color")
            },
            legend: {
                labels: {
                    fontColor: LayoutUtils.getCSSVariableValue("--main-text-color")
                }
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
                backgroundColor: (catColorsArr.length > 0) ? catColorsArr : chartUtils.getPieChartGradientsList(ctx),

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
        red_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        red_gradient.addColorStop(0, "#ff5252");
        red_gradient.addColorStop(1, "#f48fb1");

        green_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        green_gradient.addColorStop(0, "#43a047");
        green_gradient.addColorStop(1, "#1de9b6");

        orange_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        orange_gradient.addColorStop(0, "#ff6f00");
        orange_gradient.addColorStop(1, "#ffca28");

        blue_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        blue_gradient.addColorStop(0, "#0288d1");
        blue_gradient.addColorStop(1, "#26c6da");
        //
        dark_gray_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        dark_gray_gradient.addColorStop(0, "#29323c");
        dark_gray_gradient.addColorStop(1, "#485563");

        purple_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        purple_gradient.addColorStop(0, "#667eea");
        purple_gradient.addColorStop(1, "#764ba2");

        pink_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        pink_gradient.addColorStop(0, "#ee9ca7");
        pink_gradient.addColorStop(1, "#ffdde1");

        dark_blue_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        dark_blue_gradient.addColorStop(0, "#243949");
        dark_blue_gradient.addColorStop(1, "#517fa4");

        brown_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        brown_gradient.addColorStop(0, "#c79081");
        brown_gradient.addColorStop(1, "#dfa579");

        light_green_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        light_green_gradient.addColorStop(0, "#96e6a1");
        light_green_gradient.addColorStop(1, "#d4fc79");

        dark_red_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        dark_red_gradient.addColorStop(0, "#ED213A");
        dark_red_gradient.addColorStop(1, "#93291E");

        yellow_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        yellow_gradient.addColorStop(0, "#FFE884");
        yellow_gradient.addColorStop(1, "#FFF493");

        roseanna_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        roseanna_gradient.addColorStop(0, "#ffafbd");
        roseanna_gradient.addColorStop(1, "#ffc3a0");

        mauve_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        mauve_gradient.addColorStop(0, "#42275a");
        mauve_gradient.addColorStop(1, "#734b6d");

        lush_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        lush_gradient.addColorStop(0, "#56ab2f");
        lush_gradient.addColorStop(1, "#a8e063");

        pale_wood_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        pale_wood_gradient.addColorStop(0, "#eacda3");
        pale_wood_gradient.addColorStop(1, "#d6ae7b");

        aubergine_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        aubergine_gradient.addColorStop(0, "#aa076b");
        aubergine_gradient.addColorStop(1, "#61045f");

        orange_coral_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        orange_coral_gradient.addColorStop(0, "#ff9966");
        orange_coral_gradient.addColorStop(1, "#ff5e62");

        decent_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        decent_gradient.addColorStop(0, "#4ca1af");
        decent_gradient.addColorStop(1, "#c4e0e5");

        dusk_gradient = ctx.createLinearGradient(500, 0, 100, 0);
        dusk_gradient.addColorStop(0, "#ffd89b");
        dusk_gradient.addColorStop(1, "#19547b");

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
            dusk_gradient
        ]);
    },
    getColorGradientsArr: (catColorGradient) => {
        return [
            {
                id: 'red-gradient',
                text: '<div style="width: 75px; height: 50px;" class="red-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="red-gradient-bg"></div>',
                title: 'red-gradient',
                selected: (catColorGradient == 'red-gradient')
            },
            {
                id: 'blue-gradient',
                text: '<div style="width: 75px; height: 50px;" class="blue-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="blue-gradient-bg"></div>',
                title: 'blue-gradient',
                selected: (catColorGradient == 'blue-gradient')
            }, {
                id: 'green-gradient',
                text: '<div style="width: 75px; height: 50px;" class="green-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="green-gradient-bg"></div>',
                title: 'green-gradient',
                selected: (catColorGradient == 'green-gradient')
            }, {
                id: 'orange-gradient',
                text: '<div style="width: 75px; height: 50px;" class="orange-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="orange-gradient-bg"></div>',
                title: 'orange-gradient',
                selected: (catColorGradient == 'orange-gradient')
            }, {
                id: 'dark-gray-gradient',
                text: '<div style="width: 75px; height: 50px;" class="blue-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="blue-gradient-bg"></div>',
                title: 'dark-gray-gradient',
                selected: (catColorGradient == 'dark-gray-gradient')
            }, {
                id: 'purple-gradient',
                text: '<div style="width: 75px; height: 50px;" class="purple-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="purple-gradient-bg"></div>',
                title: 'purple-gradient',
                selected: (catColorGradient == 'purple-gradient')
            }, {
                id: 'pink-gradient',
                text: '<div style="width: 75px; height: 50px;" class="pink-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="pink-gradient-bg"></div>',
                title: 'pink-gradient',
                selected: (catColorGradient == 'pink-gradient')
            }, {
                id: 'dark-blue-gradient',
                text: '<div style="width: 75px; height: 50px;" class="dark-blue-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="dark-blue-gradient-bg"></div>',
                title: 'dark-blue-gradient',
                selected: (catColorGradient == 'dark-blue-gradient')
            }, {
                id: 'brown-gradient',
                text: '<div style="width: 75px; height: 50px;" class="brown-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="brown-gradient-bg"></div>',
                title: 'brown-gradient',
                selected: (catColorGradient == 'brown-gradient')
            }, {
                id: 'light-green-gradient',
                text: '<div style="width: 75px; height: 50px;" class="light-green-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="light-green-gradient-bg"></div>',
                title: 'light-green-gradient',
                selected: (catColorGradient == 'light-green-gradient')
            }, {
                id: 'dark-red-gradient',
                text: '<div style="width: 75px; height: 50px;" class="dark-red-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="dark-red-gradient-bg"></div>',
                title: 'dark-red-gradient',
                selected: (catColorGradient == 'dark-red-gradient')
            }, {
                id: 'yellow-gradient',
                text: '<div style="width: 75px; height: 50px;" class="yellow-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="yellow-gradient-bg"></div>',
                title: 'yellow-gradient',
                selected: (catColorGradient == 'yellow-gradient')
            }, {
                id: 'roseanna-gradient',
                text: '<div style="width: 75px; height: 50px;" class="roseanna-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="roseanna-gradient-bg"></div>',
                title: 'roseanna-gradient',
                selected: (catColorGradient == 'roseanna-gradient')
            },
            {
                id: 'mauve-gradient',
                text: '<div style="width: 75px; height: 50px;" class="mauve-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="mauve-gradient-bg"></div>',
                title: 'mauve-gradient',
                selected: (catColorGradient == 'mauve-gradient')
            }, {
                id: 'lush-gradient',
                text: '<div style="width: 75px; height: 50px;" class="lush-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="lush-gradient-bg"></div>',
                title: 'lush-gradient',
                selected: (catColorGradient == 'lush-gradient')
            }, {
                id: 'pale-wood-gradient',
                text: '<div style="width: 75px; height: 50px;" class="pale-wood-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="pale-wood-gradient-bg"></div>',
                title: 'pale-wood-gradient',
                selected: (catColorGradient == 'pale-wood-gradient')
            }, {
                id: 'aubergine-gradient',
                text: '<div style="width: 75px; height: 50px;" class="aubergine-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="aubergine-gradient-bg"></div>',
                title: 'aubergine-gradient',
                selected: (catColorGradient == 'aubergine-gradient')
            }, {
                id: "orange-coral-gradient",
                text: '<div style="width: 75px; height: 50px;" class="orange-coral-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="orange-coral-gradient-bg"></div>',
                title: 'orange-coral-gradient',
                selected: (catColorGradient == "orange-coral-gradient")
            }, {
                id: 'decent-gradient',
                text: '<div style="width: 75px; height: 50px;" class="decent-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="decent-gradient-bg"></div>',
                title: 'decent-gradient',
                selected: (catColorGradient == 'decent-gradient')
            }, {
                id: 'dusk-gradient',
                text: '<div style="width: 75px; height: 50px;" class="dusk-gradient-bg"></div>',
                html: '<div style="width: 75px; height: 50px;" class="dusk-gradient-bg"></div>',
                title: 'dusk-gradient',
                selected: (catColorGradient == 'dusk-gradient')
            },

        ];
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