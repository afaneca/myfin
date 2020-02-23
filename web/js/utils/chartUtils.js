"use strict";

var chartUtils = {
    setupAngularChart: (elementID, chartData, customText, customLabels) => {

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

        var customData = {
            datasets: [{
                data: chartData,
                backgroundColor: [
                    '#009688',
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
                    color: '#000', // Default is #000000
                    fontStyle: 'Arial', // Default is Arial
                    sidePadding: 10 // Defualt is 20 (as a percentage)
                }
            },
            title: {
                display: true,
                text: "Overview Mensal",
                position: "bottom"
            },
            legend: {
                display: false
            }
        }

        var myPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: customData,
            options: customOptions
        });
    },
    setupPieChart: (elementID, chartData, chartLabels, chartTitle) => {
        var ctx = document.getElementById(elementID).getContext('2d');

        var customOptions = {
            title: {
                display: true,
                text: chartTitle,
                position: "top"
            }
        }

        var chartData = {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: chartUtils.getPieChartColorsList()

            }]
        };

        var myPieChart = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: customOptions
        });
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
            /* '#000000' */
        ]);
    }
}