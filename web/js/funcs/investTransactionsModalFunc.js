'use strict';

var InvestTransactionsModalFunc = {
    buildAddNewTransactionModal: (modalDivID = '#modal-global', assetsList, addTransactionBtnClickCallback) => {
      $('#modal-global')
        .modal('open');
      let txt = `
                <div class="row row-no-margin-bottom">
                    <div class="input-field col s8">
                        <h4>Adicionar nova transação</h4>
                    </div>
                    <div class="input-field col s4">
                        <span class="select2-top-label">Tipo de Transação</span>
                        <select class="select-trxs-types" name="types">
                            <option value="${MYFIN.INVEST_TRX_TYPES.BUY.id}">${MYFIN.INVEST_TRX_TYPES.BUY.name}</option>
                            <option value="${MYFIN.INVEST_TRX_TYPES.SELL.id}">${MYFIN.INVEST_TRX_TYPES.SELL.name}</option>
                        </select>
                    </div>
                </div>
                
                    <form class="col s12">
                        <div class="row row-no-margin-bottom">
                            <div class="input-field col s2">
                                <i class="material-icons prefix">euro_symbol</i>
                                <input id="trx_amount" type="number" step=".01" class="validate">
                                <label for="trx_amount">Valor (€)</label>
                            </div>
                            <div class="input-field col s2">
                                <i class="material-icons prefix">fiber_smart_record</i>
                                <input id="trx_units" type="number" step=".0001" class="validate">
                                <label for="trx_units">Unidades</label>
                            </div>  
                             <div class="input-field col s3">
                                <i class="material-icons prefix">date_range</i>
                                <input id="trx_date" type="text" class="datepicker input-field">
                                <label for="trx_date">Data da transação</label>
                            </div>               
                            <div class="input-field col s3 offset-s2">
                            <span class="select2-top-label">Ativo associado</span>
                                <select class="select-trxs-asset" name="assets" style="width: 100%;">
                                    ${assetsList.map(asset => InvestTransactionsModalFunc.renderAssetsSelectOption(asset))
        .join('')}
                                </select>   
                            </div>
                        </div>
                        <div class="row row-no-margin-bottom col s12">                     
                            <div class="col s12">
                                <div class="input-field col s12">
                                    <i class="material-icons prefix">description</i>
                                    <textarea id="trx-description" class="materialize-textarea"></textarea>
                                    <label for="trx-description">Observações</label>
                                </div>
                            </div> 
                        </div>                             
                    </form>
                </div>
                `;

      let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
                    <a id="add_trx_btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;
      $('#modal-global .modal-content')
        .html(txt);
      $('#modal-global .modal-footer')
        .html(actionLinks);

      $('select.select-trxs-types')
        .select2({ dropdownParent: '#modal-global' });
      $('select.select-trxs-asset')
        .select2({ dropdownParent: '#modal-global' });

      $('.datepicker')
        .datepicker({
          defaultDate: new Date(),
          setDefaultDate: true,
          format: 'dd/mm/yyyy',
          i18n: PickerUtils.getDatePickerDefault18nStrings(),
        });

      $('#add_trx_btn')
        .click(() => {
          if (addTransactionBtnClickCallback) {
            const date = DateUtils.convertDateToUnixTimestamp($('.datepicker')
              .val());
            const units = $('#trx_units')
              .val();
            const amount = $('#trx_amount')
              .val();
            const observations = $('#trx-description')
              .val();

            const type = $('select.select-trxs-types')
              .val();
            const assetId = $('select.select-trxs-asset')
              .val();

            if (ValidationUtils.checkIfFieldsAreFilled([date, units, amount, type, assetId])) {
              addTransactionBtnClickCallback(date, units, amount, type, observations, assetId);
            } else {
              DialogUtils.showErrorMessage('Por favor preencha todos os campos obrigatórios e tente novamente.');
            }
          }
        });
    },
    renderAssetsSelectOption: (asset) => `
    <option value="${asset.asset_id}">${asset.name}</option>
  `,
    showRemoveAssetConfirmationModal: (modalDivId, assetId, removeAssetCallback) => {
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
    showEditAssetModal: (modalDivID, assetId, ticker, name, type, broker, editAssetCallback) => {
      $(modalDivID)
        .modal('open');
      let html = `
      <h4 class="col s8">Editar Ativo</h4>
      <div class="row">
          <form class="col s12">
              <div class="input-field col s8">
              <i class="material-icons prefix">account_balance_wallet</i>
                  <input id="asset_name" type="text" class="validate" required value="${name}">
                  <label class="active" for="asset_name">Nome do Ativo</label>
              </div>
              <div class="input-field col s4">
              <i class="material-icons prefix">confirmation_number</i>
                  <input id="asset_ticker" type="text" class="validate" value="${ticker ? ticker : ''}">
                  <label class="active" for="asset_ticker">Ticker</label>
              </div>
              <div class="input-field col s8">
                  <i class="material-icons prefix">note</i>
                  <select id="asset_type_select" required>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.PPR.id) ? 'selected' : ''} value="${MYFIN.INVEST_ASSETS_TYPES.PPR.id}">${MYFIN.INVEST_ASSETS_TYPES.PPR.name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.ETF.id) ? 'selected' : ''} value="${MYFIN.INVEST_ASSETS_TYPES.ETF.id}">${MYFIN.INVEST_ASSETS_TYPES.ETF.name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.CRYPTO.id) ? 'selected' : ''} value="${MYFIN.INVEST_ASSETS_TYPES.CRYPTO.id}">${MYFIN.INVEST_ASSETS_TYPES.CRYPTO.name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.FIXED_INCOME.id) ? 'selected' : ''} value="${MYFIN.INVEST_ASSETS_TYPES.FIXED_INCOME.id}">${MYFIN.INVEST_ASSETS_TYPES.FIXED_INCOME.name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.INDEX_FUNDS.id) ? 'selected' : ''} value="${MYFIN.INVEST_ASSETS_TYPES.INDEX_FUNDS.id}">${MYFIN.INVEST_ASSETS_TYPES.INDEX_FUNDS.name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.INVESTMENT_FUNDS.id) ? 'selected' : ''} value="${MYFIN.INVEST_ASSETS_TYPES.INVESTMENT_FUNDS.id}">${MYFIN.INVEST_ASSETS_TYPES.INVESTMENT_FUNDS.name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.P2P_LOANS.id) ? 'selected' : ''} value="${MYFIN.INVEST_ASSETS_TYPES.P2P_LOANS.id}">${MYFIN.INVEST_ASSETS_TYPES.P2P_LOANS.name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.STOCKS.id) ? 'selected' : ''} value="${MYFIN.INVEST_ASSETS_TYPES.STOCKS.id}">${MYFIN.INVEST_ASSETS_TYPES.STOCKS.name}</option>
                  </select>
                  <label>Tipo de Ativo</label>
              </div>
              <div class="input-field col s4">
              <i class="material-icons prefix">business</i>
                  <input id="asset_broker" type="text" class="validate" value="${broker ? broker : ''}">
                  <label class="active" for="asset_broker">Broker</label>
              </div>
          </form>
      </div>
    `;

      let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a id="edit_asset_btn"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Editar</a>`;
      $(`${modalDivID} .modal-content`)
        .html(html);
      $(`${modalDivID} .modal-footer`)
        .html(actionLinks);

      $('#asset_type_select')
        .formSelect();

      $('#edit_asset_btn')
        .click(() => {
          if (editAssetCallback) {
            const name = $('#asset_name')
              .val();
            const ticker = $('#asset_ticker')
              .val();
            const type = $('#asset_type_select')
              .val();
            const broker = $('#asset_broker')
              .val();

            if (ValidationUtils.checkIfFieldsAreFilled([name, type])) {
              editAssetCallback(assetId, ticker, name, type, broker);
            } else {
              DialogUtils.showErrorMessage('Por favor preencha todos os campos obrigatórios e tente novamente.');
            }
          }
        });
    }
  }
;

//# sourceURL=js/funcs/investTransactionsModalFunc.js