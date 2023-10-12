import { LoadingManager } from "../utils/loadingManager.js";
import { StringUtils } from "../utils/stringUtils.js";
import { DialogUtils } from "../utils/dialogUtils.js";
import { DateUtils } from "../utils/dateUtils.js";
import { TransactionServices } from "../services/transactionServices.js";
import { LayoutUtils } from "../utils/layoutUtils.js";
import { Localization } from "../utils/localization.js";

export const CategoryTooltipTransactionsFunc = {
  showCategoryTransactionsForMonthInModal: (catID, isCredit, month, year) => {
    LoadingManager.showLoading();
    const type = (isCredit) ? MYFIN.TRX_TYPES.INCOME : MYFIN.TRX_TYPES.EXPENSE;
    TransactionServices.getTransactionsFromMonthAndCategory(month, year, catID, type,
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading();
        CategoryTooltipTransactionsFunc.renderModal(catID, isCredit, resp);
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading();
        DialogUtils.showErrorMessage();
      });
  },
  renderModal: (catID, isCredit, trxList) => {
    $('#modal-global')
      .modal('open');
    let txt = `
                <style>
                    tbody.scrollable-table {
                            display:block;
                            height:150px;
                            overflow:auto;
                        }
                    thead.scrollable-table, tbody.scrollable-table tr.scrollable-table {
                        display:table;
                        width:100%;
                        table-layout:fixed;
                    }
                    thead.scrollable-table {
                        width: calc( 100% - 1em )
                    }
                    table.scrollable-table {
                        width:100%;
                    }
                </style>
                <h4>${Localization.getString("budgetDetails.transactionsList")}</b></h4>
                <div class="row">
                    <div class="responsive-table scrollable-table table-status-sheet">
                        <table class="bordered scrollable-table striped">
                          <thead class="scrollable-table">
                            <tr class="scrollable-table">
                              <th class="center">${Localization.getString("common.date")}</th>
                              <th class="center">${Localization.getString("common.description")}</th>
                              <th class="center">${Localization.getString("common.account")}</th>
                              <th class="center">${Localization.getString("common.amount")}</th>
                            </tr>
                          </thead>
                          <tbody class="scrollable-table">
                            ${trxList.map(trx => CategoryTooltipTransactionsFunc.renderTableRow(trx.date_timestamp, trx.description,
      (isCredit) ? trx.account_to_name : trx.account_from_name, trx.amount, trx.is_essential))
      .join('')}
                          </tbody>
                        </table>
                      </div>
                </div>
                `;

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.goBack")}</a>`;
    $('#modal-global .modal-content')
      .html(txt);
    $('#modal-global .modal-footer')
      .html(actionLinks);
  },
  renderTableRow: (date_timestamp, description, account, amount, isEssential) => {
    return `
            <tr class="scrollable-table">
                <td class="center">${DateUtils.convertUnixTimestampToDateString(date_timestamp)}</td>
                <td class="center">${isEssential == true ? LayoutUtils.buildEssentialTransactionBadge() : ''} ${description}</td>
                <td class="center">${account}</td>
                <td class="center">${StringUtils.formatStringToCurrency(amount)}</td>
            </tr>
        `;
  },
};

//# sourceURL=js/funcs/categoryTooltipTransactionsFunc.js