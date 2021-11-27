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
    renderAssetsSelectOption: (asset, defaultAssetId = undefined) => `
    <option value="${asset.asset_id}" ${(defaultAssetId && asset.asset_id === defaultAssetId) ? 'selected' : ''}>${asset.name}</option>
  `,
    showRemoveTrxConfirmationModal: (modalDivId, trxId, removeTrxCallback) => {
      $('#modal-global')
        .modal('open');
      let txt = `
      <h4>Remover Transação <b>#${trxId}</b></h4>
      <div class="row">
          <p>Tem a certeza de que pretende remover este ativo?</p>
          <b>Esta ação é irreversível!</b>
  
      </div>
      `;

      let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a onClick="Investments.${removeTrxCallback.name}(${trxId})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Remover</a>`;
      $('#modal-global .modal-content')
        .html(txt);
      $('#modal-global .modal-footer')
        .html(actionLinks);
    },
    showEditTransactionModal: (modalDivID, assetsList, trxId, date_timestamp, trxType, totalPrice, name, assetType, ticker, broker, units, observations, assetId, editAssetCallback) => {
      $(modalDivID)
        .modal('open');
      let html = `
                <div class="row row-no-margin-bottom">
                    <div class="input-field col s8">
                        <h4>Editar transação</h4>
                    </div>
                    <div class="input-field col s4">
                        <span class="select2-top-label">Tipo de Transação</span>
                        <select class="select-trxs-types" name="types">
                            <option ${trxType === MYFIN.INVEST_TRX_TYPES.BUY.id ? ' selected ' : ''} value="${MYFIN.INVEST_TRX_TYPES.BUY.id}">${MYFIN.INVEST_TRX_TYPES.BUY.name}</option>
                            <option ${trxType === MYFIN.INVEST_TRX_TYPES.SELL.id ? ' selected ' : ''} value="${MYFIN.INVEST_TRX_TYPES.SELL.id}">${MYFIN.INVEST_TRX_TYPES.SELL.name}</option>
                        </select>
                    </div>
                </div>
                
                    <form class="col s12">
                        <div class="row row-no-margin-bottom">
                            <div class="input-field col s2">
                                <i class="material-icons prefix">euro_symbol</i>
                                <input id="trx_amount" type="number" step=".01" class="validate" value="${totalPrice}">
                                <label class="active" for="trx_amount">Valor (€)</label>
                            </div>
                            <div class="input-field col s2">
                                <i class="material-icons prefix">fiber_smart_record</i>
                                <input id="trx_units" type="number" step=".0001" class="validate" value="${units}">
                                <label class="active" for="trx_units">Unidades</label>
                            </div>  
                             <div class="input-field col s3">
                                <i class="material-icons prefix">date_range</i>
                                <input id="trx_date" type="text" class="datepicker input-field">
                                <label class="active" for="trx_date">Data da transação</label>
                            </div>               
                            <div class="input-field col s3 offset-s2">
                            <span class="select2-top-label">Ativo associado</span>
                                <select class="select-trxs-asset" name="assets" style="width: 100%;">
                                    ${assetsList.map(asset => InvestTransactionsModalFunc.renderAssetsSelectOption(asset, assetId))
        .join('')}
                                </select>   
                            </div>
                        </div>
                        <div class="row row-no-margin-bottom col s12">                     
                            <div class="col s12">
                                <div class="input-field col s12">
                                    <i class="material-icons prefix">description</i>
                                    <textarea id="trx-description" class="materialize-textarea"></textarea>
                                    <label class="active" for="trx-description">Observações</label>
                                </div>
                            </div> 
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

      $('.datepicker')
        .datepicker({
          defaultDate: new Date(DateUtils.convertUnixTimestampToDateFormat(date_timestamp)),
          setDefaultDate: true,
          format: 'dd/mm/yyyy',
          i18n: PickerUtils.getDatePickerDefault18nStrings(),
        });

      $('select.select-trxs-types')
        .select2({ dropdownParent: '#modal-global' });
      $('select.select-trxs-asset')
        .select2({ dropdownParent: '#modal-global' });

      $('textarea#trx-description')
        .val(observations);

      $('#edit_asset_btn')
        .click(() => {
          if (editAssetCallback) {
            const date_timestamp = DateUtils.convertDateToUnixTimestamp($('.datepicker')
              .val());
            const note = $('#trx-description')
              .val();
            const totalPrice = $('#trx_amount')
              .val();
            const units = $('#trx_units')
              .val();
            const assetId = $('select.select-trxs-asset')
              .val();
            const type =$('select.select-trxs-types')
              .val();

            /*
            if (ValidationUtils.checkIfFieldsAreFilled([date, units, amount, type, assetId])) {*/

            if (ValidationUtils.checkIfFieldsAreFilled([date_timestamp, units, totalPrice, type, assetId])) {
              editAssetCallback(trxId, date_timestamp, note, totalPrice, units, assetId, type);
            } else {
              DialogUtils.showErrorMessage('Por favor preencha todos os campos obrigatórios e tente novamente.');
            }
          }
        });
    }
  }
;

//# sourceURL=js/funcs/investTransactionsModalFunc.js