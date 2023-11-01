import { StringUtils } from "../utils/stringUtils.js";
import { Localization } from "../utils/localization.js";

export const TransactionsListComponent = {
  buildTransactionsList: (id, wrapperId, trxList) => {
    document.getElementById(wrapperId).innerHTML = `
      <style>
        .t-row {
          display: flex;
          flex-flow: row nowrap;
          justify-content: space-between;
          margin: 9.5px 0;
        }
  
        .t-row-item {
            /*flex-grow: 1;*/
            margin: 3px;
        }
    
        .trx-type-middle {
            justify-content: space-between;
            width: 100%;
            flex-wrap: wrap;
            -webkit-box-align: center;
            align-items: center;
            -webkit-box-pack: justify;
            margin-left: 5px;
        }
    
        .trx-type-amount {
            font-weight: 400;
        }
    
        .inner-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
        }
      </style>
      <div id="trx-list-${id}">
        ${trxList.map(trx => TransactionsListInternals.buildTrxRow(trx)).join('')}
      </div>
    `
  },
}

const TransactionsListInternals = {
  buildTrxRow: (trx) => {
    return `
      <div class="t-row">
        <div class="valign-wrapper t-row-item">
            ${TransactionsListInternals.buildTrxIcon(trx)}
        </div>
        <div class="t-row-item trx-type-middle">
            <p style="font-weight: bold;margin: 0px 0px 0.0625rem;">${trx.entity_name ? trx.entity_name : Localization.getString("common.noEntity")}</p>
            <span style="color: var(--main-light-gray-color);">${trx.description}</span>
        </div>
        <div class="t-row-item valign-wrapper trx-type-amount">${TransactionsListInternals.buildAmount(trx)}</div>
    </div>
    `
  },
  inferTrxType: (trx) => {
    if (trx.accounts_account_to_id && trx.accounts_account_from_id) {
      return MYFIN.TRX_TYPES.TRANSFER
    }
    else if (trx.accounts_account_to_id) {
      return MYFIN.TRX_TYPES.INCOME
    }
    else {
      return MYFIN.TRX_TYPES.EXPENSE
    }
  },
  buildAmount: (trx) => {
    const type = TransactionsListInternals.inferTrxType(trx)
    switch (type) {
      case MYFIN.TRX_TYPES.EXPENSE:
        return `-${StringUtils.formatMoney(trx.amount)}`
      default:
        return `+${StringUtils.formatMoney(trx.amount)}`
    }
  },
  buildTrxIcon: (trx) => {
    const type = TransactionsListInternals.inferTrxType(trx)
    switch (type) {
      case MYFIN.TRX_TYPES.TRANSFER:
        return `
      <div class="orange-gradient-bg" style="width: 40px; height: 40px;border-radius:25px;">
        <i class="white-text grey-text material-icons inner-icon" style="color: white !important;">compare_arrows</i>
      </div>
    `
      case MYFIN.TRX_TYPES.INCOME:
        return `
      <div class="green-gradient-bg" style="width: 40px; height: 40px;border-radius:25px;">
        <i class="white-text grey-text material-icons inner-icon" style="color: white !important;">arrow_forward</i>
      </div>
    `
      case MYFIN.TRX_TYPES.EXPENSE:
        return `
      <div class="red-gradient-bg" style="width: 40px; height: 40px;border-radius:25px;">
        <i class="white-text grey-text material-icons inner-icon" style="color: white !important;">arrow_back</i>
      </div>
    `
    }
  },
}
//# sourceURL=js/components/transactionsListComponent.js