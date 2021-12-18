'use strict';

var InvestmentReportsTableFunc = {
  buildReportsROIByAssetTable: (tableId, assetsList, totalInvestedValue) => {
    return `
      <table id="${tableId}" class="display browser-defaults" style="width:100%">
        <thead>
          <tr>
              <th>Ativo</th>
              <th>Classe de Ativo</th>
              <th>Valor Investido</th>
              <th>Valor Atual</th>
              <th>ROI Ano Atual</th>
              <th>ROI Global</th>
          </tr>
        </thead>
        <tbody>
            ${assetsList.map(asset => InvestmentReportsTableFunc.renderROIBYAssetTableRow(asset))
      .join('')}
        </tbody>
      </table>
    `;
  },
  renderROIBYAssetTableRow: (asset) => {
    return `
      <tr data-id='${asset.asset_id}'>
        <td>${asset.name}</td>
        <td>${StringUtils.getInvestingAssetObjectById(asset.type).name}</td>
        <td>${StringUtils.formatMoney(asset.invested_amount)}<br>
            <span class="" style="font-size: small;font-style: italic;">${StringUtils.formatMoney(asset.invested_amount / asset.units)} por unidade</span>
        </td>
        <td>${StringUtils.formatMoney(asset.current_value)}</td>
        <td>${'<i>Em breve...</i>'}</td>
        <td>${StringUtils.formatMoney(asset.absolute_roi_value)} ${InvestmentAssetsTableFunc.buildRoiPercentage(asset.relative_roi_percentage)}</td>
      </tr>
    `;
  },
};
//# sourceURL=js/funcs/investmentReportsTableFunc.js