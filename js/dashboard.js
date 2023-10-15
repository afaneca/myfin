import { LocalDataManager } from "./utils/localDataManager.js";
import { chartUtils } from "./utils/chartUtils.js";
import { GraphEmptyViewComponent } from "./components/graphEmptyView.js";
import { PickerUtils } from "./utils/pickerUtils.js";
import { StringUtils } from "./utils/stringUtils.js";
import { LoadingManager } from "./utils/loadingManager.js";
import { TransactionServices } from "./services/transactionServices.js";
import { DateUtils } from "./utils/dateUtils.js";
import { StatServices } from "./services/statServices.js";
import { Localization } from "./utils/localization.js";
import { TransactionsListComponent } from "./components/transactionsListComponent.js";

let CHART_INCOME_DISTRIBUTION
let CHART_EXPENSES_DISTRIBUTION
let CHART_MONTHLY_OVERVIEW
let CHART_DEBT_DISTRIBUTION
let CHART_INVESTMENT_DISTRIBUTION

export var Dashboard = {
  init: () => {
    PickerUtils.setupMonthPickerWithDefaultDate('#dashboard-monthpicker',
      moment().month() + 1, moment().year(), () => {
        const selectedMonth = $('#dashboard-monthpicker').val()

        console.log('New Month Selected: ' + selectedMonth)
        Dashboard.refreshDashboard(selectedMonth)
      },
      moment().month() + 1 + '/' + (moment().year() - 10),
      moment().month() + 1 + '/' + moment().year())

    Dashboard.setupLastTransactionsTable()
    Dashboard.setupDebtDistributionChart()
    Dashboard.setupInvestmentDistributionChart()

    Dashboard.setupIncomeExpensesDistributionChart()

    var isShowing = false
  },
  setupMonthlyOverviewChart: (budgetedAmount, realAmount) => {
    if (!budgetedAmount) {
      budgetedAmount = 0
    }
    if (!realAmount) {
      realAmount = 0
    }
    $('#chart-monthly-overview-real-amount').
      text(StringUtils.formatMoney(Math.abs(realAmount)))
    $('#chart-monthly-overview-budgeted-amount').
      text(StringUtils.formatMoney(Math.abs(budgetedAmount)))

    let maxValue = Math.abs(budgetedAmount) - Math.abs(realAmount)
    if (maxValue < 0) {
      maxValue = 0
    }

    var data = [Math.abs(realAmount), maxValue]
    var customLabels = [
      Localization.getString("dashboard.current"),
      Localization.getString("dashboard.remaining"),
    ]

    if (CHART_MONTHLY_OVERVIEW) {
      chartUtils.removeData(CHART_MONTHLY_OVERVIEW)
    }

    let realToBudgetedRatio = ((realAmount * 100) / budgetedAmount) / 100

    if (!realToBudgetedRatio) {
      $('#chart-angular-target-goals').hide()
      $('.card-panel.target-goals').
        find('.empty-view').
        html(GraphEmptyViewComponent.buildDefaultGraphEmptyView()).show()
    }
    else {
      CHART_MONTHLY_OVERVIEW = chartUtils.setupAngularChart(
        'chart-angular-target-goals', data, null, customLabels,
        realToBudgetedRatio)
      $('#chart-angular-target-goals').show()
    }
  },
  setupLastTransactionsTable: () => {
    TransactionServices.getXTransactions(5,
      (list) => {
        // SUCCESS
        if (list.length > 0) {
          Dashboard.setupLastMovementsTable(list)
        }
        else {
          $('.card-panel.last_movements').
            find('.empty-view').
            html(GraphEmptyViewComponent.buildDefaultGraphEmptyView(
              Localization.getString("common.noTransactionsToDisplay")))
        }
      }, (err) => {
        // FAILURE
        $('.card-panel.last_movements').
          find('.empty-view').
          html(GraphEmptyViewComponent.buildDefaultGraphEmptyView()).show()
      })
  },
  setupLastMovementsTable: list => {
    TransactionsListComponent.buildTransactionsList("id", "last_movements_table_wrapper", list)
  },
  formatCurrencyColumn: (type, formattedCurrencyString) => {
    switch (type) {
      case 'I':
        return `<span style="height: auto !important;font-size: large;" class='badge green-text text-accent-6'>${formattedCurrencyString}</span></span>`
        break
      case 'E':
        return `<span style="height: auto !important;font-size: large;" class='badge pink-text text-accent-1'>${formattedCurrencyString}</span>`
        break
      case 'T':
      default:
        return `<spa style="height: auto !important;font-size: large;" class='badge orange-text text-accent-2'>${formattedCurrencyString}</span>`
        break
    }
  },
  setupDebtDistributionChart: () => {
    const accsArr = LocalDataManager.getUserAccounts().
      filter((acc) => acc.status === MYFIN.TRX_STATUS.ACTIVE
        && parseFloat(acc.balance) !== 0)

    const creditAccounts = accsArr.filter(function (acc) {
      return acc.type === 'CREAC'
    })

    let dataset = []
    let labels = []
    let colorGradientsArr = []

    for (const cacc of creditAccounts) {
      dataset.push(parseFloat(cacc.balance).toFixed(2))
      labels.push(cacc.name)
      colorGradientsArr.push(cacc.color_gradient)
    }
    if (CHART_DEBT_DISTRIBUTION) {
      chartUtils.removeData(CHART_DEBT_DISTRIBUTION)
    }
    if (dataset.length > 0) {
      CHART_DEBT_DISTRIBUTION = chartUtils.setupDebtDistributionPieChart('chart_pie_debt_distribution',
        dataset, labels, Localization.getString("common.debtDistribution"), colorGradientsArr)
    }
    else {
      $('#chart_pie_debt_distribution').hide()
      $('.card-panel.debt-distribution').
        find('.empty-view').
        html(GraphEmptyViewComponent.buildDefaultGraphEmptyView()).show()

    }
  },
  setupInvestmentDistributionChart: () => {

    const accsArr = LocalDataManager.getUserAccounts().
      filter((acc) => acc.status === MYFIN.TRX_STATUS.ACTIVE
        && parseFloat(acc.balance) !== 0)

    const investmentAccounts = accsArr.filter(function (acc) {
      return acc.type === 'INVAC' || acc.type === 'SAVAC'
    })

    let dataset = []
    let labels = []
    let colorGradientsArr = []

    for (const invAcc of investmentAccounts) {
      dataset.push(parseFloat(invAcc.balance).toFixed(2))
      labels.push(invAcc.name)
      colorGradientsArr.push(invAcc.color_gradient)
    }
    if (CHART_INVESTMENT_DISTRIBUTION) {
      chartUtils.removeData(CHART_INVESTMENT_DISTRIBUTION)
    }
    if (dataset.length > 0) {
      CHART_INVESTMENT_DISTRIBUTION = chartUtils.setupDebtDistributionPieChart('chart_pie_investing_portfolio',
        dataset, labels, Localization.getString("common.investmentPortfolio"), colorGradientsArr)
      $('#chart_pie_investing_portfolio').show()
    }
    else {
      $('#chart_pie_investing_portfolio').hide()
      $('.card-panel.investing_portfolio').
        find('.empty-view').
        html(GraphEmptyViewComponent.buildDefaultGraphEmptyView()).show()
    }
  },
  setupIncomeExpensesDistributionChart: () => {
    let datasetDebit = []
    let labelsDebit = []
    let datasetCredit = []
    let labelsCredit = []
    let catColorsCredit = []
    let catColorsDebit = []

    const selectedMonth = $('#dashboard-monthpicker').val()

    const month = parseInt(selectedMonth.split('/')[0])
    const year = parseInt(selectedMonth.split('/')[1])

    LoadingManager.showLoading()
    StatServices.getDashboardExpensesIncomeDistributionStats(month, year,
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        Dashboard.setupLastUpdateTimestamp(resp['last_update_timestamp'])
        const allCategories = resp.categories

        let totalExpensesRealAmount = 0
        let totalExpensesBudgetedAmount = 0

        // sort by debit amount desc
        allCategories.concat().sort((a, b) => (a['current_amount_debit'] > b['current_amount_debit'] ? -1 : 1)).forEach((cat) => {
          if (cat.current_amount_debit &&
            parseFloat(cat.current_amount_debit) !== 0) {
            datasetDebit.push(cat.current_amount_debit)
            labelsDebit.push(cat.name)
            catColorsDebit.push(cat.color_gradient)
          }
          if(parseFloat(cat.exclude_from_budgets) !== 1){
            totalExpensesRealAmount += parseFloat(cat.current_amount_debit)
            totalExpensesBudgetedAmount += parseFloat(cat.planned_amount_debit)
          }
        })

        // sort by credit amount desc
        allCategories.concat().sort((a, b) => (a['current_amount_credit'] > b['current_amount_credit'] ? -1 : 1)).forEach((cat) => {
          if (cat.current_amount_credit &&
            parseFloat(cat.current_amount_credit) !== 0) {
            datasetCredit.push(cat.current_amount_credit)
            labelsCredit.push(cat.name)
            catColorsCredit.push(cat.color_gradient)
          }
        })

        Dashboard.setupMonthlyOverviewChart(totalExpensesBudgetedAmount,
          totalExpensesRealAmount)

        if (CHART_INCOME_DISTRIBUTION) {
          chartUtils.removeData(CHART_INCOME_DISTRIBUTION)
        }
        if (CHART_EXPENSES_DISTRIBUTION) {
          chartUtils.removeData(CHART_EXPENSES_DISTRIBUTION)
        }

        if (datasetCredit.length > 0) {
          CHART_INCOME_DISTRIBUTION = chartUtils.setupDebtDistributionPieChart(
            'chart_pie_income_distribution', datasetCredit, labelsCredit,
            Localization.getString('dashboard.incomeDistribution'), catColorsCredit)
          $('#chart_pie_income_distribution').show()
          $('.card-panel.income_distribution').find('.empty-view').hide()
        }
        else {
          $('#chart_pie_income_distribution').hide()
          $('.card-panel.income_distribution').
            find('.empty-view').
            html(GraphEmptyViewComponent.buildDefaultGraphEmptyView()).show()
        }

        if (datasetDebit.length > 0) {
          CHART_EXPENSES_DISTRIBUTION = chartUtils.setupDebtDistributionPieChart(
            'chart_pie_spending_distribution', datasetDebit, labelsDebit,
              Localization.getString('dashboard.expenseDistribution'), catColorsDebit)
          $('#chart_pie_spending_distribution').show()
          $('.card-panel.spending_distribution').find('.empty-view').hide()
        }
        else {
          $('#chart_pie_spending_distribution').hide()
          $('.card-panel.spending_distribution').
            find('.empty-view').
            html(GraphEmptyViewComponent.buildDefaultGraphEmptyView()).show()
        }
      }, (err) => {
        // FAILURE
        /*chartUtils.setupPieChart("chart_pie_income_distribution", ["Sem dados"], [100], "Distribuição de Receita");
        chartUtils.setupPieChart("chart_pie_spending_distribution", ["Sem dados"], [0], "Distribuição de Despesa");*/
        LoadingManager.hideLoading()
        if (CHART_INCOME_DISTRIBUTION) {
          chartUtils.removeData(CHART_INCOME_DISTRIBUTION)
        }
        if (CHART_EXPENSES_DISTRIBUTION) {
          chartUtils.removeData(CHART_EXPENSES_DISTRIBUTION)
        }

        $('#chart_pie_income_distribution').hide()
        $('.card-panel.income_distribution').
          find('.empty-view').
          html(GraphEmptyViewComponent.buildDefaultGraphEmptyView()).show()

        $('#chart_pie_spending_distribution').hide()

        $('.card-panel.spending_distribution').
          find('.empty-view').
          html(GraphEmptyViewComponent.buildDefaultGraphEmptyView()).show()

        $('#chart-angular-target-goals').hide()

        $('.card-panel.target-goals').
          find('.empty-view').
          html(GraphEmptyViewComponent.buildDefaultGraphEmptyView()).show()

        Dashboard.setupMonthlyOverviewChart(0, 0)
      })
  },
  refreshDashboard: (newMonth) => {
    Dashboard.setupLastTransactionsTable()
    Dashboard.setupDebtDistributionChart()
    Dashboard.setupInvestmentDistributionChart()
    Dashboard.setupIncomeExpensesDistributionChart()
  },
  setupLastUpdateTimestamp: (timestamp) => {
    if (timestamp == '0') {
      return 'N/D'
    }
    const formattedTime = DateUtils.convertUnixTimestampToEuropeanDateTimeFormat(
      timestamp)
    $('#dashboard-last-update-timestamp-value').text(formattedTime)
  },
}

//# sourceURL=js/dashboard.js
