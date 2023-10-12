/* TYPES OF ACCOUNTS:
    - Checking Accounts (CHEAC)
    - Saving Accounts (SAVAC)
    - Investment Accounts (INVAC)
    - Credit Accounts (CREAC)
    - Other Accounts (OTHAC) */
import { LocalDataManager } from "./utils/localDataManager.js";
import { account_types_tag, StringUtils } from "./utils/stringUtils.js";

export var TopNav = {
  setupTopNavSummaryAmounts: () => {
    const current_savings_element = $('#top-summary-col-current-savings-value');
    const investments_element = $('#top-summary-col-investments-value');
    const credits_element = $('#top-summary-col-credits-value');
    const globalPatrimony_element = $('#top-summary-col-patrimony-value');

    let accsArr = LocalDataManager.getUserAccounts();

    current_savings_element.text(StringUtils.formatMoney(TopNav.calculateCurrentSavingsBalance(accsArr)));
    investments_element.text(StringUtils.formatMoney(TopNav.calculateInvestmentsBalance(accsArr)));
    credits_element.text(StringUtils.formatMoney(TopNav.calculateCreditsBalance(accsArr)));
    globalPatrimony_element.text(StringUtils.formatMoney(TopNav.calculateCurrentPatrimony(accsArr)));
  },
  calculateCurrentSavingsBalance: (accsArr) => {
    const savingsAndCurrentAccounts = accsArr.filter(function (acc) {
      return acc.type === account_types_tag.CHEAC || acc.type === account_types_tag.SAVAC
        || acc.type === account_types_tag.MEALAC || acc.type === account_types_tag.WALLET;
    });

    return StringUtils.convertIntegerToFloat(savingsAndCurrentAccounts.reduce((acc, item) => {
      return acc + StringUtils.convertFloatToInteger(parseFloat(item.balance));
    }, 0));
  },
  calculateInvestmentsBalance: (accsArr) => {
    const investmentAccounts = accsArr.filter(function (acc) {
      return acc.type === 'INVAC';
    });

    return StringUtils.convertIntegerToFloat(investmentAccounts.reduce((acc, item) => {
      return acc + StringUtils.convertFloatToInteger(parseFloat(item.balance));
    }, 0));
  },
  calculateCreditsBalance: (accsArr) => {
    const creditAccounts = accsArr.filter(function (acc) {
      return acc.type === 'CREAC';
    });

    return StringUtils.convertIntegerToFloat(creditAccounts.reduce((acc, item) => {
      return acc + StringUtils.convertFloatToInteger(parseFloat(item.balance));
    }, 0));
  },
  calculateCurrentPatrimony: (accsArr) => {
    return StringUtils.convertIntegerToFloat(accsArr.reduce((acc, item) => {
      return acc + StringUtils.convertFloatToInteger(parseFloat(item.balance));
    }, 0));
  },
};
window.TopNav = TopNav;
//# sourceURL=js/topNav.js