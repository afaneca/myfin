'use strict';

var InvestmentTransactionsTableFunc = {
  renderTransactionsTable: (trxs, containerId, editTrxCallback, removeTrxCallback) => {
    $(containerId)
      .html(`
      <table id="transactions-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Data</th>
                <th>Ativo</th>
                <th>Tipo</th>
                <th>Unidades</th>
                <th>Broker</th>
                <th>Valor Investido</th>
                <th>Observações</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            ${trxs.map(trx => InvestmentTransactionsTableFunc.renderTransactionsRow(trx, editTrxCallback, removeTrxCallback))
        .join('')}
        </tbody>
      </table>
    `);
  },
  renderTransactionsRow: (trx, editTrxCallback, removeTrxCallback) => {
    return `
      <tr data-id='${trx.transaction_id}'>
        <td style="text-align: center;">
                    <span><b>${DateUtils.getDayNumberFromUnixTimestamp(trx.date_timestamp)}</b></span><br>${DateUtils.getMonthShortStringFromUnixTimestamp(trx.date_timestamp)} '${DateUtils.getShortYearFromUnixTimestamp(trx.date_timestamp)}         
        </td>
        <td>${trx.name + '<br><span style="font-size: small;">' + StringUtils.getInvestingAssetObjectById(trx.asset_type).name + '</span>'}</td>
        <td>${InvestmentTransactionsTableFunc.renderTrxTypeRow(trx.trx_type)}</td>
        <td>${trx.units} ${trx.ticker ? trx.ticker : ''}</td>
        <td>${trx.broker ? trx.broker : '-'}</td>
        <td>${StringUtils.formatMoney(trx.total_price)}</td>
        <td>${trx.note ? trx.note : '-'}</td>
        <td>
            <i onClick="Investments.${editTrxCallback.name}(${trx.transaction_id}, '${trx.date_timestamp}', '${trx.trx_type}', '${trx.total_price}', '${trx.name}', '${trx.asset_type}', '${trx.ticker}', '${trx.broker}', '${trx.units}', '${trx.note}', '${trx.asset_id}')" class="material-icons table-action-icons">create</i>
            <i onClick="Investments.${removeTrxCallback.name}(${trx.transaction_id}, '${trx.asset_id}')" class="material-icons table-action-icons" style="margin-left:10px">delete</i>
        </td>
      </tr>
    `;
  },
  renderTrxTypeRow: typeId => {
    const typeName = StringUtils.getInvestingTransactionsTypeObjectById(typeId).name;

    switch (typeId) {
      case MYFIN.INVEST_TRX_TYPES.BUY.id:
        return `<span style="height: auto !important;" class='badge green-text text-accent-6'>${typeName}</span>`;
      default:
        return `<span style="height: auto !important;" class='badge orange-text text-accent-2'>${typeName}</span>`;

    }
  },
  buildRoiPercentage: (percentage) => {
    let strToReturn = '';

    if (percentage > 0) {
      strToReturn = `<span class='green-text text-accent-4' style="font-size: small;">+${StringUtils.formatStringToPercentage(percentage)}</span>`;
    } else if (percentage < 0) {
      strToReturn = `<span class='pink-text text-accent-1' style="font-size: small;">${StringUtils.formatStringToPercentage(percentage)}</span>`;
    } else {
      strToReturn = `<span class="" style="font-size: small;">${StringUtils.formatStringToPercentage(percentage)}</span>`;
    }

    return `(${strToReturn})`;
  },

};

//# sourceURL=js/funcs/investmentTransactionsTableFunc.js