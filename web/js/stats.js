'use strict';

let EXPENSES_PER_CATEGORY_LINE_CHART;
let INCOME_PER_CATEGORY_LINE_CHART;

var Stats = {
  initTabEvolutionOfPatrimony: () => {
    /* let cData = [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000];
     let cLabels = ["01/2020", "02/2020", "03/2020", "04/2020", "05/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020"];*/
    LoadingManager.showLoading();
    StatServices.getUserAccountsBalanceSnapshot((resp) => {
      // SUCCESS
      LoadingManager.hideLoading();
      if (resp) {
        Stats.transformList(resp);
      } else {
        $('#chart_pie_patrimony_evolution')
          .hide();
        $('#patrimony-table')
          .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());
      }
    }, (err) => {
      // FAILURE
      LoadingManager.hideLoading();
      DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
    });
  },
  initTabProjections: () => {
    LoadingManager.showLoading();
    StatServices.getMonthlyPatrimonyProjections((resp) => {
      // SUCCESS
      LoadingManager.hideLoading();
      const budgetsList = resp['budgets'];
      const accountsFromPreviousMonth = resp['accountsFromPreviousMonth'];
      let initialAssetsValue = Stats.getInitialAssetsBalance(accountsFromPreviousMonth);
      for (let budget of budgetsList) {
        budget['planned_final_balance_assets_only'] = initialAssetsValue
          + StringUtils.convertIntegerToFloat((StringUtils.convertFloatToInteger(budget.planned_final_balance) - StringUtils.convertFloatToInteger(budget.planned_initial_balance)));
        initialAssetsValue = budget['planned_final_balance_assets_only'];
      }
      let chartData = budgetsList.map(budget => parseFloat(budget.planned_final_balance)
        .toFixed(2));
      let chartLabels = budgetsList.map(budget => budget.month + '/' + budget.year);
      let extraChartData = [{
        borderColor: '#FF5722',
        data: budgetsList.map(budget => parseFloat(budget.planned_final_balance_assets_only)
          .toFixed(2) /*Stats.getFinalBalanceForAssetsOnly(budget.planned_final_balance)*/),
        fill: true,
        hidden: true,
        label: 'Balanço Projetado (Ativos)',
      }];
      Stats.setupPatrimonyProjectionsLineChart(chartData, chartLabels, extraChartData);
      Stats.setupPatrimonyProjectionsList(budgetsList);
    }, (err) => {
      // FAILURE
      LoadingManager.hideLoading();
      DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
    });
  },
  changeTabs: activeID => {
    switch (activeID) {
      case 'tab-ev-pat':
        Stats.initTabEvolutionOfPatrimony();
        window.history.replaceState(null, null, '#!stats?tab=ev-pat');
        break;
      case 'tab-projections':
        Stats.initTabProjections();
        window.history.replaceState(null, null, '#!stats?tab=projections');
        break;
      case 'tab-expenses-per-cat':
        Stats.clearCanvasAndTableWrapper('#chart_pie_cat_expenses_evolution_table', 'chart_pie_cat_expenses_evolution');
        $('#chart_pie_cat_expenses_evolution')
          .remove();
        $('#canvas_chart_expenses_evo_wrapper')
          .append(' <canvas id="chart_pie_cat_expenses_evolution" width="800" height="300"></canvas>');
        Stats.initExpensesPerCatEvolution();
        window.history.replaceState(null, null, '#!stats?tab=cat-expenses-evo');
        break;
      case 'tab-income-per-cat':
        Stats.clearCanvasAndTableWrapper('#chart_pie_cat_income_evolution_table', 'chart_pie_cat_income_evolution');
        $('#chart_pie_cat_income_evolution')
          .remove();
        $('#canvas_chart_income_evo_wrapper')
          .append(' <canvas id="chart_pie_cat_income_evolution" width="800" height="300"></canvas>');

        Stats.initIncomePerCatEvolution();
        window.history.replaceState(null, null, '#!stats?tab=cat-income-evo');
        break;
      default:
        break;
    }
  },
  clearCanvasAndTableWrapper: (tableWrapperLocator, canvasLocator) => {
    $(tableWrapperLocator)
      .html('');
    let canvas = document.getElementById(canvasLocator);
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  },
  initExpensesPerCatEvolution: () => {

    UserServices.getAllCategoriesAndEntitiesForUser(
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading();
        Stats.setupCategorySelect(resp.categories, resp.entities, '#tab-expenses-per-cat');

        $('#tab-expenses-per-cat')
          .find('select.category-selection-select')
          .select2();//.formSelect();//.select2()
        $('select.category-selection-select')
          .on('change', (v) => {
            let selectedEntCatId = $('#tab-expenses-per-cat')
              .find('select.category-selection-select')
              .val();
            let selectedCatId,
              selectedEntId;
            if (selectedEntCatId.startsWith('cat-')) {
              selectedCatId = selectedEntCatId.split('cat-')[1];
            } else if (selectedEntCatId.startsWith('ent-')) {
              selectedEntId = selectedEntCatId.split('ent-')[1];
            }

            Stats.clearCanvasAndTableWrapper('#chart_pie_cat_expenses_evolution_table', 'chart_pie_cat_expenses_evolution');

            LoadingManager.showLoading();
            StatServices.getCategoryExpensesEvolution(selectedCatId, selectedEntId,
              (resp) => {
                // SUCCESS
                LoadingManager.hideLoading();
                Stats.renderExpensesPerCategoryTable(resp);
                Stats.renderExpensesPerCategoryLineChart(resp);
              }, (resp) => {
                // FAILURE
                LoadingManager.hideLoading();
                DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
              });
          });
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading();
        DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
      }
    );
  },
  renderExpensesPerCategoryLineChart: data => {
    /*let chartData = [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000];
    let chartLabels = ["01/2020", "02/2020", "03/2020", "04/2020", "05/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020"];*/
    let chartData = [];
    let chartLabels = [];

    for (var i = data.length - 1; i >= 0; i--) {
      chartData.push(data[i].value);
      chartLabels.push(`${data[i].month}/${data[i].year}`);
    }

    var ctx = document.getElementById('chart_pie_cat_expenses_evolution')
      .getContext('2d');

    const chartTitle = 'Evolução de Despesa';
    var customOptions = {
      title: {
        display: true,
        text: chartTitle,
        position: 'top',
        fontColor: LayoutUtils.getCSSVariableValue('--main-headline-text-color')
      },
      legend: {
        labels: {
          fontColor: LayoutUtils.getCSSVariableValue('--main-text-color')
        }
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']];
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(data['datasets'][0]['data'][tooltipItem['index']]);
          },
          afterLabel: (tooltipItem, data) => {
          }
        }
      }
    };

    var data = {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        label: 'Evolução de Despesa',
        borderColor: '#3e95cd',
        fill: true,
        trendlineLinear: chartUtils.getTrendLineObject()
      },
      ]
    };

    EXPENSES_PER_CATEGORY_LINE_CHART = new Chart(ctx, {
      type: 'line',
      data: data,
      options: customOptions
    });
  },
  renderExpensesPerCategoryTable: data => {
    $('div#chart_pie_cat_expenses_evolution_table')
      .html(`
            <table id="cat-expenses-evolution-table" class="display browser-defaults" style="width:100%">
                <thead>
                    <tr>
                       <th>Mês</th>
                       <th>Valor</th>
                       <th>Alteração (%)</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((month, index) => Stats.renderExpensesPerCategoryTableRow(((index < data.length) ? (data[index + 1]) : null), month))
        .join('')}
                </tbody>
            </table>
        `);

    tableUtils.setupStaticTable('table#cat-expenses-evolution-table');
  },
  renderExpensesPerCategoryTableRow: (oldMonth, monthData) => {

    return `
        <tr>
            <td>${monthData.month}/${monthData.year}</td>
            <td>${StringUtils.formatMoney(monthData.value)}</td>
            <td>${(!oldMonth) ? '-' : Stats.calculateGrowthPercentage(oldMonth.value, monthData.value)}</td>
        </tr>
      `;
  },
  setupCategorySelect: (categories, entities, wrapperDivLocator) => {
    $(wrapperDivLocator)
      .find('div.categories-select-wrapper')
      .html(`
            <div class="input-field col s3">
                <select id="category_select" class="category-selection-select">
                    <option value="" disabled selected>Escolha uma categoria</option>
                    <optgroup label="Categorias">
                        ${categories.map(cat => Stats.renderCategorySelectOption(cat))
        .join('')}
                    </optgroup>
                    <optgroup label="Entidades">
                        ${entities.map(ent => Stats.renderEntitySelectOption(ent))
        .join('')}
                    </optgroup>
                </select>
            </div>
        `);
  },
  renderCategorySelectOption: cat => {
    return `
            <option value="cat-${cat.category_id}">${cat.name}</option>
        `;
  },
  renderEntitySelectOption: ent => {
    return `
            <option value="ent-${ent.entity_id}">${ent.name}</option>
        `;
  },
  initIncomePerCatEvolution: () => {
    UserServices.getAllCategoriesAndEntitiesForUser(
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading();
        Stats.setupCategorySelect(resp.categories, resp.entities, '#tab-income-per-cat');

        $('#tab-income-per-cat')
          .find('select.category-selection-select')
          .select2();//.formSelect();//.select2()
        $('select.category-selection-select')
          .on('change', (v) => {
            let selectedEntCatId = $('#tab-income-per-cat')
              .find('select.category-selection-select')
              .val();
            let selectedCatId,
              selectedEntId;
            if (selectedEntCatId.startsWith('cat-')) {
              selectedCatId = selectedEntCatId.split('cat-')[1];
            } else if (selectedEntCatId.startsWith('ent-')) {
              selectedEntId = selectedEntCatId.split('ent-')[1];
            }

            Stats.clearCanvasAndTableWrapper('#chart_pie_cat_income_evolution_table', 'chart_pie_cat_income_evolution');

            LoadingManager.showLoading();
            StatServices.getCategoryIncomeEvolution(selectedCatId, selectedEntId,
              (resp) => {
                // SUCCESS
                LoadingManager.hideLoading();
                Stats.renderIncomePerCategoryTable(resp);
                Stats.renderIncomePerCategoryLineChart(resp);
              }, (resp) => {
                // FAILURE
                LoadingManager.hideLoading();
                DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
              });
          });
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading();
        DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
      }
    );
  },
  renderIncomePerCategoryLineChart: data => {
    /*let chartData = [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000];
    let chartLabels = ["01/2020", "02/2020", "03/2020", "04/2020", "05/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020", "06/2020"];*/
    let chartData = [];
    let chartLabels = [];

    for (var i = data.length - 1; i >= 0; i--) {
      chartData.push(data[i].value);
      chartLabels.push(`${data[i].month}/${data[i].year}`);
    }

    var ctx = document.getElementById('chart_pie_cat_income_evolution')
      .getContext('2d');

    const chartTitle = 'Evolução de Receita';
    var customOptions = {
      title: {
        display: true,
        text: chartTitle,
        position: 'top',
        fontColor: LayoutUtils.getCSSVariableValue('--main-headline-text-color')
      },
      legend: {
        labels: {
          fontColor: LayoutUtils.getCSSVariableValue('--main-text-color')
        }
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']];
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(data['datasets'][0]['data'][tooltipItem['index']]);
          },
          afterLabel: (tooltipItem, data) => {
          }
        }
      }
    };

    var data = {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        label: 'Evolução de Receita Por Categoria',
        borderColor: '#3e95cd',
        fill: true,
        trendlineLinear: chartUtils.getTrendLineObject()
      }
      ]
    };

    INCOME_PER_CATEGORY_LINE_CHART = new Chart(ctx, {
      type: 'line',
      data: data,
      options: customOptions
    });
  },
  renderIncomePerCategoryTable: data => {
    $('div#chart_pie_cat_income_evolution_table')
      .html(`
            <table id="cat-income-evolution-table" class="display browser-defaults" style="width:100%">
                <thead>
                    <tr>
                       <th>Mês</th>
                       <th>Valor</th>
                       <th>Alteração (%)</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((month, index) => Stats.renderIncomePerCategoryTableRow(((index < data.length) ? (data[index + 1]) : null), month))
        .join('')}
                </tbody>
            </table>
        `);

    tableUtils.setupStaticTable('table#cat-income-evolution-table');
  },
  renderIncomePerCategoryTableRow: (oldMonth, monthData) => {

    return `
        <tr>
            <td>${monthData.month}/${monthData.year}</td>
            <td>${StringUtils.formatMoney(monthData.value)}</td>
            <td>${(!oldMonth) ? '-' : Stats.calculateGrowthPercentage(oldMonth.value, monthData.value)}</td>
        </tr>
      `;
  },
  transformList: list => {
    let cLabels = [];
    let cAggData = [];
    let accsList = [];
    let extraChartData = [];

    accsList = LocalDataManager.getUserAccounts();

    for (const elem of list) {
      const genKey = `${elem.month}/${elem.year}`;
      cLabels.push(genKey);

      for (const acc of elem.account_snapshots) {
        let fullAccount = accsList.filter((ac) => {
          return ac.account_id == acc.account_id;
        })[0];
        let extraDataObj = extraChartData.filter(e => e.account_id == acc.account_id)[0];
        if (!extraDataObj) {
          // record doesn't exist
          extraChartData.push(
            {
              account_id: acc.account_id,
              data: [acc.balance],
              label: fullAccount.name,
              borderColor: chartUtils.getPieChartColorsList()[0],
              fill: true,
              hidden: true,
            },
          );
        } else {
          // record exists already. Just update its data
          extraDataObj.data.push(acc.balance);
        }

      }

      let aggregateBalance = elem.account_snapshots.reduce((acc, item) => {
        return acc + StringUtils.convertFloatToInteger(item.balance);
      }, 0);
      cAggData.push(StringUtils.convertIntegerToFloat(aggregateBalance));
    }

    Stats.setupPatrimonyLineChart(cAggData, cLabels, extraChartData);
    Stats.setupPatrimonyTable(cAggData.slice()
      .reverse(), cLabels.slice()
      .reverse());
    tableUtils.setupStaticTable('#ev-pat-table');

  },
  /*transformList: list => {
      let tempList = []
      let cLabels = []
      let cData = []
      let accsList = []
      let extraChartData = []
      /!**
       * [account_id] = { }
       *!/
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
  },*/
  setupPatrimonyTable: (sumArr, sumLabels) => {
    $('#patrimony-table')
      .html(Stats.renderPatrimonyTable(sumArr, sumLabels));
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
                ${sumLabels.map((label, index) => Stats.renderPatrimonyTableRow(label, sumArr[index + 1], sumArr[index]))
      .join('')}
            </tbody>
        </table>
      `;
  },
  renderPatrimonyTableRow: (label, starValue, endValue) => {
    return `
        <tr>
            <td>${label}</td>
            <td>${(starValue) ? StringUtils.formatMoney(starValue) : '-'}</td>
            <td>${StringUtils.formatMoney(endValue)}</td>
            <td>${(starValue) ? StringUtils.formatMoney(endValue - starValue) : '-'}</td>
            <td>${(starValue) ? Stats.calculateGrowthPercentage(starValue, endValue) : '-'}</td>
        </tr>
      `;
  },
  calculateGrowthPercentage: (val1, val2) => {
    const percentageChange = (((parseFloat(val2) - parseFloat(val1)) / Math.abs(parseFloat(val1))) * 100)
      .toFixed(2);

    if (percentageChange == 0) {
      return `<span>${percentageChange}%</span>`;
    } else if (percentageChange < 0) {
      return `<span class="badge pink-text text-accent-1">${percentageChange}%</span>`;
    } else {
      return `<span class="badge green-text text-accent-4">${percentageChange}%</span>`;
    }
  },
  setupPatrimonyLineChart: (chartData, chartLabels, extraChartData) => {
    var ctx = document.getElementById('chart_pie_patrimony_evolution')
      .getContext('2d');

    const chartTitle = 'Evolução do Património';
    var customOptions = {
      title: {
        display: true,
        text: chartTitle,
        position: 'top',
        fontColor: LayoutUtils.getCSSVariableValue('--main-headline-text-color')
      },
      legend: {
        labels: {
          fontColor: LayoutUtils.getCSSVariableValue('--main-text-color')
        }
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']];
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(tooltipItem.value/*data['datasets'][0]['data'][tooltipItem['index']]*/);
          },
          afterLabel: (tooltipItem, data) => {
          }
        }
      }
    };

    var data = {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        label: 'Acumulado',
        borderColor: '#3e95cd',
        fill: true,
        /*lineTension: 0,*/
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
    $('#patrimony-projections-table')
      .html(Stats.renderPatrimonyProjectionsTable(resp));
    tableUtils.setupStaticTable('#ev-pat-projections-table');
  },
  getInitialAssetsBalance(accs) {
    const allAccs = accs;//LocalDataManager.getUserAccounts()
    const assetsAccounts = allAccs.filter(function (acc) {
      return acc.type === account_types_tag.CHEAC || acc.type === account_types_tag.SAVAC
        || acc.type === account_types_tag.INVAC || acc.type === account_types_tag.OTHAC
        || acc.type === account_types_tag.WALLET || acc.type === account_types_tag.MEALAC;
    });

    let assetsBalance = assetsAccounts.reduce((acc, val) => {
      return acc + parseFloat(val.balance);
    }, 0);

    return assetsBalance;
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
                ${budgets.map((budget, index) => Stats.renderPatrimonyProjectionsTableRow(budget))
      .join('')}
            </tbody>
        </table>
        <style>
            .projections-table-footnotes{
                font-size: small;
            }
        </style>
        <p class="right-align grey-text text-accent-4 projections-table-footnotes">* Este é um valor projetado através dos dados orçamentados</p>
        <p class="right-align grey-text text-accent-4 projections-table-footnotes">** Este é um valor projetado através dos dados orçamentados, desconsiderando o passivo</p>
      `;
  },
  renderPatrimonyProjectionsTableRow: (budget) => {
    return `
        <tr>
            <td>${budget.month}/${budget.year}</td>
            <td>${StringUtils.formatMoney(budget.planned_initial_balance)}</td>
            <td>${StringUtils.formatMoney(budget.planned_final_balance)}</td>
            <td>${StringUtils.formatMoney(budget.planned_final_balance_assets_only/*Stats.getFinalBalanceForAssetsOnly(budget.planned_final_balance)*/)}</td>
            <td>${(budget.planned_initial_balance) ? Stats.calculateGrowthPercentage(budget.planned_initial_balance, budget.planned_final_balance) : '-'}</td>
        </tr>
      `;
  },
  getFinalBalanceForAssetsOnly: (totalBalance) => {
    const debtAccounts = LocalDataManager.getDebtAccounts();
    let debtTotals = debtAccounts.reduce((acc, val) => {
      return acc + parseFloat(val.balance);
    }, 0);

    return totalBalance - debtTotals;
  },
  setupPatrimonyProjectionsLineChart: (chartData, chartLabels, extraChartData) => {
    var ctx = document.getElementById('chart_pie_patrimony_projection')
      .getContext('2d');

    const chartTitle = 'Projeção de Evolução do Património';
    var customOptions = {
      title: {
        display: true,
        text: chartTitle,
        position: 'top',
        fontColor: LayoutUtils.getCSSVariableValue('--main-headline-text-color')
      },
      legend: {
        labels: {
          fontColor: LayoutUtils.getCSSVariableValue('--main-text-color')
        }
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']];
          },
          label: (tooltipItem, data) => {
            return StringUtils.formatMoney(tooltipItem.value/*data['datasets'][0]['data'][tooltipItem['index']]*/);
          },
          afterLabel: (tooltipItem, data) => {
          }
        }
      }
    };

    var data = {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        label: 'Balanço Projetado (Ativos + Passivos)',
        borderColor: '#3e95cd',
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
};

//# sourceURL=js/stats.js
