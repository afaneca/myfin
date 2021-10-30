'use strict';

var CHART_INCOME_DISTRIBUTION;
var CHART_EXPENSES_DISTRIBUTION;
var CHART_MONTHLY_OVERVIEW;

var Dashboard = {
  init: () => {

    PickerUtils.setupMonthPickerWithDefaultDate('#dashboard-monthpicker', moment()
      .month() + 1, moment()
      .year(), () => {
      const selectedMonth = $('#dashboard-monthpicker')
        .val();

      console.log('New Month Selected: ' + selectedMonth);
      Dashboard.refreshDashboard(selectedMonth);
    },
      moment()
        .month() + 1 + '/' + (moment()
        .year() - 10), moment()
      .month() + 1 + '/' + moment()
      .year());

    Dashboard.setupLastTransactionsTable();
    Dashboard.setupDebtDistributionChart();
    Dashboard.setupInvestmentDistributionChart();

    Dashboard.setupIncomeExpensesDistributionChart();

    var isShowing = false;
  },
  setupMonthlyOverviewChart: (budgetedAmount, realAmount) => {
    if (!budgetedAmount) budgetedAmount = 0;
    if (!realAmount) realAmount = 0;
    $('#chart-monthly-overview-real-amount')
      .text(StringUtils.formatMoney(Math.abs(realAmount)));
    $('#chart-monthly-overview-budgeted-amount')
      .text(StringUtils.formatMoney(Math.abs(budgetedAmount)));

    let maxValue = Math.abs(budgetedAmount) - Math.abs(realAmount);
    if (maxValue < 0) maxValue = 0;

    var data = [Math.abs(realAmount), maxValue];
    var customLabels = [
      'Atual',
      'Restante'
    ];

    if (CHART_MONTHLY_OVERVIEW) {
      chartUtils.removeData(CHART_MONTHLY_OVERVIEW);
    }

    let realToBudgetedRatio = ((realAmount * 100) / budgetedAmount) / 100;

    if (!realToBudgetedRatio) {
      $('#chart-angular-target-goals')
        .hide();
      $('.card-panel.target-goals')
        .find('.empty-view')
        .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());
    } else {
      CHART_MONTHLY_OVERVIEW = chartUtils.setupAngularChart('chart-angular-target-goals', data, null, customLabels, realToBudgetedRatio);
    }
  },
  setupLastTransactionsTable: () => {
    TransactionServices.getXTransactions(5,
      (list) => {
        // SUCCESS
        if (list.length > 0) {
          Dashboard.setupLastMovementsTable(list);
        } else {
          $('.card-panel.last_movements')
            .find('.empty-view')
            .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView('Sem movimentos para apresentar'));
        }
      }, (err) => {
        // FAILURE
        $('.card-panel.last_movements')
          .find('.empty-view')
          .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());
      });
  },
  setupLastMovementsTable: list => {
    $('#last_movements_table_wrapper')
      .html(`
         <table class="responsive-table myfin-table">
            <thead>
                <th>Data</th>
                <th>Descrição</th>
                <th>Montante</th>
            </thead>
            <tbody>
                ${list.map(mov => Dashboard.renderLastMovementsRow(mov))
        .join('')}
            </tbody>
        </table>
      
      `);
  },
  renderLastMovementsRow: mov => {
    return `
            <tr data-id='${mov.transaction_id}'>
                <td>${DateUtils.convertUnixTimestampToDateString(mov.date_timestamp)}</td>
                <td>${mov.description}</td>
                <td>${Dashboard.formatCurrencyColumn(mov.type, StringUtils.formatMoney(mov.amount))}</td>
            </tr>
        `;
  },
  formatCurrencyColumn: (type, formattedCurrencyString) => {
    switch (type) {
      case 'I':
        return `<span style="height: auto !important;font-size: large;" class='badge green-text text-accent-6'>${formattedCurrencyString}</span></span>`;
        break;
      case 'E':
        return `<span style="height: auto !important;font-size: large;" class='badge pink-text text-accent-1'>${formattedCurrencyString}</span>`;
        break;
      case 'T':
      default:
        return `<spa style="height: auto !important;font-size: large;" class='badge orange-text text-accent-2'>${formattedCurrencyString}</span>`;
        break;
    }
  },
  setupDebtDistributionChart: () => {

    const accsArr = LocalDataManager.getUserAccounts()
      .filter((acc) => acc.status === MYFIN.TRX_STATUS.ACTIVE
        && parseFloat(acc.balance) !== 0);

    const creditAccounts = accsArr.filter(function (acc) {
      return acc.type === 'CREAC';
    });

    let dataset = [];
    let labels = [];
    let colorGradientsArr = [];

    for (const cacc of creditAccounts) {
      dataset.push(parseFloat(cacc.balance)
        .toFixed(2));
      labels.push(cacc.name);
      colorGradientsArr.push(cacc.color_gradient);
    }
    if (dataset.length > 0) {
      chartUtils.setupDebtDistributionPieChart('chart_pie_debt_distribution', dataset, labels, 'Distribuição da Dívida', colorGradientsArr);
    } else {
      $('#chart_pie_debt_distribution')
        .hide();
      $('.card-panel.debt-distribution')
        .find('.empty-view')
        .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());

    }
  },
  setupInvestmentDistributionChart: () => {

    const accsArr = LocalDataManager.getUserAccounts()
      .filter((acc) => acc.status === MYFIN.TRX_STATUS.ACTIVE
        && parseFloat(acc.balance) !== 0);

    const investmentAccounts = accsArr.filter(function (acc) {
      return acc.type === 'INVAC' || acc.type === 'SAVAC';
    });

    let dataset = [];
    let labels = [];
    let colorGradientsArr = [];

    for (const invAcc of investmentAccounts) {
      dataset.push(parseFloat(invAcc.balance)
        .toFixed(2));
      labels.push(invAcc.name);
      colorGradientsArr.push(invAcc.color_gradient);
    }
    if (dataset.length > 0) {
      chartUtils.setupDebtDistributionPieChart('chart_pie_investing_portfolio', dataset, labels, 'Portefólio de Investimento', colorGradientsArr);
    } else {
      $('#chart_pie_investing_portfolio')
        .hide();
      $('.card-panel.investing_portfolio')
        .find('.empty-view')
        .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());
    }
  },
  setupIncomeExpensesDistributionChart: () => {
    let datasetDebit = [];
    let labelsDebit = [];
    let datasetCredit = [];
    let labelsCredit = [];
    let catColorsCredit = [];
    let catColorsDebit = [];

    const selectedMonth = $('#dashboard-monthpicker')
      .val();

    const month = parseInt(selectedMonth.split('/')[0]);
    const year = parseInt(selectedMonth.split('/')[1]);

    LoadingManager.showLoading();
    StatServices.getDashboardExpensesIncomeDistributionStats(month, year,
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading();
        Dashboard.setupLastUpdateTimestamp(resp['last_update_timestamp']);
        const allCategories = resp.categories;

        let totalExpensesRealAmount = 0;
        let totalExpensesBudgetedAmount = 0;

        allCategories.forEach((cat) => {
          if (cat.current_amount_credit && parseFloat(cat.current_amount_credit) !== 0) {
            datasetCredit.push(cat.current_amount_credit);
            labelsCredit.push(cat.name);
            catColorsCredit.push(cat.color_gradient);
          }
          if (cat.current_amount_debit && parseFloat(cat.current_amount_debit) !== 0) {
            datasetDebit.push(cat.current_amount_debit);
            labelsDebit.push(cat.name);
            catColorsDebit.push(cat.color_gradient);
          }

          totalExpensesRealAmount += parseFloat(cat.current_amount_debit);
          totalExpensesBudgetedAmount += parseFloat(cat.planned_amount_debit);
        });

        Dashboard.setupMonthlyOverviewChart(totalExpensesBudgetedAmount, totalExpensesRealAmount);

        if (CHART_INCOME_DISTRIBUTION) {
          chartUtils.removeData(CHART_INCOME_DISTRIBUTION);
        }
        if (CHART_EXPENSES_DISTRIBUTION) {
          chartUtils.removeData(CHART_EXPENSES_DISTRIBUTION);
        }

        if (datasetCredit.length > 0) {
          CHART_INCOME_DISTRIBUTION = chartUtils.setupDebtDistributionPieChart('chart_pie_income_distribution', datasetCredit, labelsCredit, 'Distribuição de Receita', catColorsCredit);
        } else {
          $('#chart_pie_income_distribution')
            .hide();
          $('.card-panel.income_distribution')
            .find('.empty-view')
            .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());
        }

        if (datasetDebit.length > 0) {
          CHART_EXPENSES_DISTRIBUTION = chartUtils.setupDebtDistributionPieChart('chart_pie_spending_distribution', datasetDebit, labelsDebit, 'Distribuição de Despesa', catColorsDebit);
        } else {

          $('#chart_pie_spending_distribution')
            .hide();
          $('.card-panel.spending_distribution')
            .find('.empty-view')
            .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());
        }
      }, (err) => {
        // FAILURE
        /*chartUtils.setupPieChart("chart_pie_income_distribution", ["Sem dados"], [100], "Distribuição de Receita");
        chartUtils.setupPieChart("chart_pie_spending_distribution", ["Sem dados"], [0], "Distribuição de Despesa");*/
        LoadingManager.hideLoading();
        if (CHART_INCOME_DISTRIBUTION) {
          chartUtils.removeData(CHART_INCOME_DISTRIBUTION);
        }
        if (CHART_EXPENSES_DISTRIBUTION) {
          chartUtils.removeData(CHART_EXPENSES_DISTRIBUTION);
        }

        $('#chart_pie_income_distribution')
          .hide();
        $('.card-panel.income_distribution')
          .find('.empty-view')
          .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());

        $('#chart_pie_spending_distribution')
          .hide();

        $('.card-panel.spending_distribution')
          .find('.empty-view')
          .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());

        $('#chart-angular-target-goals')
          .hide();

        $('.card-panel.target-goals')
          .find('.empty-view')
          .html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());

        Dashboard.setupMonthlyOverviewChart(0, 0);
      });
  },
  refreshDashboard: (newMonth) => {
    // TODO DASHBOARD: setup refresh of data
    Dashboard.setupLastTransactionsTable();
    Dashboard.setupDebtDistributionChart();
    Dashboard.setupInvestmentDistributionChart();
    Dashboard.setupIncomeExpensesDistributionChart();
  },
  setupLastUpdateTimestamp: (timestamp) => {
    if (timestamp == '0') return 'N/D';
    const formattedTime = DateUtils.convertUnixTimestampToEuropeanDateTimeFormat(timestamp);
    $('#dashboard-last-update-timestamp-value')
      .text(formattedTime);
  }
};

//# sourceURL=js/dashboard.js
