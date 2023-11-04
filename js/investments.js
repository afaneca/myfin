import { DialogUtils } from "./utils/dialogUtils.js";
import { chartUtils } from "./utils/chartUtils.js";
import { LayoutUtils } from "./utils/layoutUtils.js";
import { InvestmentDashboardChartsFunc } from "./funcs/investmentDashboardChartsFunc.js";
import { InvestmentAssetsTableFunc } from "./funcs/investmentAssetsTableFunc.js";
import { InvestAssetsModalFunc } from "./funcs/investAssetsModalFunc.js";
import { InvestmentTransactionsTableFunc } from "./funcs/investmentTransactionsTableFunc.js";
import { InvestTransactionsModalFunc } from "./funcs/investTransactionsModalFunc.js";
import { InvestmentReportsTableFunc } from "./funcs/investmentReportsTableFunc.js";
import { GraphEmptyViewComponent } from "./components/graphEmptyView.js";
import { TableUtils } from "./utils/tableUtils.js";
import { LoadingManager } from "./utils/loadingManager.js";
import { InvestServices } from "./services/investServices.js";
import { StringUtils } from "./utils/stringUtils.js";
import { Localization } from "./utils/localization.js";
import { configs } from './configs.js'
import { TransactionServices } from './services/transactionServices.js'

let showInactiveAssets = false
let transactionsTableInstance = null;
export const Investments = {
  addNewAssetClicked: () => {
    InvestAssetsModalFunc.buildAddNewAccountModal('#modal-global',
        Investments.addAsset);
  },
  addNewTransactionClicked: () => {
    LoadingManager.showLoading();
    InvestServices.getAllAssetsSummary((res) => {
      // SUCCESS
      LoadingManager.hideLoading();
      InvestTransactionsModalFunc.buildAddNewTransactionModal('#modal-global',
          res, Investments.addTransaction);
    }, (err) => {
      // FAILURE
      LoadingManager.hideLoading();
      DialogUtils.showErrorMessage();
    });

  },
  addTransaction: (date, units, fees, amount, type, observations, assetId, isSplit, splitTotalPrice, splitUnits, splitNote, splitType) => {
    LoadingManager.showLoading();
    InvestServices.addTransaction(date, observations, amount, parseFloat(units),
        fees, assetId, type, isSplit, splitTotalPrice, splitUnits, splitNote, splitType,
        (res) => {
          // SUCCESS
          DialogUtils.showSuccessMessage(Localization.getString(
              'investments.transactionSuccessfullyAdded'));
          /*$('#modal-global')
            .modal('close');
          Investments.changeTabs('tab-inv-transactions');*/

          InvestServices.getAssetDetails(assetId,
              (assetDetails) => {
                // SUCCESS
                LoadingManager.hideLoading();
                Investments.updateAssetValueClicked(assetId, assetDetails.name,
                    assetDetails.current_value);
              }, (err2) => {
                // FAILURE
                LoadingManager.hideLoading();
                DialogUtils.showErrorMessage();
              });
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage();
        });
  },
  addAsset: (name, ticker, type, broker) => {
    LoadingManager.showLoading();
    InvestServices.addAsset(name, ticker, type, broker,
        (res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          DialogUtils.showSuccessMessage(
              Localization.getString('investments.assetSuccessfullyAdded'));
          $('#modal-global').modal('close');
          Investments.changeTabs('tab-inv-assets');
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage();
        });
  },
  editAssetClicked: (assetId, ticker, name, type, broker) => {
    InvestAssetsModalFunc.showEditAssetModal('#modal-global', assetId, ticker,
        name, type, broker, Investments.editAsset);
  },
  removeAssetClicked: (assetId) => {
    InvestAssetsModalFunc.showRemoveAssetConfirmationModal('#modal-global',
        assetId, Investments.removeAsset);
  },
  editAsset: (assetId, ticker, name, type, broker) => {
    LoadingManager.showLoading();
    InvestServices.editAsset(assetId, ticker, name, type, broker,
        (res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          $('#modal-global').modal('close');
          Investments.changeTabs('tab-inv-assets');
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage();
        },
    );
  },
  removeAsset: assetId => {
    LoadingManager.showLoading();
    InvestServices.deleteAsset(assetId,
        (res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          $('#modal-global').modal('close');
          Investments.changeTabs('tab-inv-assets');
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage();
        },
    );
  },
  /*
  * TABS LISTENER
  * */
  changeTabs: activeID => {
    switch (activeID) {
      case 'tab-inv-dashboard':
        LoadingManager.showLoading();
        InvestServices.getAllAssetStats((res) => {
          LoadingManager.hideLoading();
          // SUCCESS
          /*Investments.buildInvestmentsEvolutionLineChart(res['monthly_snapshots']);*/
          Investments.initTopPerformingAssetsStats(
              res['top_performing_assets'][0], res['top_performing_assets'][1],
              res['top_performing_assets'][2], res['total_current_value']);
          Investments.buildDashboardAssetsDistributionPieChart(
              'dashboard_assets_distribution_pie_chart',
              res['current_value_distribution']);
          Investments.buildDashboardCards(res);
        });
        window.history.replaceState(null, null, '#!investments?tab=dashboard');
        break;
      case 'tab-inv-assets':
        LoadingManager.showLoading();
        InvestServices.getAllAssets((res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          Investments.initTabAssets(res);
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage();
        });
        window.history.replaceState(null, null, '#!investments?tab=assets');
        break;
      case 'tab-inv-transactions':
        LoadingManager.showLoading();
        InvestServices.getAllTransactions((res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          Investments.initTabTransactions(res);
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage();
        });
        window.history.replaceState(null, null,
            '#!investments?tab=transactions');
        break;
      case 'tab-inv-reports':
        LoadingManager.showLoading();
        InvestServices.getAllAssetStats((res) => {
          LoadingManager.hideLoading();
          // SUCCESS
          Investments.buildTopicsIndex();
          Investments.buildInvestmentsEvolutionLineChart(
              res['monthly_snapshots']);
          Investments.buildDashboardAssetsDistributionPieChart(
              'reports_assets_distribution_pie_chart',
              res['current_value_distribution']);
          Investments.buildDashboardInvestmentsDistributionPieChart(
              'reports_investments_distribution_pie_chart',
              res['top_performing_assets'], res['total_current_value']);
          Investments.buildReportsROIByAssetTable('roi_by_asset_table_wrapper',
              res['top_performing_assets'], res['total_current_value']);
          Investments.buildRoiByYearTable('table-wrapper-roi-by-year',
              res['combined_roi_by_year']);
        });

        /*Investments.initTopPerformingAssetsStats();*/
        window.history.replaceState(null, null, '#!investments?tab=reports');
        break;
      default:
        break;
    }
  },
  buildTopicsIndex: () => {
    $('#topics-index-wrapper').html(`
        <center style="padding: 25px;">
          <a id="topic-distribution-card" class="card topics-index-wrapper-card">${Localization.getString(
        'investments.distribution')}</a>
          <a id="topic-roi-by-asset-card" class="card topics-index-wrapper-card">${Localization.getString(
        'investments.returnsByAsset')}</a>
          <a id="topic-roi-by-asset-class-card" class="card topics-index-wrapper-card">${Localization.getString(
        'investments.returnsByAssetClass')}</a>
          <a id="topic-roi-by-year-card" class="card topics-index-wrapper-card">${Localization.getString(
        'investments.combinedPerformanceByYear')}</a>
          <a id="topic-evo-chart-card" class="card topics-index-wrapper-card">${Localization.getString(
        'investments.portfolioEvolution')}</a>
        </center>
      `);

    $('#topic-distribution-card').
        click(() => LayoutUtils.smoothScrollToDiv('#topic-distribution'));
    $('#topic-roi-by-asset-card').
        click(() => LayoutUtils.smoothScrollToDiv('#topic-roi-by-asset'));
    $('#topic-roi-by-asset-class-card').
        click(() => LayoutUtils.smoothScrollToDiv('#topic-roi-by-asset-class'));
    $('#topic-roi-by-year-card').
        click(() => LayoutUtils.smoothScrollToDiv('#topic-roi-by-year'));
    $('#topic-evo-chart-card').
        click(() => LayoutUtils.smoothScrollToDiv('#topic-evo-chart'));
  },
  buildRoiByYearTable: (tableWrapperId, roiByYearList) => {
    $(`#${tableWrapperId}`).
        html(InvestmentReportsTableFunc.buildReportsROIByYearTable(
            'table-reports-roi-by-year', roiByYearList));
    TableUtils.setupStaticTable('#table-reports-roi-by-year');
  },
  buildReportsROIByAssetTable: (
      tableWrapperId, assetsList, totalInvestedValue) => {
    $(`#${tableWrapperId}`).
        html(InvestmentReportsTableFunc.buildReportsROIByAssetTable(
            'table-reports-roi-by-asset', assetsList, totalInvestedValue));
    TableUtils.setupStaticTable('#table-reports-roi-by-asset');
  },
  initTopPerformingAssetsStats: (
      asset1, asset2, asset3, totalInvestedValue) => {
    $('#invest-reports-top-performing-wrapper').html(`
          <ul class="collection">
            <li class="collection-item avatar">
                <i class="material-icons circle green" style="color:white !important;">looks_one</i>
                <span class="title" style="font-weight: bold;">${asset1
        ? asset1.name
        : '-'}</span>
                <p>${asset1 ? StringUtils.getInvestingAssetObjectById(
        asset1.type).name : '-'}
                    <br>${(asset1 && totalInvestedValue &&
        totalInvestedValue !== 0)
        ? Localization.getString('investments.percentageOfPortfolio', {
          percentage: StringUtils.formatStringToPercentage(
              (asset1.current_value / totalInvestedValue) * 100),
        })
        : '-'}
                <span class="secondary-content" style="font-size: larger;">${asset1
        ? StringUtils.formatSignedMoney(asset1.absolute_roi_value)
        : '-'}</span>
            </li>
            <li class="collection-item avatar">
                <i class="material-icons circle orange" style="color:white !important;">looks_two</i>
                <span class="title" style="font-weight: bold;">${asset2
        ? asset2.name
        : '-'}</span>
                <p>${asset2 ? StringUtils.getInvestingAssetObjectById(
        asset2.type).name : '-'}<br>
                    ${(asset2 && totalInvestedValue && totalInvestedValue !== 0)
        ? Localization.getString('investments.percentageOfPortfolio', {
          percentage: StringUtils.formatStringToPercentage(
              (asset2.current_value / totalInvestedValue) * 100),
        }) : '-'}
                </p>
                <!--<a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>-->
                <span class="secondary-content">${asset2
        ? StringUtils.formatSignedMoney(asset2.absolute_roi_value)
        : '-'}</span>
            </li>
            <li class="collection-item avatar">
                <i class="material-icons circle" style="color:white !important;">looks_3</i>
                <span class="title" style="font-weight: bold;">${asset3
        ? asset3.name
        : '-'}</span>
                <p>${asset3 ? StringUtils.getInvestingAssetObjectById(
        asset3.type).name : '-'}<br>
                    ${(asset3 && totalInvestedValue && totalInvestedValue !== 0)
        ? Localization.getString('investments.percentageOfPortfolio', {
          percentage: StringUtils.formatStringToPercentage(
              (asset3.current_value / totalInvestedValue) * 100),
        }) : '-'}
                </p>
                <span class="secondary-content">${asset3
        ? StringUtils.formatSignedMoney(asset3.absolute_roi_value)
        : '-'}</span>
            </li>
        </ul>
    `);
  },
  buildInvestmentsEvolutionLineChart: (snapshotsList) => {
    if (!snapshotsList || !snapshotsList.length) {
      $('#dashboard_evolution_line_chart').hide();
      $('#evo-line-chart').
          find('.empty-view').
          html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());
    }

    const chartLabels = [];
    const aggData = []; // ex: aggData["asset"] => sum of values

    for (const snapshot of snapshotsList) {
      const genKey = `${snapshot.month}/${snapshot.year}`;
      const current_value = snapshot.current_value;

      if (!Object.keys(aggData).includes(genKey)) {
        // Asset not yet in aggData => add it (and yo chartLabels to)
        chartLabels.push(genKey);
        aggData[genKey] = 0;
      }
      // Asset already in aggData => add value to sum
      aggData[genKey] += parseFloat(current_value);
    }

    InvestmentDashboardChartsFunc.buildInvestmentsvolutionLineChart(
        'dashboard_evolution_line_chart', chartLabels, Object.values(aggData),
        []);
  },
  buildDashboardCards: (res) => {
    $('#invest-dashboard-top-panel-current-value').
        text(StringUtils.formatMoney(res['total_current_value']));
    $('#invest-dashboard-top-panel-invested-value').
        text(StringUtils.formatMoney(res['total_invested_value']));
    $('#invest-dashboard-top-panel-roi-current-year-value').
        text(StringUtils.formatMoney(res['current_year_roi_value']));
    $('#invest-dashboard-top-panel-roi-current-year-percentage').
        text(StringUtils.formatStringToPercentage(
            res['current_year_roi_percentage']));
    $('#invest-dashboard-top-panel-roi-global-value').
        text(StringUtils.formatMoney(res['global_roi_value']));
    $('#invest-dashboard-top-panel-roi-global-percentage').
        text(StringUtils.formatStringToPercentage(res['global_roi_percentage']));
  },
  buildDashboardInvestmentsDistributionPieChart: (
      canvasId, assetsList, totalInvestmentValue) => {
    if (!assetsList || !assetsList.length) {
      $('#' + canvasId).hide();
      $('#assets-dist-pie-chart').
          find('.empty-view').
          html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());
    }

    let chartData = [];
    assetsList.forEach((value, index) => {
      chartData.push({
        label: value.name,
        value: (value.current_value / totalInvestmentValue) * 100,
      });
    });
    $('#' + canvasId).empty();
    window.morrisObj = new Morris.Donut({
      element: canvasId,
      data: chartData,
      colors: chartUtils.getPieChartColorsList(),
      labelColor: LayoutUtils.getCurrentThemeName() === MYFIN.APP_THEMES.LIGHT
          ? '#2f2d2d'
          : '#ffffff',
      resize: true,
      formatter: (y, data) => {
        return parseFloat(y).toFixed(2) + '%';
      },
    });
  },
  buildDashboardAssetsDistributionPieChart: (canvasId, assetDistribution) => {
    if (!assetDistribution || !assetDistribution.length) {
      $('#' + canvasId).hide();
      $('#assets-dist-pie-chart').
          find('.empty-view').
          html(GraphEmptyViewComponent.buildDefaultGraphEmptyView());
    }

    let assetDistributionChartData = [];
    assetDistribution.forEach((value, index) => {
      assetDistributionChartData.push({
        label: StringUtils.getInvestingAssetObjectById(
            Object.keys(value)[0]).name,
        value: Object.values(value)[0],
      });
    });
    InvestmentDashboardChartsFunc.buildDashboardAssetsDistributionPieChartv2(
        canvasId, assetDistributionChartData);
  },
  initTabAssets: (assetsList) => {
    $('input#show_inactives_cb').change(() => {
      showInactiveAssets = $('input#show_inactives_cb').
        val($(this).is(':checked'))[0].checked
      Investments.setupAssetsTable(assetsList)
    })
    Investments.setupAssetsTable(assetsList)
  },
  setupAssetsTable: (assetsList) => {
    InvestmentAssetsTableFunc.renderAssetsTable(assetsList, '#table-wrapper',
      Investments.editAssetClicked, Investments.removeAssetClicked,
      Investments.updateAssetValueClicked, showInactiveAssets);

    TableUtils.setupStaticTable('#assets-table');
    LoadingManager.hideLoading();
  },
  initTabTransactions: (trxList) => {
    InvestmentTransactionsTableFunc.renderTransactionsTable(trxList,
        '#table-wrapper-transactions');

    const fetchLimit = MYFIN.TRX_FETCH_LIMIT;
    if(transactionsTableInstance) TableUtils.resetDynamicTableState(transactionsTableInstance, false)
    transactionsTableInstance = TableUtils.setupDynamicTable('#transactions-table',
      fetchLimit,
      InvestmentTransactionsTableFunc.getColumnsRenderingArray(),
      (page, searchQuery, callback) => {
        LoadingManager.showLoading();
        InvestServices.getTransactionsByPage(page, fetchLimit,
          searchQuery,
          (resp) => {
            // SUCCESS
            LoadingManager.hideLoading();
            callback({
              data: resp.results,
              recordsTotal: resp.total_count,
              recordsFiltered: resp.filtered_count,
            });
          }, (err) => {LoadingManager.hideLoading();});
      }, () => {
        // Click listener for edit trx click
        InvestmentTransactionsTableFunc.bindClickListenersForTrxEditAction(Investments.editTransactionClicked);
        // Click listener for delete trx click
        InvestmentTransactionsTableFunc.bindClickListenersForTrxRemoveAction(Investments.removeTransactionClicked);
      },null, {}, true
    );

    LoadingManager.hideLoading();
  },
  editTransactionClicked: (
      trxId, date_timestamp, trxType, totalPrice, name, assetType, ticker,
      broker,
      units, fees, observations, assetId) => {
    LoadingManager.showLoading();
    InvestServices.getAllAssetsSummary((assetsList) => {
      LoadingManager.hideLoading();
      InvestTransactionsModalFunc.showEditTransactionModal('#modal-global',
          assetsList, trxId, date_timestamp, trxType, totalPrice, name,
          assetType,
          ticker, broker, units, fees, observations, assetId,
          Investments.editTransaction);
    }, (err) => {
      LoadingManager.hideLoading();
      DialogUtils.showErrorMessage();
    });

  },
  removeTransactionClicked: (trxId, assetId) => {
    InvestTransactionsModalFunc.showRemoveTrxConfirmationModal('#modal-global',
        trxId, assetId, Investments.removeTransaction);
  },
  updateAssetValueClicked: (assetId, name, currentValue) => {
    InvestAssetsModalFunc.showUpdateCurrentValueModal('#modal-global', assetId,
        name, currentValue, Investments.updateAssetValue);
  },
  updateAssetValue: (assetId, newValue) => {
    LoadingManager.showLoading();
    InvestServices.updateAssetValue(assetId, newValue,
        (res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          $('#modal-global').modal('close');
          Investments.changeTabs('tab-inv-transactions');
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage();
        });
  },
  removeTransaction: (trxId, assetId) => {
    LoadingManager.showLoading();
    InvestServices.deleteTransaction(trxId,
        (res) => {
          // SUCCESS
          /*LoadingManager.hideLoading();
          $('#modal-global')
            .modal('close');
          Investments.changeTabs('tab-inv-transactions');*/
          InvestServices.getAssetDetails(assetId,
              (assetDetails) => {
                // SUCCESS
                LoadingManager.hideLoading();
                Investments.updateAssetValueClicked(assetId, assetDetails.name,
                    assetDetails.current_value);
              }, (err2) => {
                // FAILURE
                LoadingManager.hideLoading();
                DialogUtils.showErrorMessage();
              });
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage();
        },
    );
  },
  editTransaction: (
      trxId, date_timestamp, note, totalPrice, units, fees, assetId, type) => {
    LoadingManager.showLoading();
    InvestServices.editTransaction(trxId, date_timestamp, note, totalPrice,
        units, fees, assetId, type,
        (res) => {
          // SUCCESS
          /*LoadingManager.hideLoading();
          $('#modal-global')
            .modal('close');
          Investments.changeTabs('tab-inv-transactions');*/
          InvestServices.getAssetDetails(assetId,
              (assetDetails) => {
                // SUCCESS
                LoadingManager.hideLoading();
                Investments.updateAssetValueClicked(assetId, assetDetails.name,
                    assetDetails.current_value);
              }, (err2) => {
                // FAILURE
                LoadingManager.hideLoading();
                DialogUtils.showErrorMessage();
              });
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage();
        },
    );
  },
};

//# sourceURL=js/investments.js