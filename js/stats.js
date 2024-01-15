import { DialogUtils } from "./utils/dialogUtils.js";
import { GraphEmptyViewComponent } from "./components/graphEmptyView.js";
import { LoadingManager } from "./utils/loadingManager.js";
import { StatServices } from "./services/statServices.js";
import { account_types_tag, StringUtils } from "./utils/stringUtils.js";
import { DateUtils } from "./utils/dateUtils.js";
import { chartUtils } from "./utils/chartUtils.js";
import { TableUtils } from "./utils/tableUtils.js";
import { LocalDataManager } from "./utils/localDataManager.js";
import { UserServices } from "./services/userServices.js";
import { Localization } from "./utils/localization.js";
import { ToggleComponent } from "./components/toggleComponent.js";

let EXPENSES_PER_CATEGORY_LINE_CHART
let INCOME_PER_CATEGORY_LINE_CHART
let EVOLUTION_LINE_CHART
let PROJECTIONS_LINE_CHART
let YEAR_BY_YEAR_SANKEY_CHART
let yearByYearCurrentlySelectedYear = DateUtils.getCurrentYear()
let categoryIncomeEvolutionDataCache
let categoryExpensesEvolutionDataCache

const INCOME_EVO_TOGGLE_ID = 'income-evo'
const EXPENSES_EVO_TOGGLE_ID = 'expenses-evo'
const INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY = 'month'
const INCOME_EXPENSES_EVO_TOGGLE_OPTION_YEAR_KEY = 'year'

export const Stats = {
  initTabEvolutionOfPatrimony: () => {
    LoadingManager.showLoading()
    StatServices.getUserAccountsBalanceSnapshot((resp) => {
      // SUCCESS
      LoadingManager.hideLoading()
      if (resp) {
        Stats.transformList(resp)
      }
      else {
        $('#chart_pie_patrimony_evolution').hide()
        $('#patrimony-table').html(GraphEmptyViewComponent.buildDefaultGraphEmptyView())
      }
    }, (err) => {
      // FAILURE
      LoadingManager.hideLoading()
      DialogUtils.showErrorMessage()
    })
  },
  initTabProjections: () => {
    LoadingManager.showLoading()
    StatServices.getMonthlyPatrimonyProjections((resp) => {
      // SUCCESS
      LoadingManager.hideLoading()
      const budgetsList = resp['budgets']
      const accountsFromPreviousMonth = resp['accountsFromPreviousMonth']
      let initialAssetsValue = Stats.getInitialAssetsBalance(accountsFromPreviousMonth)
      for (let budget of budgetsList) {
        budget['planned_final_balance_assets_only'] = initialAssetsValue
          + StringUtils.convertIntegerToFloat(
            (StringUtils.convertFloatToInteger(budget.planned_final_balance) - StringUtils.convertFloatToInteger(budget.planned_initial_balance)))
        initialAssetsValue = budget['planned_final_balance_assets_only']
        budget['planned_final_balance_operating_funds_only'] = budget['planned_final_balance_assets_only'] -
          Stats.getTotalBalanceFromInvestmentAccounts()
      }
      let chartData = budgetsList.map(budget => parseFloat(budget.planned_final_balance).toFixed(2))
      let chartLabels = budgetsList.map(budget => budget.month + '/' + budget.year)
      let extraChartData = [
        {
          borderColor: '#FF5722',
          data: budgetsList.map(budget => parseFloat(budget.planned_final_balance_assets_only).toFixed(2) /*Stats.getFinalBalanceForAssetsOnly(budget.planned_final_balance)*/),
          fill: true,
          hidden: true,
          label: Localization.getString('stats.projectedBalanceAssets'),
        }]
      Stats.setupPatrimonyProjectionsLineChart(chartData, chartLabels, extraChartData)
      Stats.setupPatrimonyProjectionsList(budgetsList)
    }, (err) => {
      // FAILURE
      LoadingManager.hideLoading()
      DialogUtils.showErrorMessage()
    })
  },
  changeTabs: activeID => {
    switch (activeID) {
      case 'tab-ev-pat':
        Stats.initTabEvolutionOfPatrimony()
        window.history.replaceState(null, null, '#!stats?tab=ev-pat')
        break
      case 'tab-projections':
        Stats.initTabProjections()
        window.history.replaceState(null, null, '#!stats?tab=projections')
        break
      case 'tab-expenses-per-cat':
        Stats.clearCanvasAndTableWrapper('#chart_pie_cat_expenses_evolution_table', 'chart_pie_cat_expenses_evolution')
        $('#chart_pie_cat_expenses_evolution').remove()
        $('#canvas_chart_expenses_evo_wrapper').append(' <canvas id="chart_pie_cat_expenses_evolution" width="800" height="300"></canvas>')
        Stats.initExpensesPerCatEvolution()
        window.history.replaceState(null, null, '#!stats?tab=cat-expenses-evo')
        break
      case 'tab-income-per-cat':
        Stats.clearCanvasAndTableWrapper('#chart_pie_cat_income_evolution_table', 'chart_pie_cat_income_evolution')
        $('#chart_pie_cat_income_evolution').remove()
        $('#canvas_chart_income_evo_wrapper').append(' <canvas id="chart_pie_cat_income_evolution" width="800" height="300"></canvas>')

        Stats.initIncomePerCatEvolution()
        window.history.replaceState(null, null, '#!stats?tab=cat-income-evo')
        break
      case 'tab-year-by-year':
        Stats.initTabYearByYear()
        window.history.replaceState(null, null, '#!stats?tab=cat-year-by-year')
        break
      default:
        break
    }
  },
  initTabYearByYear: () => {
    LoadingManager.showLoading()
    StatServices.getYearByYearIncomeExpenseDistribution(yearByYearCurrentlySelectedYear,
      (resp) => {
        Stats.setupYearSelect('.year-select-wrapper', resp.year_of_first_trx, yearByYearCurrentlySelectedYear)
        // Category
        Stats.setupCategoryIncomeExpenseTable(resp.categories.filter((cat) => parseFloat(cat.category_yearly_income) > 0).
            sort((a, b) => b.category_yearly_income - a.category_yearly_income),
          '#year-by-year-table-credit-wrapper', true)
        Stats.setupCategoryIncomeExpenseTable(resp.categories.filter((cat) => parseFloat(cat.category_yearly_expense) > 0).
            sort((a, b) => b.category_yearly_expense - a.category_yearly_expense),
          '#year-by-year-table-debit-wrapper', false)

        // Entity
        Stats.setupEntityIncomeExpenseTable(resp.entities.filter((ent) => parseFloat(ent.entity_yearly_income) > 0).
            sort((a, b) => b.entity_yearly_income - a.entity_yearly_income),
          '#year-by-year-table-credit-wrapper-entity', true)
        Stats.setupEntityIncomeExpenseTable(resp.entities.filter((ent) => parseFloat(ent.entity_yearly_expense) > 0).
            sort((a, b) => b.entity_yearly_expense - a.entity_yearly_expense),
          '#year-by-year-table-debit-wrapper-entity', false)

        // Tag
        Stats.setupTagIncomeExpenseTable(resp.tags.filter((tag) => parseFloat(tag.tag_yearly_income) > 0).
            sort((a, b) => b.tag_yearly_income - a.tag_yearly_income),
          '#year-by-year-table-credit-wrapper-tag', true)
        Stats.setupTagIncomeExpenseTable(resp.tags.filter((tag) => parseFloat(tag.tag_yearly_expense) > 0).
            sort((a, b) => b.tag_yearly_expense - a.tag_yearly_expense),
          '#year-by-year-table-debit-wrapper-tag', false)


        $('select.year-selection-select').select2().on('change', (v) => {
          yearByYearCurrentlySelectedYear = $('select.year-selection-select').val()
          Stats.initTabYearByYear()
        })
        /* SUCCESS */
        const NET_INCOME_LABEL = Localization.getString('stats.netIncome')
        const OTHER_EXPENSES_LABEL = Localization.getString('stats.others')
        const categories = resp.categories
        let dataset = []
        let yearlyCategorizedIncome = 0
        let yearlyCategorizedExpense = 0
        // get top 10 debit categories
        let topDebitCategories = categories.filter(cat => cat.category_yearly_expense > 0).sort((a, b) => b - a).slice(0, 10)

        categories.forEach((cat) => {
          // INCOME
          if (cat.category_yearly_income && parseFloat(cat.category_yearly_income) !== 0) {
            dataset.push({
              from: cat.name + ' ',
              to: NET_INCOME_LABEL,
              flow: Math.round((cat.category_yearly_income + Number.EPSILON) * 100) / 100,
            })
          }
          // EXPENSE
          if (cat.category_yearly_expense && parseFloat(cat.category_yearly_expense) !== 0 && topDebitCategories.includes(cat)) {
            dataset.push({
              from: NET_INCOME_LABEL,
              to: cat.name,
              flow: Math.round((cat.category_yearly_expense + Number.EPSILON) * 100) / 100,
            })
          }
          yearlyCategorizedIncome += parseFloat(cat.category_yearly_income ?? 0)
          yearlyCategorizedExpense += parseFloat(cat.category_yearly_expense ?? 0)
        })

        const uncategorizedExpenses = yearlyCategorizedIncome - yearlyCategorizedExpense
        if (uncategorizedExpenses !== 0) {
          dataset.push({
            from: NET_INCOME_LABEL,
            to: OTHER_EXPENSES_LABEL,
            flow: uncategorizedExpenses,
          })
        }

        Stats.renderYearByYearCategoriesDistributionSankeyChart(dataset,
          (nodeName, isFrom) => {
            if (nodeName === OTHER_EXPENSES_LABEL) {
              return 'red'
            }
            if (isFrom && nodeName !== NET_INCOME_LABEL) {
              return 'slategray'
            }
            else if (nodeName === NET_INCOME_LABEL) {
              return chartUtils.getRandomVariantOfGreen()/*'#008000'*//*'slategray'*/
            }
            return /*chartUtils.getRandomVariantOfOrange()*/'#ff7b72'
          })
        LoadingManager.hideLoading()
      }, (err) => {
        /* ERROR */
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  setupCategoryIncomeExpenseTable: (categories, wrapperId, isCredit) => {
    $(wrapperId).html('')
    const tableId = `table-${StringUtils.normalizeStringForHtml(wrapperId)}`
    const html = `
      <table id='${tableId}' class='display browser-defaults' style='width:100%'>
        <thead>
            <tr>
              <th>${Localization.getString('transactions.category')}</th>
              <th>${Localization.getString('common.value')}</th>
            </tr>
        </thead>
        <tbody>
          ${categories.map((category) => Stats.renderCategoryIncomeExpenseTableRow(category, isCredit)).
      join('')}
        </tbody>
    </table>
    `

    $(wrapperId).html(html)
    TableUtils.setupStaticTable(`table#${tableId}`, undefined, true, [[1, 'desc']], 5)
  },
  renderCategoryIncomeExpenseTableRow: (category, isCredit) => {
    return `
    <tr>
        <td>${category.name}</td>
        <td>${StringUtils.formatMoney(isCredit ? category.category_yearly_income : category.category_yearly_expense)}</td>
    </tr>
    `
  },
  setupEntityIncomeExpenseTable: (entities, wrapperId, isCredit) => {
    $(wrapperId).html('')
    const tableId = `table-${StringUtils.normalizeStringForHtml(wrapperId)}`
    const html = `
      <table id='${tableId}' class='display browser-defaults' style='width:100%'>
        <thead>
            <tr>
              <th>${Localization.getString('transactions.entity')}</th>
              <th>${Localization.getString('common.value')}</th>
            </tr>
        </thead>
        <tbody>
          ${entities.map((entity) => Stats.renderEntityIncomeExpenseTableRow(entity, isCredit)).
      join('')}
        </tbody>
    </table>
    `

    $(wrapperId).html(html)
    TableUtils.setupStaticTable(`table#${tableId}`, undefined, true, [[1, 'desc']], 5)
  },
  renderEntityIncomeExpenseTableRow: (entity, isCredit) => {
    return `
    <tr>
        <td>${entity.name}</td>
        <td>${StringUtils.formatMoney(isCredit ? entity.entity_yearly_income : entity.entity_yearly_expense)}</td>
    </tr>
    `
  },
  setupTagIncomeExpenseTable: (tags, wrapperId, isCredit) => {
    $(wrapperId).html('')
    const tableId = `table-${StringUtils.normalizeStringForHtml(wrapperId)}`
    const html = `
      <table id='${tableId}' class='display browser-defaults' style='width:100%'>
        <thead>
            <tr>
              <th>${Localization.getString('tags.tag')}</th>
              <th>${Localization.getString('common.value')}</th>
            </tr>
        </thead>
        <tbody>
          ${tags.map((tag) => Stats.renderTagIncomeExpenseTableRow(tag, isCredit)).
      join('')}
        </tbody>
    </table>
    `

    $(wrapperId).html(html)
    TableUtils.setupStaticTable(`table#${tableId}`, undefined, true, [[1, 'desc']], 5)
  },
  renderTagIncomeExpenseTableRow: (tag, isCredit) => {
    return `
    <tr>
        <td>${tag.name}</td>
        <td>${StringUtils.formatMoney(isCredit ? tag.tag_yearly_income : tag.tag_yearly_expense)}</td>
    </tr>
    `
  },
  setupYearSelect: (wrapperDivLocator, firstYear, selectedYear) => {
    const currentYear = DateUtils.getCurrentYear()
    let yearsArr = []
    let cYear = firstYear
    while (cYear <= currentYear) {
      yearsArr.push(cYear)
      cYear++
    }

    $(wrapperDivLocator).html(`
      <div class="input-field col s3">
          <select id="year_select" class="year-selection-select">
              ${yearsArr.map(year => Stats.renderYearSelectOption(year, selectedYear)).join('')}
          </select>
      </div>
    `)
  },
  renderYearSelectOption: (year, selectedYearValue) => {
    return `
            <option value="${year}" ${year == selectedYearValue ? 'selected' : ''}>${year}</option>
        `
  },
  renderYearByYearCategoriesDistributionSankeyChart: (dataset, getColor) => {
    if (dataset.length === 0) {
      return
    }
    if (YEAR_BY_YEAR_SANKEY_CHART) {
      YEAR_BY_YEAR_SANKEY_CHART.destroy()
    }
    YEAR_BY_YEAR_SANKEY_CHART = chartUtils.setupSankeyChart('chart', Localization.getString('stats.incomeDistributionByExpenseCategories'), dataset,
      getColor)
  },
  clearCanvasAndTableWrapper: (tableWrapperLocator, canvasLocator) => {
    $(tableWrapperLocator).html('')
    let canvas = document.getElementById(canvasLocator)
    let context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
  },
  initExpensesPerCatEvolution: () => {
    LoadingManager.showLoading()
    const options = [
      {
        id: INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY,
        name: Localization.getString('stats.month'),
      },
      {
        id: INCOME_EXPENSES_EVO_TOGGLE_OPTION_YEAR_KEY,
        name: Localization.getString('stats.year'),
      },
    ]
    ToggleComponent.buildToggle(EXPENSES_EVO_TOGGLE_ID, 'expenses-month-year-toggle-wrapper', options, INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY,
      (optionId) => {
        Stats.onExpensesEvoFiltersChanged(true)
      })
    UserServices.getAllCategoriesEntitiesTagsForUser(
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        Stats.setupCategorySelect(resp.categories, resp.entities, resp.tags, '#tab-expenses-per-cat')

        $('#tab-expenses-per-cat').find('select.category-selection-select').select2()
        $('select.category-selection-select').on('change', (v) => {
          Stats.onExpensesEvoFiltersChanged(false)
        })
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      },
    )
  },
  onExpensesEvoFiltersChanged: (useCachedData = false) => {
    let selectedPeriod = ToggleComponent.getSelectedOptionId(EXPENSES_EVO_TOGGLE_ID)
    let selectedEntCatTagId = $('#tab-expenses-per-cat').find('select.category-selection-select').val()
    let selectedCatId, selectedEntId, selectedTagId
    if (selectedEntCatTagId.startsWith('cat-')) {
      selectedCatId = selectedEntCatTagId.split('cat-')[1]
    } else if (selectedEntCatTagId.startsWith('ent-')) {
      selectedEntId = selectedEntCatTagId.split('ent-')[1]
    } else if (selectedEntCatTagId.startsWith('tag-')) {
      selectedTagId = selectedEntCatTagId.split('tag-')[1]
    }

    Stats.clearCanvasAndTableWrapper('#chart_pie_cat_expenses_evolution_table', 'chart_pie_cat_expenses_evolution')
    if (!useCachedData) {
      LoadingManager.showLoading()
      StatServices.getCategoryExpensesEvolution(selectedCatId, selectedEntId, selectedTagId,
        (resp) => {
          // SUCCESS
          // cache into memory
          categoryExpensesEvolutionDataCache = resp
          LoadingManager.hideLoading()
          let usableData
          if (selectedPeriod === INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY) {
            usableData = resp
          }
          else {
            usableData = Stats.transformMonthlyEvoDataToYearly(resp)
          }
          Stats.renderExpensesPerCategoryTable(usableData, selectedPeriod)
          Stats.renderExpensesPerCategoryLineChart(usableData, selectedPeriod)
        }, (resp) => {
          // FAILURE
          LoadingManager.hideLoading()
          DialogUtils.showErrorMessage()
        })
    }
    else {
      let usableData
      if (selectedPeriod === INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY) {
        usableData = JSON.parse(JSON.stringify(categoryExpensesEvolutionDataCache))
      }
      else {
        usableData = Stats.transformMonthlyEvoDataToYearly(categoryExpensesEvolutionDataCache)
      }
      Stats.renderExpensesPerCategoryTable(usableData, selectedPeriod)
      Stats.renderExpensesPerCategoryLineChart(usableData, selectedPeriod)
    }
  },
  renderExpensesPerCategoryLineChart: (dataset, selectedPeriod) => {
    let chartData = []
    let chartLabels = []

    for (var i = dataset.length - 1; i >= 0; i--) {
      chartData.push(dataset[i].value)
      chartLabels.push(selectedPeriod === INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY ?
        `${dataset[i].month}/${dataset[i].year}` : `${dataset[i].year}`,
      )
    }

    const ctx = document.getElementById('chart_pie_cat_expenses_evolution').getContext('2d')

    const chartTitle = Localization.getString('stats.expensesEvolution')
    const customOptions = chartUtils.getDefaultCustomOptionsForLineChart(chartTitle)

    const data = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          label: chartTitle,
          borderColor: '#3e95cd',
          fill: true,
          trendlineLinear: chartUtils.getTrendLineObject(),
        },
      ],
    }
    if (EXPENSES_PER_CATEGORY_LINE_CHART) {
      EXPENSES_PER_CATEGORY_LINE_CHART.destroy()
    }
    EXPENSES_PER_CATEGORY_LINE_CHART = new Chart(ctx, {
      type: 'line',
      data: data,
      options: customOptions,
    })
  },
  renderExpensesPerCategoryTable: (data, period) => {
    $('div#chart_pie_cat_expenses_evolution_table').html(`
      <table id='cat-expenses-evolution-table' class='display browser-defaults' style='width:100%'>
        <thead>
          <tr>
            <th>${Localization.getString('stats.month')}</th>
            <th>${Localization.getString('common.value')}</th>
            <th>${Localization.getString('stats.variationPercentage')}</th>
          </tr>
        </thead>
      <tbody>
      ${data.map((month, index) => Stats.renderExpensesPerCategoryTableRow(((index < data.length) ? (data[index + 1]) : null), month,
      period !== INCOME_EXPENSES_EVO_TOGGLE_OPTION_YEAR_KEY)).
      join('')}
      </tbody>
    </table>
    `,
    )

    TableUtils.setupStaticTable('table#cat-expenses-evolution-table')
  },
  renderExpensesPerCategoryTableRow: (oldMonth, monthData, isMonth) => {

    return `
    <tr>
    <td>${isMonth ? monthData.month + '/' + monthData.year : monthData.year}</td>
    <td>${StringUtils.formatMoney(monthData.value)}</td>
    <td>${(!oldMonth) ? '-' : Stats.calculateGrowthPercentage(oldMonth.value, monthData.value)}</td>
    </tr>
    `

  },
  setupCategorySelect: (categories, entities, tags, wrapperDivLocator) => {
    $(wrapperDivLocator).find('div.categories-select-wrapper').html(
      `
    <div class='input-field col s3'>
    <select id='category_select' class='category-selection-select'>
    <option value='' disabled selected>${Localization.getString('stats.chooseACategory')}</option>
    <optgroup label="${Localization.getString('stats.categories')}">
    ${categories.map(cat => Stats.renderCategorySelectOption(cat)).join('')}
    </optgroup>
    <optgroup label="${Localization.getString('stats.entities')}">
    ${entities.map(ent => Stats.renderEntitySelectOption(ent)).join('')}
    </optgroup>
    <optgroup label="${Localization.getString('stats.tags')}">
    ${tags.map(tag => Stats.renderTagSelectOption(tag)).join('')}
    </optgroup>
    </select>
    </div>
    `,
    )
  },
  renderCategorySelectOption: cat => {
    return `
    <option value='cat-${cat.category_id}'>${cat.name}</option>
    `
  },
  renderEntitySelectOption: ent => {
    return `
    <option value='ent-${ent.entity_id}'>${ent.name}</option>
    `
  },
  renderTagSelectOption: tag => {
    return `
    <option value='tag-${tag.tag_id}'>${tag.name}</option>
    `
  },
  initIncomePerCatEvolution: () => {
    LoadingManager.showLoading()
    UserServices.getAllCategoriesEntitiesTagsForUser(
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        Stats.setupCategorySelect(resp.categories, resp.entities, resp.tags, '#tab-income-per-cat')
        const options = [
          {
            id: INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY,
            name: Localization.getString('stats.month'),
          },
          {
            id: INCOME_EXPENSES_EVO_TOGGLE_OPTION_YEAR_KEY,
            name: Localization.getString('stats.year'),
          },
        ]
        ToggleComponent.buildToggle(INCOME_EVO_TOGGLE_ID, 'income-month-year-toggle-wrapper', options, INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY,
          (optionId) => {
            Stats.onIncomeEvoFiltersChanged(true)
          })

        $('#tab-income-per-cat').find('select.category-selection-select').select2()
        $('select.category-selection-select').on('change', (v) => {
          Stats.onIncomeEvoFiltersChanged()
        })
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      },
    )
  },
  onIncomeEvoFiltersChanged: (useCachedData = false) => {
    let selectedPeriod = ToggleComponent.getSelectedOptionId(INCOME_EVO_TOGGLE_ID)
    let selectedEntCatTagId = $('#tab-income-per-cat').find('select.category-selection-select').val()
    let selectedCatId,
      selectedEntId, selectedTagId
    if (selectedEntCatTagId.startsWith('cat-')) {
      selectedCatId = selectedEntCatTagId.split('cat-')[1]
    } else if (selectedEntCatTagId.startsWith('ent-')) {
      selectedEntId = selectedEntCatTagId.split('tag-')[1]
    } else if (selectedEntCatTagId.startsWith('tag-')) {
      selectedTagId = selectedEntCatTagId.split('tag-')[1]
    }

    Stats.clearCanvasAndTableWrapper('#chart_pie_cat_income_evolution_table', 'chart_pie_cat_income_evolution')

    if (!useCachedData) {
      LoadingManager.showLoading()
      StatServices.getCategoryIncomeEvolution(selectedCatId, selectedEntId,
        selectedTagId,
        (resp) => {
          // SUCCESS
          // cache into memory
          categoryIncomeEvolutionDataCache = resp
          LoadingManager.hideLoading()
          let usableData
          if (selectedPeriod === INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY) {
            usableData = resp
          }
          else {
            usableData = Stats.transformMonthlyEvoDataToYearly(resp)
          }
          Stats.renderIncomePerCategoryTable(usableData, selectedPeriod)
          Stats.renderIncomePerCategoryLineChart(usableData, selectedPeriod)
        }, (resp) => {
          // FAILURE
          LoadingManager.hideLoading()
          DialogUtils.showErrorMessage()
        })
    }
    else {
      let usableData = []
      if (selectedPeriod === INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY) {
        usableData = JSON.parse(JSON.stringify(categoryIncomeEvolutionDataCache))
      }
      else {
        usableData = Stats.transformMonthlyEvoDataToYearly(categoryIncomeEvolutionDataCache)
      }
      Stats.renderIncomePerCategoryTable(usableData, selectedPeriod)
      Stats.renderIncomePerCategoryLineChart(usableData, selectedPeriod)
    }
  },
  transformMonthlyEvoDataToYearly: (data) => {
    let transformedData = []
    // transform
    JSON.parse(JSON.stringify(data)).forEach((value) => {
      if (transformedData.some((dp => dp.year === value.year))) {
        // array entry already exists. Increment value
        let entry = transformedData.find((dp => dp.year === value.year))
        entry.value += value.value
      }
      else {
        transformedData.push(value)
      }
    })

    return transformedData
  },
  renderIncomePerCategoryLineChart: (dataset, selectedPeriod) => {
    let chartData = []
    let chartLabels = []

    for (var i = dataset.length - 1; i >= 0; i--) {
      chartData.push(dataset[i].value)
      chartLabels.push(selectedPeriod === INCOME_EXPENSES_EVO_TOGGLE_OPTION_MONTH_KEY ?
        `${dataset[i].month}/${dataset[i].year}` : `${dataset[i].year}`,
      )
    }

    const ctx = document.getElementById('chart_pie_cat_income_evolution').getContext('2d')

    const chartTitle = Localization.getString('stats.incomeEvolution')
    const customOptions = chartUtils.getDefaultCustomOptionsForLineChart(chartTitle)

    const data = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          label: Localization.getString('stats.incomeEvolutionByCategory'),
          borderColor: '#3e95cd',
          fill: true,
          trendlineLinear: chartUtils.getTrendLineObject(),
        },
      ],
    }
    if (INCOME_PER_CATEGORY_LINE_CHART) {
      INCOME_PER_CATEGORY_LINE_CHART.destroy()
    }
    INCOME_PER_CATEGORY_LINE_CHART = new Chart(ctx, {
      type: 'line',
      data: data,
      options: customOptions,
    })
  },
  renderIncomePerCategoryTable: (data, period) => {
    $('div#chart_pie_cat_income_evolution_table').html(
      `
    <table id='cat-income-evolution-table' class='display browser-defaults' style='width:100%'>
    <thead>
    <tr>
    <th>${Localization.getString('stats.month')}</th>
    <th>${Localization.getString('common.value')}</th>
    <th>${Localization.getString('stats.variationPercentage')}</th>
    </tr>
    </thead>
    <tbody>
    ${data.map((month, index) => Stats.renderIncomePerCategoryTableRow(((index < data.length) ? (data[index + 1]) : null), month,
        period !== INCOME_EXPENSES_EVO_TOGGLE_OPTION_YEAR_KEY)).
        join('')}
    </tbody>
    </table>
    `,
    )

    TableUtils.setupStaticTable('table#cat-income-evolution-table')
  },
  renderIncomePerCategoryTableRow: (oldMonth, monthData, isMonth) => {

    return `
    <tr>
    <td>${isMonth ? monthData.month + '/' + monthData.year : monthData.year}</td>
    <td>${StringUtils.formatMoney(monthData.value)}</td>
    <td>${(!oldMonth) ? '-' : Stats.calculateGrowthPercentage(oldMonth.value, monthData.value)}</td>
    </tr>
    `

  },
  transformList: list => {
    let cLabels = []
    let cAggData = []
    let accsList = []
    let extraChartData = []

    accsList = LocalDataManager.getUserAccounts()

    for (const elem of list) {
      const genKey =
        `${elem.month}/${elem.year}`

      cLabels.push(genKey)

      for (const acc of elem.account_snapshots) {
        let fullAccount = accsList.filter((ac) => {
          return ac.account_id == acc.account_id
        })[0]
        let extraDataObj = extraChartData.filter(e => e.account_id == acc.account_id)[0]
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
          )
        }
        else {
          // record exists already. Just update its data
          extraDataObj.data.push(acc.balance)
        }

      }

      let aggregateBalance = elem.account_snapshots.reduce((acc, item) => {
        return acc + StringUtils.convertFloatToInteger(item.balance)
      }, 0)
      cAggData.push(StringUtils.convertIntegerToFloat(aggregateBalance))
    }
    Stats.setupPatrimonyLineChart(cAggData, cLabels, extraChartData)
    Stats.setupPatrimonyTable(cAggData.slice().reverse(), cLabels.slice().reverse())
    TableUtils.setupStaticTable('#ev-pat-table')

  },
  setupPatrimonyTable: (sumArr, sumLabels) => {
    $('#patrimony-table').html(Stats.renderPatrimonyTable(sumArr, sumLabels))
  },
  renderPatrimonyTable: (sumArr, sumLabels) => {
    return `
    <table id='ev-pat-table' class='centered' style='margin-top: 10px;'>
    <thead>
    <tr>
    <th>${Localization.getString('stats.month')}</th>
    <th>${Localization.getString('stats.previousBalance')}</th>
    <th>${Localization.getString('stats.finalBalance')}</th>
    <th>${Localization.getString('stats.monthlyBalance')}</th>
    <th>${Localization.getString('stats.growth')}</th>
    </tr>
    </thead>
    <tbody>
    ${sumLabels.map((label, index) => Stats.renderPatrimonyTableRow(label, sumArr[index + 1], sumArr[index])).join('')}
    </tbody>
    </table>
    `

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
    `

  },
  calculateGrowthPercentage: (val1, val2) => {
    const percentageChange = (((parseFloat(val2) - parseFloat(val1)) / Math.abs(parseFloat(val1))) * 100).toFixed(2)

    if (percentageChange == 0) {
      return `<span>${percentageChange}%</span>`

    }
    else if (percentageChange < 0) {
      return `<span class='badge pink-text text-accent-1'>${percentageChange}%</span>`

    }
    else {
      return `<span class='badge green-text text-accent-4'>${percentageChange}%</span>`

    }
  },
  setupPatrimonyLineChart: (chartData, chartLabels, extraChartData) => {
    const ctx = document.getElementById('chart_pie_patrimony_evolution').getContext('2d')

    const chartTitle = Localization.getString('stats.netWorthEvolution')
    const customOptions = chartUtils.getDefaultCustomOptionsForLineChart(chartTitle)

    const data = {
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
    if (EVOLUTION_LINE_CHART) {
      EVOLUTION_LINE_CHART.destroy()
    }
    EVOLUTION_LINE_CHART = new Chart(ctx, {
      type: 'line',
      data: data,
      options: customOptions,
    })
  },
  setupPatrimonyProjectionsList (resp) {
    $('#patrimony-projections-table').html(Stats.renderPatrimonyProjectionsTable(resp))
    TableUtils.setupStaticTable('#ev-pat-projections-table')
  },
  getInitialAssetsBalance (accs) {
    const allAccs = accs//LocalDataManager.getUserAccounts()
    const assetsAccounts = allAccs.filter(function (acc) {
      return acc.type === account_types_tag.CHEAC || acc.type === account_types_tag.SAVAC
        || acc.type === account_types_tag.INVAC || acc.type === account_types_tag.OTHAC
        || acc.type === account_types_tag.WALLET || acc.type === account_types_tag.MEALAC
    })

    let assetsBalance = assetsAccounts.reduce((acc, val) => {
      return acc + parseFloat(val.balance)
    }, 0)

    return assetsBalance
  },
  renderPatrimonyProjectionsTable: budgets => {
    return `
    <table id='ev-pat-projections-table' class='centered' style='margin-top: 10px;'>
    <thead>
    <tr>
    <th>${Localization.getString('stats.month')}</th>
    <th>${Localization.getString('stats.previousBalance')}<span class="projections-table-footnotes">*</span></th>
    <th>${Localization.getString('stats.finalBalance')}<span class="projections-table-footnotes">*</span></th>
    <th>${Localization.getString('stats.finalBalanceAssets')}<span class="projections-table-footnotes">**</span></th>
    <th>${Localization.getString('stats.finalBalanceOperatingFunds')}<span class="projections-table-footnotes">***</span></th>
    <th>${Localization.getString('stats.growth')}</th>
    </tr>
    </thead>
    <tbody>
    ${budgets.map((budget, index) => Stats.renderPatrimonyProjectionsTableRow(budget)).join('')}
    </tbody>
    </table>
    <style>
    .projections-table-footnotes{
    font-size: small;
    }
    </style>
    <p class="right-align grey-text text-accent-4 projections-table-footnotes">* ${Localization.getString('stats.projectionsTableFootnotes1')}</p>
    <p class="right-align grey-text text-accent-4 projections-table-footnotes">** ${Localization.getString('stats.projectionsTableFootnotes2')}</p>
    <p class="right-align grey-text text-accent-4 projections-table-footnotes">*** ${Localization.getString('stats.projectionsTableFootnotes3')}</p>
    `

  },
  renderPatrimonyProjectionsTableRow: (budget) => {
    return `
    <tr>
    <td>${budget.month}/${budget.year}</td>
    <td>${StringUtils.formatMoney(budget.planned_initial_balance)}</td>
    <td>${StringUtils.formatMoney(budget.planned_final_balance)}</td>
    <td>${StringUtils.formatMoney(budget.planned_final_balance_assets_only)}</td>
    <td>${StringUtils.formatMoney(budget.planned_final_balance_operating_funds_only)}</td>
    <td>${(budget.planned_initial_balance)
      ? Stats.calculateGrowthPercentage(budget.planned_initial_balance, budget.planned_final_balance)
      : '-'}</td>
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
  getTotalBalanceFromInvestmentAccounts: () => {
    const investAccounts = LocalDataManager.getInvestmentAccounts()
    if (!investAccounts) {
      return 0
    }
    return investAccounts.reduce((acc, val) => {
      return acc + parseFloat(val.balance)
    }, 0)
  },
  setupPatrimonyProjectionsLineChart: (chartData, chartLabels, extraChartData) => {
    const ctx = document.getElementById('chart_pie_patrimony_projection').getContext('2d')

    const chartTitle = Localization.getString('stats.netWorthEvolutionProjection')
    const customOptions = chartUtils.getDefaultCustomOptionsForLineChart(chartTitle)

    const data = {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          label: Localization.getString('stats.projectedBalanceAssetsPlusDebt'),
          borderColor: '#3e95cd',
          fill: true,
        },
        ...extraChartData,
      ],
    }
    if (PROJECTIONS_LINE_CHART) {
      PROJECTIONS_LINE_CHART.destroy()
    }
    PROJECTIONS_LINE_CHART = new Chart(ctx, {
      type: 'line',
      data: data,
      options: customOptions,
    })
  },
}

//# sourceURL=js/stats.js
