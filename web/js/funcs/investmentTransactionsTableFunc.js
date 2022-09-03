import { StringUtils } from '../utils/stringUtils.js'
import { DateUtils } from '../utils/dateUtils.js'

export const InvestmentTransactionsTableFunc = {
  renderTransactionsTable: (trxs, containerId, editTrxCallback, removeTrxCallback) => {
    $(containerId).html(`
      <table id="transactions-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Data</th>
                <th>Ativo</th>
                <th>Tipo</th>
                <th>Unidades</th>
                <th>Broker</th>
                <th>Valor</th>
                <th>Observações</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            ${trxs.map(trx => InvestmentTransactionsTableFunc.renderTransactionsRow(trx, editTrxCallback, removeTrxCallback)).join('')}
        </tbody>
      </table>
    `)
    InvestmentTransactionsTableFunc.bindClickListenersForTrxEditAction(editTrxCallback)
    InvestmentTransactionsTableFunc.bindClickListenersForTrxRemoveAction(removeTrxCallback)
  },
  bindClickListenersForTrxEditAction: (callback) => {
    $('.action-edit').each(function () {
      $(this).on('click', function () {
        callback(
          this.dataset.trxId,
          this.dataset.dateTimestamp,
          this.dataset.trxType,
          this.dataset.trxTotalPrice,
          this.dataset.trxName,
          this.dataset.trxAssetType,
          this.dataset.trxTicker,
          this.dataset.trxBroker,
          this.dataset.trxUnits,
          this.dataset.trxNote,
          this.dataset.trxAssetId,
        )
      })
    })
  },
  bindClickListenersForTrxRemoveAction: (callback) => {
    $('.action-remove').each(function () {
      $(this).on('click', function () {
        callback(
          this.dataset.trxId,
          this.dataset.trxAssetId,
        )
      })
    })
  },
  renderTransactionsRow: (trx, editTrxCallback, removeTrxCallback) => {
    return `
      <tr data-id='${trx.transaction_id}'>
        <td style="text-align: center;">
                    <span><b>${DateUtils.getDayNumberFromUnixTimestamp(
      trx.date_timestamp)}</b></span><br>${DateUtils.getMonthShortStringFromUnixTimestamp(
      trx.date_timestamp)} '${DateUtils.getShortYearFromUnixTimestamp(trx.date_timestamp)}         
        </td>
        <td>${trx.name + '<br><span style="font-size: small;">' + StringUtils.getInvestingAssetObjectById(trx.asset_type).name + '</span>'}</td>
        <td>${InvestmentTransactionsTableFunc.renderTrxTypeRow(trx.trx_type)}</td>
        <td>${trx.units} ${trx.ticker ? trx.ticker : ''}</td>
        <td>${trx.broker ? trx.broker : '-'}</td>
        <td>${StringUtils.formatMoney(trx.total_price)}
          <br>
          <span class="" style="font-size: small;font-style: italic;">${StringUtils.formatMoney(trx.total_price / trx.units)} por unidade</span>
        </td>
        <td>${trx.note ? trx.note : '-'}</td>
        <td>
            <i data-trx-id="${trx.transaction_id}" data-date-timestamp="${trx.date_timestamp}" data-trx-type="${trx.trx_type}"
            data-trx-total-price="${trx.total_price}" data-trx-name="${trx.name}" data-trx-asset-type="${trx.asset_type}"
            data-trx-ticker="${trx.ticker}" data-trx-broker="${trx.broker}" data-trx-units="${trx.units}"
            data-trx-note="${trx.note}" data-trx-asset-id="${trx.asset_id}"
            class="material-icons table-action-icons action-edit">create</i>
            <i data-trx-id="${trx.transaction_id}" data-trx-asset-id="${trx.asset_id}" class="material-icons table-action-icons action-remove" style="margin-left:10px">delete</i>
        </td>
      </tr>
    `
  },
  renderTrxTypeRow: typeId => {
    const typeName = StringUtils.getInvestingTransactionsTypeObjectById(typeId).name

    switch (typeId) {
      case MYFIN.INVEST_TRX_TYPES.BUY.id:
        return `<span style="height: auto !important;" class='badge green-text text-accent-6'>${typeName}</span>`
      default:
        return `<span style="height: auto !important;" class='badge orange-text text-accent-2'>${typeName}</span>`

    }
  },
  buildRoiPercentage: (percentage) => {
    let strToReturn = ''

    if (percentage > 0) {
      strToReturn = `<span class='green-text text-accent-4' style="font-size: small;">+${StringUtils.formatStringToPercentage(percentage)}</span>`
    }
    else if (percentage < 0) {
      strToReturn = `<span class='pink-text text-accent-1' style="font-size: small;">${StringUtils.formatStringToPercentage(percentage)}</span>`
    }
    else {
      strToReturn = `<span class="" style="font-size: small;">${StringUtils.formatStringToPercentage(percentage)}</span>`
    }

    return `(${strToReturn})`
  },

}

//# sourceURL=js/funcs/investmentTransactionsTableFunc.js