'use strict';

var Investments = {
    addNewAssetClicked: () => {
      InvestAssetsModalFunc.buildAddNewAccountModal('#modal-global', Investments.addAsset);
    },
    addNewTransactionClicked: () => {
      LoadingManager.showLoading();
      InvestServices.getAllAssetsSummary((res) => {
        // SUCCESS
        LoadingManager.hideLoading();
        InvestTransactionsModalFunc.buildAddNewTransactionModal('#modal-global', res, Investments.addTransaction);
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading();
        DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
      });

    },
    addTransaction: (date, units, amount, type, observations, assetId) => {
      LoadingManager.showLoading();
      InvestServices.addTransaction(date, observations = '', amount, parseFloat(units), assetId, type,
        (res) => {
          // SUCCESS
          DialogUtils.showSuccessMessage('Transação adicionada com sucesso!');
          $('#modal-global')
            .modal('close');
          Investments.changeTabs('tab-inv-transactions');
          LoadingManager.hideLoading();
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
        });
    },
    addAsset: (name, ticker, type, broker) => {
      LoadingManager.showLoading();
      InvestServices.addAsset(name, ticker, type, broker,
        (res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          DialogUtils.showSuccessMessage('Ativo adicionado com sucesso!');
          $('#modal-global')
            .modal('close');
          Investments.changeTabs('tab-inv-assets');
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
        });
    },
    editAssetClicked: (assetId, ticker, name, type, broker) => {
      InvestAssetsModalFunc.showEditAssetModal('#modal-global', assetId, ticker, name, type, broker, Investments.editAsset);
    },
    removeAssetClicked: (assetId) => {
      InvestAssetsModalFunc.showRemoveAssetConfirmationModal('#modal-global', assetId, Investments.removeAsset);
    },
    editAsset: (assetId, ticker, name, type, broker) => {
      LoadingManager.showLoading();
      InvestServices.editAsset(assetId, ticker, name, type, broker,
        (res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          $('#modal-global')
            .modal('close');
          Investments.changeTabs('tab-inv-assets');
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
        }
      );
    },
    removeAsset: assetId => {
      LoadingManager.showLoading();
      InvestServices.deleteAsset(assetId,
        (res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          $('#modal-global')
            .modal('close');
          Investments.changeTabs('tab-inv-assets');
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
        }
      );
    },
    /*
    * TABS LISTENER
    * */
    changeTabs: activeID => {
      switch (activeID) {
        case 'tab-inv-dashboard':
          /*Stats.initTabEvolutionOfPatrimony();*/
          const chartLabels = ['11/2021', '12/2021', '01/2022', '02/2022', '03/2022', '04/2022', '05/2022'];
          const chartData = ['0', '100', '75', '125', '230', '99', '300'];
          const extraChartData = [];
          InvestmentDashboardChartsFunc.buildDashboardEvolutionLineChart('dashboard_evolution_line_chart', chartLabels, chartData, extraChartData);
          /*InvestmentDashboardChartsFunc.buildDashboardAssetsDistributionPieChart('dashboard_assets_distribution_line_chart', chartLabels, chartData, "Distribuição por Grupos de Ativos");*/
          LoadingManager.showLoading()
          InvestServices.getAllAssetStats((res) => {
            LoadingManager.hideLoading()
            // SUCCESS
            const assetDistribution = res['current_value_distribution'];
            let assetDistributionChartData = [];
            assetDistribution.forEach((value, index) => {
              debugger
              assetDistributionChartData.push({
                label: StringUtils.getInvestingAssetObjectById(Object.keys(value)[0]).name,
                value: Object.values(value)[0]
              });
            });

            InvestmentDashboardChartsFunc.buildDashboardAssetsDistributionPieChartv2('dashboard_assets_distribution_pie_chart', assetDistributionChartData);
            $("#invest-dashboard-top-panel-current-value").text(StringUtils.formatMoney(res['total_current_value']));
            $("#invest-dashboard-top-panel-invested-value").text(StringUtils.formatMoney(res['total_invested_value']));
            $("#invest-dashboard-top-panel-roi-current-year-value").text(StringUtils.formatMoney(res['current_year_roi_value']));
            $("#invest-dashboard-top-panel-roi-current-year-percentage").text(StringUtils.formatStringToPercentage(res['current_year_roi_percentage']));
            $("#invest-dashboard-top-panel-roi-global-value").text(StringUtils.formatMoney(res['global_roi_value']));
            $("#invest-dashboard-top-panel-roi-global-percentage").text(StringUtils.formatStringToPercentage(res['global_roi_percentage']));
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
            DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
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
            DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
          });
          window.history.replaceState(null, null, '#!investments?tab=transactions');
          break;
        case 'tab-inv-reports':
          /* Stats.clearCanvasAndTableWrapper('#chart_pie_cat_income_evolution_table', 'chart_pie_cat_income_evolution');
           $('#chart_pie_cat_income_evolution')
             .remove();
           $('#canvas_chart_income_evo_wrapper')
             .append(' <canvas id="chart_pie_cat_income_evolution" width="800" height="300"></canvas>');

           Stats.initIncomePerCatEvolution();*/
          window.history.replaceState(null, null, '#!investments?tab=reports');
          break;
        default:
          break;
      }
    },
    initTabAssets: (assetsList) => {
      InvestmentAssetsTableFunc.renderAssetsTable(assetsList, '#table-wrapper', Investments.editAssetClicked, Investments.removeAssetClicked);

      tableUtils.setupStaticTable('#assets-table');
      LoadingManager.hideLoading();
    },
    initTabTransactions: (trxList) => {
      InvestmentTransactionsTableFunc.renderTransactionsTable(trxList, '#table-wrapper-transactions', Investments.editTransactionClicked, Investments.removeTransactionClicked);

      tableUtils.setupStaticTable('#transactions-table');
      LoadingManager.hideLoading();
    },
    editTransactionClicked: (trxId, date_timestamp, trxType, totalPrice, name, assetType, ticker, broker, units, observations, assetId) => {
      LoadingManager.showLoading();
      InvestServices.getAllAssetsSummary((assetsList) => {
        LoadingManager.hideLoading();
        InvestTransactionsModalFunc.showEditTransactionModal('#modal-global', assetsList, trxId, date_timestamp, trxType, totalPrice, name, assetType, ticker, broker, units, observations, assetId, Investments.editTransaction);
      }, (err) => {
        LoadingManager.hideLoading();
        DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
      });

    },
    removeTransactionClicked: (assetId) => {
      InvestTransactionsModalFunc.showRemoveTrxConfirmationModal('#modal-global', assetId, Investments.removeTransaction);
    },
    removeTransaction: (trxId) => {
      LoadingManager.showLoading();
      InvestServices.deleteTransaction(trxId,
        (res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          $('#modal-global')
            .modal('close');
          Investments.changeTabs('tab-inv-transactions');
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
        }
      );
    },
    editTransaction: (trxId, date_timestamp, note, totalPrice, units, assetId, type) => {
      LoadingManager.showLoading();
      InvestServices.editTransaction(trxId, date_timestamp, note, totalPrice, units, assetId, type,
        (res) => {
          // SUCCESS
          LoadingManager.hideLoading();
          $('#modal-global')
            .modal('close');
          Investments.changeTabs('tab-inv-transactions');
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!');
        }
      );
    }
  }
;

//# sourceURL=js/investments.js