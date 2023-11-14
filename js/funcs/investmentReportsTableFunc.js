import { InvestmentAssetsTableFunc } from "./investmentAssetsTableFunc.js";
import { StringUtils } from "../utils/stringUtils.js";
import { Localization } from "../utils/localization.js";

export const InvestmentReportsTableFunc = {
  buildReportsROIByAssetTable: (tableId, assetsList, totalInvestedValue) => {
    return `
      <table id="${tableId}" class="display browser-defaults" style="width:100%">
        <thead>
          <tr>
              <th>${Localization.getString("investments.asset")}</th>
              <th>${Localization.getString("investments.assetClass")}</th>
              <th>${Localization.getString("investments.investedValue")}</th>
              <th>${Localization.getString("investments.feesAndTaxes")}</th>
              <th>${Localization.getString("investments.currentValue")}</th>
              <th>${Localization.getString("investments.currentYearROI")}</th>
              <th>${Localization.getString("investments.globalROI")}</th>
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
            <span class="" style="font-size: small;font-style: italic;">${Localization.getString('investments.perUnitPrice',
      { price: StringUtils.formatMoney(asset.invested_amount / asset.units) })}</span>
        </td>
        <td>${StringUtils.formatMoney(asset.fees_taxes)}</td>
        <td>${StringUtils.formatMoney(asset.current_value)}</td>
        <td>${`<i>${Localization.getString('common.soon')}...</i>`}</td>
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
              <th>${Localization.getString("investments.year")}</th>
              <th>${Localization.getString("investments.investedValue")}</th>
              <th>${Localization.getString("investments.feesAndTaxes")}</th>
              <th>${Localization.getString("investments.currentValue")}</th>
              <th>${Localization.getString("investments.roi")} (€)</th>
              <th>${Localization.getString("investments.roi")} (%)</th>
          </tr>
        </thead>
        <tbody>
            ${Object.keys(roiByYearList).map(year => InvestmentReportsTableFunc.renderROIByYearTableRow(year, roiByYearList[year]))
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
        <td>${StringUtils.formatMoney(roiObj.fees_taxes)}</td>
        <td>${StringUtils.formatMoney(roiObj.value_total_amount)}</td>
        <td>${StringUtils.formatMoney(roiObj.roi_amount)}</td>
        <td>${InvestmentAssetsTableFunc.buildRoiPercentage(roiObj.roi_percentage)}</td>
      </tr>
    `;
  },
};
//# sourceURL=js/funcs/investmentReportsTableFunc.js
