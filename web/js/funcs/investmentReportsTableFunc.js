import { InvestmentAssetsTableFunc } from './investmentAssetsTableFunc.js'
import { StringUtils } from '../utils/stringUtils.js'

export const InvestmentReportsTableFunc = {
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
        <td>${StringUtils.formatMoney(asset.absolute_roi_value)} ${InvestmentAssetsTableFunc.buildRoiPercentage(asset.relative_roi_percentage, true)}</td>
      </tr>
    `;
  },
  /* ROI BY YEAR TABLE */
  buildReportsROIByYearTable: (tableId, roiByYearList) => {
    return `
      <table id="${tableId}" class="display browser-defaults" style="width:100%">
        <thead>
          <tr>
              <th>Ano</th>
              <th>Valor Investido</th>
              <th>Valor Total</th>
              <th>ROI (€)</th>
              <th>ROI (%)</th>
          </tr>
        </thead>
        <tbody>
            ${Object.keys(roiByYearList).map(year => InvestmentReportsTableFunc.renderROIByYearTableRow(year, roiByYearList[year][0]))
      .join('')}
        </tbody>
      </table>
    `;
  },
  renderROIByYearTableRow: (year, roiObj) => {
    return `
      <tr>
        <td>${year}</td>
        <td>${StringUtils.formatMoney(roiObj.invested_in_year_amount)}</td>
        <td>${StringUtils.formatMoney(roiObj.value_total_amount)}</td>
        <td>${StringUtils.formatMoney(roiObj.roi_amount)}</td>
        <td>${InvestmentAssetsTableFunc.buildRoiPercentage(roiObj.roi_percentage)}</td>
      </tr>
    `;
  },
};
//# sourceURL=js/funcs/investmentReportsTableFunc.js