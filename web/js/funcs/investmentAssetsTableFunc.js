import { StringUtils } from '../utils/stringUtils.js'

export const InvestmentAssetsTableFunc = {
  renderAssetsTable: (assets, containerId, editAssetCallback, removeAssetCallback, updateValueCallback) => {
    $(containerId).html(`
      <table id="assets-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Ticker</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Broker</th>
                <th>Unidades</th>
                <th>Valor Investido</th>
                <th>Valor Atual</th>
                <th>ROI Atual</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            ${assets.map(asset => InvestmentAssetsTableFunc.renderAssetsRow(asset)).
      join('')}
        </tbody>
      </table>
    `)
    $('.tooltipped').tooltip()
    InvestmentAssetsTableFunc.bindClickListenersForEditAction(editAssetCallback)
    InvestmentAssetsTableFunc.bindClickListenersForRemoveAction(removeAssetCallback)
    InvestmentAssetsTableFunc.bindClickListenersForUpdateValueAction(updateValueCallback)
  },
  bindClickListenersForEditAction: (callback) => {
    $('.table-action-icons.action-edit').each(function () {
      $(this).on('click', function () {
        callback(
          this.dataset.assetId,
          this.dataset.assetTicker,
          this.dataset.assetName,
          this.dataset.assetType,
          this.dataset.assetBroker,
        )
      })
    })
  },
  bindClickListenersForRemoveAction: (callback) => {
    $('.table-action-icons.action-remove').each(function () {
      $(this).on('click', function () {
        callback(
          this.dataset.assetId,
          this.dataset.assetName,
          this.dataset.assetCurrentValue,
        )
      })
    })
  },
  bindClickListenersForUpdateValueAction: (callback) => {
    $('.table-action-icons.action-update-value').each(function () {
      $(this).on('click', function () {
        callback(
          this.dataset.assetId,
          this.dataset.assetName,
          this.dataset.assetCurrentValue,
        )
      })
    })
  },
  renderAssetsRow: (asset) => {
    return `
      <tr data-id='${asset.asset_id}'>
        <td>${asset.ticker ? asset.ticker : '-'}</td>
        <td>${asset.name}</td>
        <td>${StringUtils.getInvestingAssetObjectById(asset.type).name}</td>
        <td>${asset.broker ? asset.broker : '-'}</td>
        <td>${asset.units}</td>
        <td>${StringUtils.formatMoney(asset.currently_invested_value)}<br>
            <span class="" style="font-size: small;font-style: italic;">${StringUtils.formatMoney(asset.currently_invested_value / asset.units)} por unidade</span>
        </td>
        <td>${StringUtils.formatMoney(
      asset.current_value)}<i style="font-size: larger;color: var(--main-accent-color) !important;margin-left: 5px;vertical-align: text-bottom;"
        data-asset-id="${asset.asset_id}" data-asset-name="${asset.name}" data-asset-current-value="${asset.current_value}"
        class="material-icons table-action-icons action-update-value tooltipped" data-position="right" data-tooltip="Atualizar Valor">monetization_on</i></td>
        <td>${StringUtils.formatMoney(asset.absolute_roi_value)} ${InvestmentAssetsTableFunc.buildRoiPercentage(asset.relative_roi_percentage, true)}</td>
        <td>
            <i data-asset-id="${asset.asset_id}" data-asset-ticker="${asset.ticker ? asset.ticker : ''}"
             data-asset-name="${asset.name}" data-asset-type="${asset.type}" data-asset-broker="${asset.broker ? asset.broker : ''}"
             class="material-icons table-action-icons action-edit">create</i>
            <i data-asset-id="${asset.asset_id}" class="material-icons table-action-icons action-remove" style="margin-left:10px">delete</i>
        </td>
      </tr>
    `
  },
  buildRoiPercentage: (percentage, useSmallFont = false) => {
    let strToReturn = ''

    if (percentage > 0) {
      strToReturn = `<span class='green-text text-accent-4' ${useSmallFont
        ? ' style=\'font-size: small;\''
        : ''}>(+${StringUtils.formatStringToPercentage(percentage)})</span>`
    }
    else if (percentage < 0) {
      strToReturn = `<span class='pink-text text-accent-1' ${useSmallFont
        ? ' style=\'font-size: small;\''
        : ''}>(${StringUtils.formatStringToPercentage(percentage)})</span>`
    }
    else {
      strToReturn = `<span class='grey-text text-accent-1' ${useSmallFont ? ' style=\'font-size: small;\'' : ''}>(-)</span>`
    }

    return `${strToReturn}`
  },

}

//# sourceURL=js/funcs/investmentAssetsTableFunc.js