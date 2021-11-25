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
    InvestServices.addTransaction(date, observations = "", amount, parseFloat(units), assetId, type,
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
  editTransactionClicked: () => {

  },
  removeTransactionClicked: () => {

  },
};

//# sourceURL=js/investments.js