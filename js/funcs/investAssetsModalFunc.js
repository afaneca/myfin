import { ValidationUtils } from "../utils/validationUtils.js";
import { DialogUtils } from "../utils/dialogUtils.js";
import { Localization } from "../utils/localization.js";
import { StringUtils } from "../utils/stringUtils.js";

export const InvestAssetsModalFunc = {
  buildAddNewAccountModal: (modalDivID = '#modal-global', addAccountBtnClickCallback) => {
    $(modalDivID).modal('open')
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
    `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
    <a id="add_asset_btn"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.add")}</a>`
    $(`${modalDivID} .modal-content`).html(html)
    $(`${modalDivID} .modal-footer`).html(actionLinks)

    $('#asset_type_select').formSelect()

    $('#add_asset_btn').click(() => {
      if (addAccountBtnClickCallback) {
        const name = $('#asset_name').val()
        const ticker = $('#asset_ticker').val()
        const type = $('#asset_type_select').val()
        const broker = $('#asset_broker').val()

        if (ValidationUtils.checkIfFieldsAreFilled([name, type])) {
          addAccountBtnClickCallback(name, ticker, type, broker)
        }
        else {
          DialogUtils.showErrorMessage('Por favor preencha todos os campos obrigatórios e tente novamente.')
        }
      }
    })
  },
  showRemoveAssetConfirmationModal (modalDivId, assetId, removeAssetCallback) {
    $('#modal-global').modal('open')
    let txt = `
      <h4>${Localization.getString("investments.deleteAssetModalTitle", {id: assetId})}</h4>
      <div class="row">
          <p>${Localization.getString("investments.deleteAssetModalSubtitle")}</p>
          <b>${Localization.getString("investments.deleteAssetModalAlert")}</b>
  
      </div>
      `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
            <a id="action-remove-asset-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.delete")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#action-remove-asset-btn').click(() => removeAssetCallback(assetId))
  },
  showEditAssetModal (modalDivID, assetId, ticker, name, type, broker, editAssetCallback) {
    $(modalDivID).modal('open')
    let html = `
      <h4 class="col s8">${Localization.getString("investments.editAsset")}</h4>
      <div class="row">
          <form class="col s12">
              <div class="input-field col s8">
              <i class="material-icons prefix">account_balance_wallet</i>
                  <input id="asset_name" type="text" class="validate" required value="${name}">
                  <label class="active" for="asset_name">${Localization.getString("investments.name")}</label>
              </div>
              <div class="input-field col s4">
              <i class="material-icons prefix">confirmation_number</i>
                  <input id="asset_ticker" type="text" class="validate" value="${ticker ? ticker : ''}">
                  <label class="active" for="asset_ticker">${Localization.getString("investments.ticker")}</label>
              </div>
              <div class="input-field col s8">
                  <i class="material-icons prefix">note</i>
                  <select id="asset_type_select" required>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.PPR.id)
      ? 'selected'
      : ''} value="${MYFIN.INVEST_ASSETS_TYPES.PPR.id}">${StringUtils.getInvestingAssetObjectById(MYFIN.INVEST_ASSETS_TYPES.PPR.id).name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.ETF.id)
      ? 'selected'
      : ''} value="${MYFIN.INVEST_ASSETS_TYPES.ETF.id}">${StringUtils.getInvestingAssetObjectById(MYFIN.INVEST_ASSETS_TYPES.ETF.id).name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.CRYPTO.id)
      ? 'selected'
      : ''} value="${MYFIN.INVEST_ASSETS_TYPES.CRYPTO.id}">${StringUtils.getInvestingAssetObjectById(MYFIN.INVEST_ASSETS_TYPES.CRYPTO.id).name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.FIXED_INCOME.id)
      ? 'selected'
      : ''} value="${MYFIN.INVEST_ASSETS_TYPES.FIXED_INCOME.id}">${StringUtils.getInvestingAssetObjectById(MYFIN.INVEST_ASSETS_TYPES.FIXED_INCOME.id).name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.INDEX_FUNDS.id)
      ? 'selected'
      : ''} value="${MYFIN.INVEST_ASSETS_TYPES.INDEX_FUNDS.id}">${StringUtils.getInvestingAssetObjectById(MYFIN.INVEST_ASSETS_TYPES.INDEX_FUNDS.id).name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.INVESTMENT_FUNDS.id)
      ? 'selected'
      : ''} value="${MYFIN.INVEST_ASSETS_TYPES.INVESTMENT_FUNDS.id}">${StringUtils.getInvestingAssetObjectById(MYFIN.INVEST_ASSETS_TYPES.INVESTMENT_FUNDS.id).name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.P2P_LOANS.id)
      ? 'selected'
      : ''} value="${MYFIN.INVEST_ASSETS_TYPES.P2P_LOANS.id}">${StringUtils.getInvestingAssetObjectById(MYFIN.INVEST_ASSETS_TYPES.P2P_LOANS.id).name}</option>
                      <option ${(type === MYFIN.INVEST_ASSETS_TYPES.STOCKS.id)
      ? 'selected'
      : ''} value="${MYFIN.INVEST_ASSETS_TYPES.STOCKS.id}">${StringUtils.getInvestingAssetObjectById(MYFIN.INVEST_ASSETS_TYPES.STOCKS.id).name}</option>
                  </select>
                  <label>${Localization.getString("common.type")}</label>
              </div>
              <div class="input-field col s4">
              <i class="material-icons prefix">business</i>
                  <input id="asset_broker" type="text" class="validate" value="${broker ? broker : ''}">
                  <label class="active" for="asset_broker">${Localization.getString("investments.broker")}</label>
              </div>
          </form>
      </div>
    `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
    <a id="edit_asset_btn"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.edit")}</a>`
    $(`${modalDivID} .modal-content`).html(html)
    $(`${modalDivID} .modal-footer`).html(actionLinks)

    $('#asset_type_select').formSelect()

    $('#edit_asset_btn').click(() => {
      if (editAssetCallback) {
        const name = $('#asset_name').val()
        const ticker = $('#asset_ticker').val()
        const type = $('#asset_type_select').val()
        const broker = $('#asset_broker').val()

        if (ValidationUtils.checkIfFieldsAreFilled([name, type])) {
          editAssetCallback(assetId, ticker, name, type, broker)
        }
        else {
          DialogUtils.showErrorMessage(Localization.getString("common.fillAllFieldsTryAgain"))
        }
      }
    })
  },
  showUpdateCurrentValueModal: (modalDivID, assetId, name, currentValue, conclusionCallback) => {
    $(modalDivID).modal('open')
    let html = `
      <h4 class="col s8">${Localization.getString("investments.currentInvestValue", {name: name})}</h4>
      <br>
      <div class="row">
          <form class="col s12">
              <div class="input-field col s4">
              <i class="material-icons prefix">euro_symbol</i>
                  <input id="asset_value" type="number" class="validate" value="${currentValue}">
                  <label class="active" for="asset_value">${Localization.getString("investments.currentValue")}</label>
              </div>
          </form>
      </div>
    `

    let actionLinks = `<a class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
    <a id="edit_asset_btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.update")}</a>`

    $(`${modalDivID} .modal-content`).html(html)
    $(`${modalDivID} .modal-footer`).html(actionLinks)
    $('#edit_asset_btn').click(() => {
      if (conclusionCallback) {
        const value = $('#asset_value').val()

        if (ValidationUtils.checkIfFieldsAreFilled([value])) {
          conclusionCallback(assetId, value)
        }
        else {
          DialogUtils.showErrorMessage(Localization.getString("common.fillAllFieldsTryAgain"))
        }
      }
    })
  },
}

//# sourceURL=js/funcs/investAssetsModalFunc.js