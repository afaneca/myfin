import { StringUtils } from '../utils/stringUtils.js'
import { DateUtils } from '../utils/dateUtils.js'
import { Localization } from '../utils/localization.js'

export const InvestmentTransactionsTableFunc = {
  renderTransactionsTable: (trxs, containerId) => {
    $(containerId).html(`
      <table id="transactions-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>${Localization.getString('common.date')}</th>
                <th>${Localization.getString('investments.asset')}</th>
                <th>${Localization.getString('common.type')}</th>
                <th>${Localization.getString('investments.units')}</th>
                <th>${Localization.getString('investments.broker')}</th>
                <th>${Localization.getString('common.value')}</th>
                <th>${Localization.getString('investments.observations')}</th>
                <th>${Localization.getString('common.actions')}</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    `)
  },
  getColumnsRenderingArray: () => {
    return [
      {
        data: InvestmentTransactionsTableFunc.buildDateColumnForTable,
      },
      {
        data: InvestmentTransactionsTableFunc.buildAssetColumnForTable,
      },
      {
        data: InvestmentTransactionsTableFunc.buildTypeColumnForTable,
      },
      {
        data: InvestmentTransactionsTableFunc.buildUnitsColumnForTable,
      },
      {
        data: InvestmentTransactionsTableFunc.buildBrokerColumnForTable,
      },
      {
        data: InvestmentTransactionsTableFunc.buildValueColumnForTable,
      },
      {
        data: InvestmentTransactionsTableFunc.buildObservationsColumnForTable,
      },
      {
        data: InvestmentTransactionsTableFunc.buildActionsColumnForTable,
      }]
  },
  buildDateColumnForTable: (trx, type, val, meta) =>
    `<div style="text-align: center;">
        <span><b>${DateUtils.getDayNumberFromUnixTimestamp(trx.date_timestamp)}</b></span><br>
        ${DateUtils.getMonthShortStringFromUnixTimestamp(
      trx.date_timestamp)} '${DateUtils.getShortYearFromUnixTimestamp(
      trx.date_timestamp)}</div>`,
  buildAssetColumnForTable: (trx, type, val, meta) =>
    `${trx.name + '<br><span style="font-size: small;">' +
    StringUtils.getInvestingAssetObjectById(trx.asset_type).name + '</span>'}`,
  buildTypeColumnForTable: (trx, type, val, meta) =>
    `${InvestmentTransactionsTableFunc.renderTrxTypeRow(trx.trx_type)}`,
  buildUnitsColumnForTable: (trx, type, val, meta) =>
    `${trx.units} ${trx.ticker ? trx.ticker : ''}`,
  buildBrokerColumnForTable: (trx, type, val, meta) =>
    `${trx.broker ? trx.broker : '-'}`,
  buildValueColumnForTable: (trx, type, val, meta) =>
    `${StringUtils.formatMoney(trx.total_price)}`,
  buildObservationsColumnForTable: (trx, type, val, meta) =>
    `${trx.note ? trx.note : '-'}`,
  buildActionsColumnForTable: (trx, type, val, meta) =>
    `<i data-trx-id="${trx.transaction_id}" data-date-timestamp="${trx.date_timestamp}" data-trx-type="${trx.trx_type}"
            data-trx-total-price="${trx.total_price}" data-trx-name="${trx.name}" data-trx-asset-type="${trx.asset_type}"
            data-trx-ticker="${trx.ticker}" data-trx-broker="${trx.broker}" data-trx-units="${trx.units}" data-trx-fees="${trx.fees_taxes}"
            data-trx-note="${trx.note}" data-trx-asset-id="${trx.asset_id}"
            class="material-icons table-action-icons action-edit">create</i>
            <i data-trx-id="${trx.transaction_id}" data-trx-asset-id="${trx.asset_id}" class="material-icons table-action-icons action-remove" style="margin-left:10px">delete</i>`,
  renderTrxTypeRow: typeId => {
    const typeName = StringUtils.getInvestingTransactionsTypeObjectById(typeId).name

    switch (typeId) {
      case MYFIN.INVEST_TRX_TYPES.BUY.id:
        return `<span style="height: auto !important;" class='badge green-text text-accent-6'>${typeName}</span>`
      default:
        return `<span style="height: auto !important;" class='badge orange-text text-accent-2'>${typeName}</span>`

    }
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
          this.dataset.trxFees,
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

}

//# sourceURL=js/funcs/investmentTransactionsTableFunc.js