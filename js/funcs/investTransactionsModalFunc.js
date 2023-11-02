import { DialogUtils } from "../utils/dialogUtils.js";
import { ValidationUtils } from "../utils/validationUtils.js";
import { PickerUtils } from "../utils/pickerUtils.js";
import { DateUtils } from "../utils/dateUtils.js";
import { Localization } from "../utils/localization.js";
import { ToggleComponent } from "../components/toggleComponent.js";

export const InvestTransactionsModalFunc = {
  buildAddNewTransactionModal: (modalDivID = '#modal-global', assetsList, addTransactionBtnClickCallback) => {
    $('#modal-global').modal('open')
    let txt = `
                <div class="row row-no-margin-bottom">
                    <div class="input-field col s8">
                        <h4>${Localization.getString(
      'investments.addNewTransaction')}</h4>
                    </div>
                    <div class="input-field" style="float:right;display: grid;">
                        <span class="select2-top-label col s12" style="float:right;text-align: end;width: fit-content;">${Localization.getString(
      'investments.typeOfTransaction')}</span>
                        <div id="type-toggle-wrapper" class="col s12" style="margin-left: 10px;float: right;width: fit-content;"></div>
                    </div>
                </div>
                
                    <form class="col s12">
                        <div class="row row-no-margin-bottom">
                            <div class="input-field col s2">
                                <i class="material-icons prefix">euro_symbol</i>
                                <input id="trx_amount" type="number" step=".01" class="validate">
                                <label for="trx_amount">${Localization.getString(
      'common.value')} (€)</label>
                            </div>
                            <div class="input-field col s2">
                                <i class="material-icons prefix">fiber_smart_record</i>
                                <input id="trx_units" type="number" step=".0001" class="validate">
                                <label for="trx_units">${Localization.getString(
      'investments.units')}</label>
                            </div>  
                             <div class="input-field col s3">
                                <i class="material-icons prefix">date_range</i>
                                <input id="trx_date" type="text" class="datepicker input-field">
                                <label for="trx_date">${Localization.getString(
      'transactions.dateOfTransaction')}</label>
                            </div>               
                            <div class="input-field col s3 offset-s2">
                            <span class="select2-top-label">${Localization.getString(
      'investments.associatedAsset')}</span>
                                <select class="select-trxs-asset" name="assets" style="width: 100%;">
                                    ${assetsList.map(
      asset => InvestTransactionsModalFunc.renderAssetsSelectOption(asset)).
      join('')}
                                </select>   
                            </div>
                        </div>
                        <div class="row row-no-margin-bottom">                                            
                            <div class="input-field col s7">
                                <i class="material-icons prefix">description</i>
                                <textarea id="trx-description" class="materialize-textarea"></textarea>
                                <label for="trx-description">${Localization.getString(
      'investments.observations')}</label>
                            </div>
                            <div class="input-field col s3 offset-s2">
                              <i class="material-icons prefix">control_point_duplicate</i>
                              <input id="trx_fees" type="number" step=".01" class="validate" value="0">
                              <label for="trx_fees" class="active">${Localization.getString(
      'investments.feesAndTaxes')} (€)</label>
                            </div>
                        </div>   
                        <!-- SPLIT WRAPPER -->
                        <div id="split-trx-wrapper" style="display: none;">
                            <hr>
                            <div class="input-field" style="float:right;display: grid;">
                                    <div id="type-toggle-wrapper2" class="col s12" style="margin-left: 10px;float: right;width: fit-content;"></div>
                                </div>
                            <div class="row row-no-margin-bottom">
                              <div class="input-field col s3">
                                  <i class="material-icons prefix">euro_symbol</i>
                                  <input id="trx_amount2" type="number" step=".01" class="validate">
                                  <label for="trx_amount2" class="active">${Localization.getString(
      'common.value')} (€)</label>
                              </div>
                              <div class="input-field col s4">
                                  <i class="material-icons prefix">fiber_smart_record</i>
                                  <input id="trx_units2" type="number" step=".0001" class="validate">
                                  <label for="trx_units2" class="active">${Localization.getString(
      'investments.units')}</label>
                              </div>  
                            </div>
                            <div class="row row-no-margin-bottom">                                            
                              <div class="input-field col s7">
                                  <i class="material-icons prefix">description</i>
                                  <textarea id="trx-description2" class="materialize-textarea"></textarea>
                                  <label for="trx-description2" class="active">${Localization.getString(
      'investments.observations')}</label>
                              </div>
                            </div>   
                        </div>                       
                    </form>
                </div>
                `

    let actionLinks = `<a id="split-trx-btn" class="waves-effect waves-light btn right-align transparent-bordered-btn-blue" onclick="" style="margin: 10px; float:left;display:none;"><i class="material-icons left"><span id="split-trx-btn-icon-id">call_split</span></i><span id="split-trx-btn-text" data-i18n="transactions.splitTransaction">${Localization.getString(
      'transactions.deductFeesFromTransaction')}</span></a><a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString(
      'common.cancel')}</a>
                    <a id="add_trx_btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString(
      'common.add')}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)

    const options = [
      {
        id: MYFIN.INVEST_TRX_TYPES.BUY.id,
        name: MYFIN.INVEST_TRX_TYPES.BUY.name,
      },
      {
        id: MYFIN.INVEST_TRX_TYPES.SELL.id,
        name: MYFIN.INVEST_TRX_TYPES.SELL.name,
      },
    ]
    ToggleComponent.buildToggle('type', 'type-toggle-wrapper', options, MYFIN.INVEST_TRX_TYPES.BUY.id, (optionId) => {})
    ToggleComponent.buildToggle('type2', 'type-toggle-wrapper2', options, MYFIN.INVEST_TRX_TYPES.SELL.id, (optionId) => {})
    $('select.select-trxs-asset').select2({ dropdownParent: '#modal-global' })

    $('.datepicker').datepicker({
      defaultDate: new Date(),
      setDefaultDate: true,
      format: 'dd/mm/yyyy',
      i18n: PickerUtils.getDatePickerDefault18nStrings(),
    })

    const splitWrapperLocator = $('div#split-trx-wrapper');
    const splitBtnLocator = $('a#split-trx-btn');
    const splitBtnTextLocator = $('span#split-trx-btn-text');
    const splitBtnIconLocator = $('span#split-trx-btn-icon-id');

    $('#add_trx_btn').click(() => {
      if (addTransactionBtnClickCallback) {
        const date = DateUtils.convertDateToUnixTimestamp($('.datepicker').val())
        const units = $('#trx_units').val()
        const fees = $('#trx_fees').val()
        const amount = $('#trx_amount').val()
        const observations = $('#trx-description').val()
        const type = ToggleComponent.getSelectedOptionId('type')
        const assetId = $('select.select-trxs-asset').val()

        const isSplit = splitWrapperLocator.is(':visible')
        let splitAmount = null;
        let splitUnits = null;
        let splitType = null;
        let splitObservations = null;
        if(isSplit){
          splitAmount = $('input#trx_amount2').val();
          splitUnits = $('input#trx_units2').val();
          splitObservations = $('#trx-description2').val();
          splitType = ToggleComponent.getSelectedOptionId('type2');
        }


        if (ValidationUtils.checkIfFieldsAreFilled([date, units, amount, type, assetId, fees])) {
          addTransactionBtnClickCallback(date, units, fees, amount, type, observations, assetId, isSplit, splitAmount, splitUnits, splitObservations, splitType)
        }
        else {
          DialogUtils.showErrorMessage(Localization.getString('common.fillAllFieldsTryAgain'))
        }
      }
    })

    $('a#split-trx-btn').on('click', function(view) {
      if (splitWrapperLocator.is(':visible')) {
        splitWrapperLocator.hide();
        splitBtnTextLocator.text(Localization.getString('transactions.deductFeesFromTransaction'));
        splitBtnIconLocator.text('call_split');
      }
      else {
        splitWrapperLocator.show();
        splitBtnTextLocator.text(Localization.getString('transactions.mergeTransactions'));
        splitBtnIconLocator.text('call_merge');

        // PRE-FILL INPUTS
        const feesAndTaxes = $("input#trx_fees").val()
        $("input#trx_amount2").val(feesAndTaxes).trigger('change');
        $("input#trx_units2").val(feesAndTaxes).trigger('change');
        const selectedAssetId = $('select.select-trxs-asset').val()
        const selectedAsset = InvestTransactionsModalFunc.getSelectedAsset(selectedAssetId, assetsList)
        const units = $("input#trx_units").val();
        const ticker = selectedAsset.ticker;
        $("textarea#trx-description2").val(Localization.getString('transactions.generated_split_invest_trx_observations', {ticker: ticker, units: units})).trigger('change');
      }
    });

    $('#trx_fees').on('input', () => {
      const value = $('#trx_fees').val();
      if(value && parseFloat(value) !== 0){
        splitBtnLocator.show()
      } else {
        splitBtnLocator.hide();
      }
    })
  },
  getSelectedAsset: (selectedAssetId, assetsList) => {
    return assetsList?.find((asset) => asset.asset_id == selectedAssetId)
  },
  renderAssetsSelectOption: (asset, defaultAssetId = undefined) => `
    <option value="${asset.asset_id}" ${(defaultAssetId && asset.asset_id == defaultAssetId) ? "selected" : ""}>${asset.name}</option>
  `,
  showRemoveTrxConfirmationModal: (modalDivId, trxId, assetId, removeTrxCallback) => {
    $('#modal-global').modal('open')
    let txt = `
      <h4>${Localization.getString('investments.deleteTrxModalTitle', { id: trxId })}</h4>
      <div class="row">
          <p>${Localization.getString("investments.deleteTrxModalSubtitle")}</p>
          <b>${Localization.getString("investments.deleteTrxModalAlert")}</b>
  
      </div>
      `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString(
      'common.cancel')}</a>
            <a id="action-remove-asset-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString(
      'common.delete')}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#action-remove-asset-btn').click(() => removeTrxCallback(trxId, assetId))
  },
  showEditTransactionModal: (
    modalDivID, assetsList, trxId, date_timestamp, trxType, totalPrice, name, assetType, ticker, broker, units, fees, observations, assetId,
    editAssetCallback) => {

    $(modalDivID).modal('open')

    let html = `
                <div class="row row-no-margin-bottom">
                    <div class="input-field col s8">
                        <h4>${Localization.getString('investments.editTransaction')}</h4>
                    </div>
                    <div class="input-field" style="float:right;display: grid;">
                        <span class="select2-top-label col s12" style="float:right;text-align: end;width: fit-content;">${Localization.getString(
      'investments.typeOfTransaction')}</span>
                        <div id="type-toggle-wrapper" class="col s12" style="margin-left: 10px;float: right;width: fit-content;"></div>
                    </div>
                </div>
                
                    <form class="col s12">
                        <div class="row row-no-margin-bottom">
                            <div class="input-field col s2">
                                <i class="material-icons prefix">euro_symbol</i>
                                <input id="trx_amount" type="number" step=".01" class="validate" value="${totalPrice}">
                                <label class="active" for="trx_amount">${Localization.getString('common.value')} (€)</label>
                            </div>
                            <div class="input-field col s2">
                                <i class="material-icons prefix">fiber_smart_record</i>
                                <input id="trx_units" type="number" step=".0001" class="validate" value="${units}">
                                <label class="active" for="trx_units">${Localization.getString('investments.units')}</label>
                            </div>  
                             <div class="input-field col s3">
                                <i class="material-icons prefix">date_range</i>
                                <input id="trx_date" type="text" class="datepicker input-field">
                                <label class="active" for="trx_date">${Localization.getString('transactions.dateOfTransaction')}</label>
                            </div>               
                            <div class="input-field col s3 offset-s2">
                            <span class="select2-top-label">${Localization.getString('investments.associatedAsset')}</span>
                                <select class="select-trxs-asset" name="assets" style="width: 100%;">
                                    ${assetsList.map(asset => InvestTransactionsModalFunc.renderAssetsSelectOption(asset, assetId)).join('')}
                                </select>   
                            </div>
                        </div>
                        <div class="row row-no-margin-bottom col s12">                     
                            <div class="input-field col s7">
                                <i class="material-icons prefix">description</i>
                                <textarea id="trx-description" class="materialize-textarea"></textarea>
                                <label class="active" for="trx-description">${Localization.getString('investments.observations')}</label>
                            </div>
                            <div class="input-field col s3 offset-s2">
                              <i class="material-icons prefix">control_point_duplicate</i>
                              <input id="trx_fees" type="number" step=".01" class="validate" value="${parseFloat(fees) ? fees : 0}">
                              <label for="trx_fees" class="active">${Localization.getString('investments.feesAndTaxes')} (€)</label>
                            </div>
                        </div>                             
                    </form>
                </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString('common.cancel')}</a>
    <a id="edit_asset_btn"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString('common.edit')}</a>`
    $(`${modalDivID} .modal-content`).html(html)
    $(`${modalDivID} .modal-footer`).html(actionLinks)

    $('#asset_type_select').formSelect()

    $('.datepicker').datepicker({
      defaultDate: new Date(DateUtils.convertUnixTimestampToDateFormat(date_timestamp)),
      setDefaultDate: true,
      format: 'dd/mm/yyyy',
      i18n: PickerUtils.getDatePickerDefault18nStrings(),
    })
    const options = [
      {
        id: MYFIN.INVEST_TRX_TYPES.BUY.id,
        name: MYFIN.INVEST_TRX_TYPES.BUY.name,
      },
      {
        id: MYFIN.INVEST_TRX_TYPES.SELL.id,
        name: MYFIN.INVEST_TRX_TYPES.SELL.name,
      },
    ]
    ToggleComponent.buildToggle('type-edit', 'type-toggle-wrapper', options, trxType, (optionId) => {})
    $('select.select-trxs-asset').select2({ dropdownParent: '#modal-global' })

    $('textarea#trx-description').val(observations)

    $('#edit_asset_btn').click(() => {
      if (editAssetCallback) {
        const date_timestamp = DateUtils.convertDateToUnixTimestamp($('.datepicker').val())
        const note = $('#trx-description').val()
        const totalPrice = $('#trx_amount').val()
        const units = $('#trx_units').val()
        const fees = $('#trx_fees').val()
        const assetId = $('select.select-trxs-asset').val()
        const type = ToggleComponent.getSelectedOptionId('type-edit')

        /*
        if (ValidationUtils.checkIfFieldsAreFilled([date, units, amount, type, assetId])) {*/

        if (ValidationUtils.checkIfFieldsAreFilled([date_timestamp, units, fees, totalPrice, type, assetId])) {
          editAssetCallback(trxId, date_timestamp, note, totalPrice, units, fees, assetId, type)
        }
        else {
          DialogUtils.showErrorMessage(Localization.getString('common.fillAllFieldsTryAgain'))
        }
      }
    })
  },
}

//# sourceURL=js/funcs/investTransactionsModalFunc.js