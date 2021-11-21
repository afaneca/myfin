'use strict';

var Investments = {
  addNewAsset: () => {
    InvestAssetsModalFunc.buildAddNewAccountModal('#modal-global', Investments.addAsset);
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
    debugger
  },
  removeAssetClicked: (assetId) => {
    InvestAssetsModalFunc.showRemoveAssetConfirmationModal('#modal-global', assetId, Investments.removeAsset);
  },
  removeAsset: assetId => {
    debugger
  },
  changeTabs: activeID => {
    switch (activeID) {
      case 'tab-inv-dashboard':
        /*Stats.initTabEvolutionOfPatrimony();*/
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
        /*Stats.clearCanvasAndTableWrapper('#chart_pie_cat_expenses_evolution_table', 'chart_pie_cat_expenses_evolution');
        $('#chart_pie_cat_expenses_evolution')
          .remove();
        $('#canvas_chart_expenses_evo_wrapper')
          .append(' <canvas id="chart_pie_cat_expenses_evolution" width="800" height="300"></canvas>');
        Stats.initExpensesPerCatEvolution();*/
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
};

//# sourceURL=js/investments.js