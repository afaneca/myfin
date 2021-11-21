'use strict';

var InvestAssetsModalFunc = {
  buildAddNewAccountModal: (modalDivID = '#modal-global', addAccountBtnClickCallback) => {
    $(modalDivID)
      .modal('open');
    let html = `
      <h4 class="col s8">Adicionar Novo Ativo</h4>
      <div class="row">
          <form class="col s12">
              <div class="input-field col s8">
              <i class="material-icons prefix">account_balance_wallet</i>
                  <input id="asset_name" type="text" class="validate" required>
                  <label for="asset_name">Nome do Ativo</label>
              </div>
              <div class="input-field col s4">
              <i class="material-icons prefix">confirmation_number</i>
                  <input id="asset_ticker" type="text" class="validate">
                  <label for="asset_ticker">Ticker</label>
              </div>
              <div class="input-field col s8">
                  <i class="material-icons prefix">note</i>
                  <select id="asset_type_select" required>
                      <option value="" disabled selected>Escolha uma opção</option>
                      <option value="${MYFIN.INVEST_ASSETS_TYPES.PPR.id}">${MYFIN.INVEST_ASSETS_TYPES.PPR.name}</option>
                      <option value="${MYFIN.INVEST_ASSETS_TYPES.ETF.id}">${MYFIN.INVEST_ASSETS_TYPES.ETF.name}</option>
                      <option value="${MYFIN.INVEST_ASSETS_TYPES.CRYPTO.id}">${MYFIN.INVEST_ASSETS_TYPES.CRYPTO.name}</option>
                      <option value="${MYFIN.INVEST_ASSETS_TYPES.FIXED_INCOME.id}">${MYFIN.INVEST_ASSETS_TYPES.FIXED_INCOME.name}</option>
                      <option value="${MYFIN.INVEST_ASSETS_TYPES.INDEX_FUNDS.id}">${MYFIN.INVEST_ASSETS_TYPES.INDEX_FUNDS.name}</option>
                      <option value="${MYFIN.INVEST_ASSETS_TYPES.INVESTMENT_FUNDS.id}">${MYFIN.INVEST_ASSETS_TYPES.INVESTMENT_FUNDS.name}</option>
                      <option value="${MYFIN.INVEST_ASSETS_TYPES.P2P_LOANS.id}">${MYFIN.INVEST_ASSETS_TYPES.P2P_LOANS.name}</option>
                      <option value="${MYFIN.INVEST_ASSETS_TYPES.STOCKS.id}">${MYFIN.INVEST_ASSETS_TYPES.STOCKS.name}</option>
                  </select>
                  <label>Tipo de Ativo</label>
              </div>
              <div class="input-field col s4">
              <i class="material-icons prefix">business</i>
                  <input id="asset_broker" type="text" class="validate">
                  <label for="asset_broker">Broker</label>
              </div>
          </form>
      </div>
    `;

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a id="add_asset_btn"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;
    $(`${modalDivID} .modal-content`)
      .html(html);
    $(`${modalDivID} .modal-footer`)
      .html(actionLinks);

    $('#asset_type_select')
      .formSelect();

    $('#add_asset_btn')
      .click(() => {
        if (addAccountBtnClickCallback) {
          const name = $('#asset_name')
            .val();
          const ticker = $('#asset_ticker')
            .val();
          const type = $('#asset_type_select')
            .val();
          const broker = $('#asset_broker')
            .val();

          if (ValidationUtils.checkIfFieldsAreFilled([name, type])) {
            addAccountBtnClickCallback(name, ticker, type, broker);
          } else {
            DialogUtils.showErrorMessage('Por favor preencha todos os campos obrigatórios e tente novamente.');
          }
        }
      });
  },
  showRemoveAssetConfirmationModal(modalDivId, assetId, removeAssetCallback) {
    $('#modal-global')
      .modal('open');
    let txt = `
      <h4>Remover Ativo <b>#${assetId}</b></h4>
      <div class="row">
          <p>Tem a certeza de que pretende remover este ativo?</p>
          <b>Esta ação é irreversível!</b>
  
      </div>
      `;

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a onClick="Investments.${removeAssetCallback.name}(${assetId})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Remover</a>`;
    $('#modal-global .modal-content')
      .html(txt);
    $('#modal-global .modal-footer')
      .html(actionLinks);
  },
};

//# sourceURL=js/funcs/investAssetsModalFunc.js