import { performDatabaseRequest } from "../config/prisma.js";
import AccountService from "../services/accountService.js";
import DateTimeUtils from "./DateTimeUtils.js";
import TransactionService from "../services/transactionService.js";
import InvestAssetService from "../services/investAssetService.js";
import InvestTransactionsService from "../services/investTransactionsService.js";
import CategoryService from "../services/categoryService.js";
import { MYFIN } from "../consts.js";
import EntityService from "../services/entityService.js";
import RuleService from "../services/ruleService.js";
import { invest_transactions_type } from "@prisma/client";

// ACCOUNTS
let ACCOUNT_CURRENT1_ID = -1;
let ACCOUNT_SAVINGS1_ID = -1;
let ACCOUNT_CREDIT1_ID = -1;
let ACCOUNT_CREDIT2_MORTGAGE_ID = -1;
let ACCOUNT_INVEST1_ID = -1;

// CATEGORIES
let CAT_HOME_REPAIRS_ID = -1;
let CAT_WAGES_ID = -1;
let CAT_GROCERIES_ID = -1;
let CAT_REIMBURSABLE_ID = -1;
let CAT_UTILITIES_ID = -1;
let CAT_LOAN_PAYMENTS_ID = -1;
let CAT_LOAN_INTEREST_ID = -1;
let CAT_ENTERTAINMENT_ID = -1;
let CAT_AUTO_MAINTENANCE = -1;

// ENTITIES
let ENT_SUPERMARKET1_ID = -1;
let ENT_COMPANY1_ID = -1;
let ENT_STORE1_ID = -1;
let ENT_STORE2_ID = -1;
let ENT_RESTAURANT1_ID = -1;
let ENT_RESTAURANT2_ID = -1;
let ENT_CINEMA1 = -1;
let ENT_BANK1_ID = -1;
let ENT_BANK2_ID = -1;

// ASSETS
let ASSET_FIXED_INC1 = -1;
let ASSET_FIXED_INC2 = -1;
let ASSET_ETF1 = -1;
let ASSET_CRYPTO1 = -1;

const getRandomColorGradient = () => {
  const colorGradients = [
    'red-gradient',
    'blue-gradient',
    'green-gradient',
    'orange-gradient',
    'dark-gray-gradient',
    'purple-gradient',
    'pink-gradient',
    'dark-blue-gradient',
    'brown-gradient',
    'light-green-gradient',
    'dark-red-gradient',
    'yellow-gradient',
    'roseanna-gradient',
    'mauve-gradient',
    'lush-gradient',
    'pale-wood-gradient',
    'aubergine-gradient',
    'orange-coral-gradient',
    'decent-gradient',
    'dusk-gradient',
  ];

  return colorGradients[Math.floor(Math.random() * colorGradients.length)];
};

const deleteAllUserData = async (userId: bigint, dbClient = undefined) => {
  return performDatabaseRequest(async (prismaTx) => {
    const promises = [];

    // Delete all current budgets
    promises.push(
      prismaTx.budgets_has_categories.deleteMany({
        where: {
          budgets_users_user_id: userId,
        },
      })
    );
    promises.push(
      prismaTx.budgets.deleteMany({
        where: { users_user_id: userId },
      })
    );

    // Delete all current transactions
    promises.push(TransactionService.deleteAllTransactionsFromUser(userId, prismaTx));

    // Delete all current categories
    promises.push(
      prismaTx.categories.deleteMany({
        where: { users_user_id: userId },
      })
    );

    // Delete all current entities
    promises.push(
      prismaTx.entities.deleteMany({
        where: { users_user_id: userId },
      })
    );

    // Delete all current accounts
    promises.push(AccountService.deleteBalanceSnapshotsForUser(userId, prismaTx));
    promises.push(
      prismaTx.accounts.deleteMany({
        where: { users_user_id: userId },
      })
    );

    // Delete all current rules
    promises.push(
      prismaTx.rules.deleteMany({
        where: { users_user_id: userId },
      })
    );

    // Delete all current investment transactions
    promises.push(InvestTransactionsService.deleteAllTransactionsForUser(userId, prismaTx));

    // Delete all current investment assets
    promises.push(
      prismaTx.invest_assets.deleteMany({
        where: { users_user_id: userId },
      })
    );
    promises.push(InvestAssetService.deleteAllAssetEvoSnapshotsForUser(userId, prismaTx));

    await Promise.all(promises);
  }, dbClient);
};

const createMockCategories = async (userId: bigint, dbClient = undefined) =>
  performDatabaseRequest(async (prismaTx) => {
    const promises = [];
    // CAT 1
    promises.push(
      CategoryService.createCategory(
        {
          type: 'M',
          users_user_id: userId,
          name: 'Home Repairs 🧰',
          description: 'Home maintenance & repais',
          color_gradient: getRandomColorGradient(),
          status: MYFIN.CATEGORY_STATUS.ACTIVE,
          exclude_from_budgets: 0,
        },
        prismaTx
      )
    );

    // CAT 2
    promises.push(
      CategoryService.createCategory(
        {
          type: 'M',
          users_user_id: userId,
          name: 'Wages 💼',
          description: 'Job salaries & related comp',
          color_gradient: getRandomColorGradient(),
          status: MYFIN.CATEGORY_STATUS.ACTIVE,
          exclude_from_budgets: 0,
        },
        prismaTx
      )
    );

    // CAT 3
    promises.push(
      CategoryService.createCategory(
        {
          type: 'M',
          users_user_id: userId,
          name: 'Groceries 🛒',
          description: '',
          color_gradient: getRandomColorGradient(),
          status: MYFIN.CATEGORY_STATUS.ACTIVE,
          exclude_from_budgets: 0,
        },
        prismaTx
      )
    );

    // CAT 4
    promises.push(
      CategoryService.createCategory(
        {
          type: 'M',
          users_user_id: userId,
          name: 'Reimbursable 💫',
          description: 'Minor loans to family & friends and other reimbursable expenses',
          color_gradient: getRandomColorGradient(),
          status: MYFIN.CATEGORY_STATUS.ACTIVE,
          exclude_from_budgets: 0,
        },
        prismaTx
      )
    );

    // CAT 5
    promises.push(
      CategoryService.createCategory(
        {
          type: 'M',
          users_user_id: userId,
          name: 'Utilities 💧⚡📺',
          description: 'Water, electricity, tv & related bills',
          color_gradient: getRandomColorGradient(),
          status: MYFIN.CATEGORY_STATUS.ACTIVE,
          exclude_from_budgets: 0,
        },
        prismaTx
      )
    );

    // CAT 6
    promises.push(
      CategoryService.createCategory(
        {
          type: 'M',
          users_user_id: userId,
          name: 'Loan Payments 💸',
          description: 'Principal payments related to loans',
          color_gradient: getRandomColorGradient(),
          status: MYFIN.CATEGORY_STATUS.ACTIVE,
          exclude_from_budgets: 0,
        },
        prismaTx
      )
    );

    // CAT 7
    promises.push(
      CategoryService.createCategory(
        {
          type: 'M',
          users_user_id: userId,
          name: 'Loan Interest 🧾',
          description: 'Loans interest & other banking expenses',
          color_gradient: getRandomColorGradient(),
          status: MYFIN.CATEGORY_STATUS.ACTIVE,
          exclude_from_budgets: 0,
        },
        prismaTx
      )
    );

    // CAT 8
    promises.push(
      CategoryService.createCategory(
        {
          type: 'M',
          users_user_id: userId,
          name: 'Entertainment & Eating Out 🍿',
          description: 'Eating out, going to the movies, etc...',
          color_gradient: getRandomColorGradient(),
          status: MYFIN.CATEGORY_STATUS.ACTIVE,
          exclude_from_budgets: 0,
        },
        prismaTx
      )
    );

    // CAT 9
    promises.push(
      CategoryService.createCategory(
        {
          type: 'M',
          users_user_id: userId,
          name: 'Auto Maintenance 🚗',
          description: 'Car repairs, upgrades, etc...',
          color_gradient: getRandomColorGradient(),
          status: MYFIN.CATEGORY_STATUS.ACTIVE,
          exclude_from_budgets: 0,
        },
        prismaTx
      )
    );

    // CAT EXTRA
    promises.push(
      CategoryService.createCategory(
        {
          type: 'M',
          users_user_id: userId,
          name: 'Some other category',
          description: '',
          color_gradient: getRandomColorGradient(),
          status: MYFIN.CATEGORY_STATUS.INACTIVE,
          exclude_from_budgets: 0,
        },
        prismaTx
      )
    );

    const categories = await Promise.all(promises);
    CAT_HOME_REPAIRS_ID = categories[0].category_id;
    CAT_WAGES_ID = categories[1].category_id;
    CAT_GROCERIES_ID = categories[2].category_id;
    CAT_REIMBURSABLE_ID = categories[3].category_id;
    CAT_UTILITIES_ID = categories[4].category_id;
    CAT_LOAN_PAYMENTS_ID = categories[5].category_id;
    CAT_LOAN_INTEREST_ID = categories[6].category_id;
    CAT_ENTERTAINMENT_ID = categories[7].category_id;
    CAT_AUTO_MAINTENANCE = categories[8].category_id;
  }, dbClient);

const createMockEntities = async (userId: bigint, dbClient = undefined) =>
  performDatabaseRequest(async (prismaTx) => {
    const promises = [];

    promises.push(
      EntityService.createEntity(
        {
          users_user_id: userId,
          name: 'ABC Supermarket',
        },
        prismaTx
      )
    );

    promises.push(
      EntityService.createEntity(
        {
          users_user_id: userId,
          name: 'Best Company',
        },
        prismaTx
      )
    );

    promises.push(
      EntityService.createEntity(
        {
          users_user_id: userId,
          name: 'XYZ Store',
        },
        prismaTx
      )
    );

    promises.push(
      EntityService.createEntity(
        {
          users_user_id: userId,
          name: 'QUERTY Store',
        },
        prismaTx
      )
    );

    promises.push(
      EntityService.createEntity(
        {
          users_user_id: userId,
          name: `Chow's Restaurant`,
        },
        prismaTx
      )
    );

    promises.push(
      EntityService.createEntity(
        {
          users_user_id: userId,
          name: 'HQ Mutual',
        },
        prismaTx
      )
    );

    promises.push(
      EntityService.createEntity(
        {
          users_user_id: userId,
          name: 'DeliCely Restaurant',
        },
        prismaTx
      )
    );

    promises.push(
      EntityService.createEntity(
        {
          users_user_id: userId,
          name: 'Popcorn World',
        },
        prismaTx
      )
    );

    promises.push(
      EntityService.createEntity(
        {
          users_user_id: userId,
          name: 'BBank',
        },
        prismaTx
      )
    );

    const entities = await Promise.all(promises);
    ENT_SUPERMARKET1_ID = entities[0].entity_id;
    ENT_COMPANY1_ID = entities[1].entity_id;
    ENT_STORE1_ID = entities[2].entity_id;
    ENT_STORE2_ID = entities[3].entity_id;
    ENT_RESTAURANT1_ID = entities[4].entity_id;
    ENT_BANK1_ID = entities[5].entity_id;
    ENT_RESTAURANT2_ID = entities[6].entity_id;
    ENT_CINEMA1 = entities[7].entity_id;
    ENT_BANK2_ID = entities[8].entity_id;
  }, dbClient);

const createMockAccounts = async (userId: bigint, dbClient = undefined) =>
  performDatabaseRequest(async (prismaTx) => {
    const promises = [];

    promises.push(
      AccountService.createAccount(
        {
          users_user_id: userId,
          name: 'BBank - Current',
          description: 'Current account from BBank',
          exclude_from_budgets: false,
          type: MYFIN.ACCOUNT_TYPES.CHECKING,
          status: MYFIN.ACCOUNT_STATUS.ACTIVE,
          current_balance: 0,
          color_gradient: getRandomColorGradient(),
        },
        userId,
        prismaTx
      )
    );

    promises.push(
      AccountService.createAccount(
        {
          users_user_id: userId,
          name: 'BBank - Savings',
          description: 'Savings account from BBank',
          exclude_from_budgets: false,
          type: MYFIN.ACCOUNT_TYPES.SAVINGS,
          status: MYFIN.ACCOUNT_STATUS.ACTIVE,
          current_balance: 0,
          color_gradient: getRandomColorGradient(),
        },
        userId,
        prismaTx
      )
    );

    promises.push(
      AccountService.createAccount(
        {
          users_user_id: userId,
          name: 'XYZ Capital',
          description: 'Brokerage account from XYZ Capital',
          exclude_from_budgets: false,
          type: MYFIN.ACCOUNT_TYPES.INVESTING,
          status: MYFIN.ACCOUNT_STATUS.ACTIVE,
          current_balance: 0,
          color_gradient: getRandomColorGradient(),
        },
        userId,
        prismaTx
      )
    );

    promises.push(
      AccountService.createAccount(
        {
          users_user_id: userId,
          name: 'SAFU Credit',
          description: 'Credit card from SAFU Credit',
          exclude_from_budgets: true,
          type: MYFIN.ACCOUNT_TYPES.CREDIT,
          status: MYFIN.ACCOUNT_STATUS.ACTIVE,
          current_balance: 0,
          color_gradient: getRandomColorGradient(),
        },
        userId,
        prismaTx
      )
    );

    promises.push(
      AccountService.createAccount(
        {
          users_user_id: userId,
          name: 'HQ Mutual',
          description: 'Mortgage loan from HQ Mutual',
          exclude_from_budgets: true,
          type: MYFIN.ACCOUNT_TYPES.CREDIT,
          status: MYFIN.ACCOUNT_STATUS.ACTIVE,
          current_balance: 0,
          color_gradient: getRandomColorGradient(),
        },
        userId,
        prismaTx
      )
    );

    const accounts = await Promise.all(promises);
    ACCOUNT_CURRENT1_ID = accounts[0].account_id;
    ACCOUNT_SAVINGS1_ID = accounts[1].account_id;
    ACCOUNT_INVEST1_ID = accounts[2].account_id;
    ACCOUNT_CREDIT1_ID = accounts[3].account_id;
    ACCOUNT_CREDIT2_MORTGAGE_ID = accounts[4].account_id;
  }, dbClient);

const createMockTransactions = async (userId: bigint, dbClient = undefined) =>
  performDatabaseRequest(async (prismaTx) => {
    // Start adding transactions from 3 months ago
    let date = DateTimeUtils.decrementMonthByX(
      DateTimeUtils.getMonthNumberFromTimestamp(),
      DateTimeUtils.getYearFromTimestamp(),
      3
    );
    let month = date.month;
    let year = date.year;

    const promises = [];

    // MONTH 1
    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 25)),
          description: 'Initial balance',
          amount: 5_000_00,
          type: MYFIN.TRX_TYPES.INCOME,
          entities_entity_id: ENT_BANK1_ID,
          accounts_account_from_id: null,
          accounts_account_to_id: ACCOUNT_CURRENT1_ID,
          categories_category_id: null,
          is_essential: false,
        },
      })
    );

    // MONTH 2
    date = DateTimeUtils.decrementMonthByX(
      DateTimeUtils.getMonthNumberFromTimestamp(),
      DateTimeUtils.getYearFromTimestamp(),
      2
    );
    month = date.month;
    year = date.year;

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 2)),
          description: '',
          amount: 300_000_00,
          type: MYFIN.TRX_TYPES.EXPENSE,
          entities_entity_id: ENT_BANK1_ID,
          accounts_account_from_id: ACCOUNT_CREDIT2_MORTGAGE_ID,
          accounts_account_to_id: null,
          categories_category_id: null,
          is_essential: false,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 3)),
          description: 'Savings',
          amount: 2_000_00,
          type: MYFIN.TRX_TYPES.TRANSFER,
          entities_entity_id: ENT_BANK1_ID,
          accounts_account_from_id: ACCOUNT_CURRENT1_ID,
          accounts_account_to_id: ACCOUNT_SAVINGS1_ID,
          categories_category_id: null,
          is_essential: false,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 3)),
          description: 'Eating out',
          amount: 89_60,
          type: MYFIN.TRX_TYPES.EXPENSE,
          entities_entity_id: ENT_BANK1_ID,
          accounts_account_from_id: ACCOUNT_CREDIT1_ID,
          accounts_account_to_id: null,
          categories_category_id: CAT_ENTERTAINMENT_ID,
          is_essential: false,
        },
      })
    );

    // MONTH 3
    date = DateTimeUtils.decrementMonthByX(
      DateTimeUtils.getMonthNumberFromTimestamp(),
      DateTimeUtils.getYearFromTimestamp(),
      1
    );
    month = date.month;
    year = date.year;

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 5)),
          description: 'Grocery shopping',
          amount: 135_67,
          type: MYFIN.TRX_TYPES.EXPENSE,
          entities_entity_id: ENT_SUPERMARKET1_ID,
          accounts_account_from_id: ACCOUNT_CREDIT1_ID,
          accounts_account_to_id: null,
          categories_category_id: CAT_GROCERIES_ID,
          is_essential: true,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 21)),
          description: 'Monthly wage',
          amount: 3500_00,
          type: MYFIN.TRX_TYPES.INCOME,
          entities_entity_id: ENT_COMPANY1_ID,
          accounts_account_from_id: null,
          accounts_account_to_id: ACCOUNT_CURRENT1_ID,
          categories_category_id: CAT_WAGES_ID,
          is_essential: false,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 21)),
          description: 'Savings increase',
          amount: 500_00,
          type: MYFIN.TRX_TYPES.TRANSFER,
          entities_entity_id: ENT_BANK1_ID,
          accounts_account_from_id: ACCOUNT_CURRENT1_ID,
          accounts_account_to_id: ACCOUNT_SAVINGS1_ID,
          categories_category_id: null,
          is_essential: false,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 23)),
          description: 'Loan principal payment',
          amount: 267_30,
          type: MYFIN.TRX_TYPES.TRANSFER,
          entities_entity_id: ENT_BANK1_ID,
          accounts_account_from_id: ACCOUNT_CURRENT1_ID,
          accounts_account_to_id: ACCOUNT_CREDIT2_MORTGAGE_ID,
          categories_category_id: CAT_LOAN_PAYMENTS_ID,
          is_essential: true,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 23)),
          description: 'Loan interest payment',
          amount: 176_50,
          type: MYFIN.TRX_TYPES.EXPENSE,
          entities_entity_id: ENT_BANK1_ID,
          accounts_account_from_id: ACCOUNT_CURRENT1_ID,
          accounts_account_to_id: null,
          categories_category_id: CAT_LOAN_INTEREST_ID,
          is_essential: true,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 25)),
          description: 'Grocery Shopping',
          amount: 301_87,
          type: MYFIN.TRX_TYPES.EXPENSE,
          entities_entity_id: ENT_SUPERMARKET1_ID,
          accounts_account_from_id: ACCOUNT_CREDIT1_ID,
          accounts_account_to_id: null,
          categories_category_id: CAT_GROCERIES_ID,
          is_essential: true,
        },
      })
    );

    // MONTH 4 (CURRENT)
    month = DateTimeUtils.getMonthNumberFromTimestamp();
    year = DateTimeUtils.getYearFromTimestamp();

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 2)),
          description: 'Grocery shopping',
          amount: 156_32,
          type: MYFIN.TRX_TYPES.EXPENSE,
          entities_entity_id: ENT_SUPERMARKET1_ID,
          accounts_account_from_id: ACCOUNT_CREDIT1_ID,
          accounts_account_to_id: null,
          categories_category_id: CAT_GROCERIES_ID,
          is_essential: true,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 7)),
          description: 'Card payment',
          amount: 527_14,
          type: MYFIN.TRX_TYPES.TRANSFER,
          entities_entity_id: ENT_BANK2_ID,
          accounts_account_from_id: ACCOUNT_CURRENT1_ID,
          accounts_account_to_id: ACCOUNT_CREDIT1_ID,
          categories_category_id: CAT_LOAN_PAYMENTS_ID,
          is_essential: true,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 18)),
          description: 'Grocery shopping',
          amount: 420_96,
          type: MYFIN.TRX_TYPES.EXPENSE,
          entities_entity_id: ENT_SUPERMARKET1_ID,
          accounts_account_from_id: ACCOUNT_CREDIT1_ID,
          accounts_account_to_id: null,
          categories_category_id: CAT_GROCERIES_ID,
          is_essential: true,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 19)),
          description: 'Going to the movies',
          amount: 32_64,
          type: MYFIN.TRX_TYPES.EXPENSE,
          entities_entity_id: ENT_CINEMA1,
          accounts_account_from_id: ACCOUNT_CREDIT1_ID,
          accounts_account_to_id: null,
          categories_category_id: CAT_ENTERTAINMENT_ID,
          is_essential: false,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 21)),
          description: 'Monthly wage',
          amount: 3500_00,
          type: MYFIN.TRX_TYPES.INCOME,
          entities_entity_id: ENT_COMPANY1_ID,
          accounts_account_from_id: null,
          accounts_account_to_id: ACCOUNT_CURRENT1_ID,
          categories_category_id: CAT_WAGES_ID,
          is_essential: false,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 23)),
          description: 'Loan principal payment',
          amount: 267_30,
          type: MYFIN.TRX_TYPES.TRANSFER,
          entities_entity_id: ENT_BANK1_ID,
          accounts_account_from_id: ACCOUNT_CURRENT1_ID,
          accounts_account_to_id: ACCOUNT_CREDIT2_MORTGAGE_ID,
          categories_category_id: CAT_LOAN_PAYMENTS_ID,
          is_essential: true,
        },
      })
    );

    promises.push(
      prismaTx.transactions.create({
        data: {
          date_timestamp: DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 25)),
          description: 'Grocery shopping',
          amount: 301_87,
          type: MYFIN.TRX_TYPES.EXPENSE,
          entities_entity_id: ENT_SUPERMARKET1_ID,
          accounts_account_from_id: ACCOUNT_CREDIT1_ID,
          accounts_account_to_id: null,
          categories_category_id: CAT_GROCERIES_ID,
          is_essential: true,
        },
      })
    );

    await Promise.all(promises);
  }, dbClient);

const createMockRules = async (userId: bigint, dbClient = undefined) =>
  performDatabaseRequest(async (prismaTx) => {
    const promises = [];

    promises.push(
      RuleService.createRule(
        userId,
        {
          users_user_id: userId,
          matcher_description_operator: MYFIN.RULES.OPERATOR.CONTAINS,
          matcher_description_value: 'wage',
          matcher_amount_operator: MYFIN.RULES.OPERATOR.EQUALS,
          matcher_amount_value: 3500_00,
          matcher_type_operator: MYFIN.RULES.OPERATOR.EQUALS,
          matcher_type_value: MYFIN.TRX_TYPES.INCOME,
          matcher_account_to_id_operator: MYFIN.RULES.OPERATOR.IGNORE,
          matcher_account_to_id_value: null,
          matcher_account_from_id_operator: MYFIN.RULES.OPERATOR.IGNORE,
          matcher_account_from_id_value: null,
          assign_category_id: CAT_WAGES_ID,
          assign_entity_id: ENT_COMPANY1_ID,
          assign_account_to_id: null,
          assign_account_from_id: null,
          assign_type: null,
          assign_is_essential: true,
        },
        prismaTx
      )
    );

    promises.push(
      RuleService.createRule(
        userId,
        {
          users_user_id: userId,
          matcher_description_operator: MYFIN.RULES.OPERATOR.CONTAINS,
          matcher_description_value: 'movies',
          matcher_amount_operator: MYFIN.RULES.OPERATOR.IGNORE,
          matcher_amount_value: 0,
          matcher_type_operator: MYFIN.RULES.OPERATOR.IGNORE,
          matcher_type_value: null,
          matcher_account_to_id_operator: MYFIN.RULES.OPERATOR.IGNORE,
          matcher_account_to_id_value: null,
          matcher_account_from_id_operator: MYFIN.RULES.OPERATOR.IGNORE,
          matcher_account_from_id_value: null,
          assign_category_id: CAT_ENTERTAINMENT_ID,
          assign_entity_id: ENT_CINEMA1,
          assign_account_to_id: null,
          assign_account_from_id: null,
          assign_type: null,
          assign_is_essential: false,
        },
        prismaTx
      )
    );

    await Promise.all(promises);
  }, dbClient);

const createMockAssets = async (userId: bigint, dbClient = undefined) =>
  performDatabaseRequest(async (prismaTx) => {
    const promises = [];

    promises.push(
      InvestAssetService.createAsset(
        userId,
        {
          name: 'High Yield Savings Acc',
          ticker: 'HYSA',
          units: 0,
          type: MYFIN.INVEST.ASSET_TYPE.FIXED_INCOME,
          broker: 'BBank',
        },
        prismaTx
      )
    );

    promises.push(
      InvestAssetService.createAsset(
        userId,
        {
          name: 'Emergency Fund',
          ticker: 'EF',
          units: 0,
          type: MYFIN.INVEST.ASSET_TYPE.FIXED_INCOME,
          broker: 'BBank',
        },
        prismaTx
      )
    );

    promises.push(
      InvestAssetService.createAsset(
        userId,
        {
          name: 'Bitcoin',
          ticker: 'BTC',
          units: 0,
          type: MYFIN.INVEST.ASSET_TYPE.CRYPTO,
          broker: 'Binance',
        },
        prismaTx
      )
    );

    promises.push(
      InvestAssetService.createAsset(
        userId,
        {
          name: 'Vanguard FTSE All-World UCITS ETF USD Acc',
          ticker: 'VWCE',
          units: 0,
          type: MYFIN.INVEST.ASSET_TYPE.ETF,
          broker: 'DEGIRO',
        },
        prismaTx
      )
    );

    const assets = await Promise.all(promises);
    ASSET_FIXED_INC1 = assets[0].asset_id;
    ASSET_FIXED_INC2 = assets[1].asset_id;
    ASSET_CRYPTO1 = assets[2].asset_id;
    ASSET_ETF1 = assets[3].asset_id;
  }, dbClient);

const createMockAssetTransactions = async (userId: bigint, dbClient = undefined) =>
  performDatabaseRequest(async (prismaTx) => {
    const month = DateTimeUtils.getMonthNumberFromTimestamp();
    const year = DateTimeUtils.getYearFromTimestamp();

    const promises = [];

    promises.push(
      InvestTransactionsService.createTransaction(
        userId,
        BigInt(ASSET_FIXED_INC1),
        DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 4)),
        'Initial investment',
        1500,
        1500,
        0,
        invest_transactions_type.B,
        prismaTx
      )
    );

    promises.push(
      InvestTransactionsService.createTransaction(
        userId,
        BigInt(ASSET_FIXED_INC2),
        DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 4)),
        'Initial investment',
        800,
        800,
        0,
        invest_transactions_type.B,
        prismaTx
      )
    );

    promises.push(
      InvestTransactionsService.createTransaction(
        userId,
        BigInt(ASSET_CRYPTO1),
        DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 11)),
        'Initial investment',
        12_350,
        0.5,
        0,
        invest_transactions_type.B,
        prismaTx
      )
    );

    promises.push(
      InvestTransactionsService.createTransaction(
        userId,
        BigInt(ASSET_FIXED_INC1),
        DateTimeUtils.getUnixTimestampFromDate(new Date(year, month - 1, 13)),
        'Yield',
        0,
        2.3,
        0,
        invest_transactions_type.B,
        prismaTx
      )
    );

    promises.push(
      InvestAssetService.updateCurrentAssetValue(userId, BigInt(ASSET_FIXED_INC1), 1502.3, prismaTx)
    );
    promises.push(
      InvestAssetService.updateCurrentAssetValue(userId, BigInt(ASSET_FIXED_INC2), 800, prismaTx)
    );
    promises.push(
      InvestAssetService.updateCurrentAssetValue(userId, BigInt(ASSET_ETF1), 510 + 32, prismaTx)
    );
    promises.push(
      InvestAssetService.updateCurrentAssetValue(
        userId,
        BigInt(ASSET_CRYPTO1),
        12350 - 1200,
        prismaTx
      )
    );
    await Promise.all(promises);
  }, dbClient);

const createMockBudgets = async (userId: bigint, dbClient = undefined) =>
  performDatabaseRequest(async (prismaTx) => {
    let promises = [];
    // Start adding budgets from 2 months ago
    let date = DateTimeUtils.decrementMonthByX(
      DateTimeUtils.getMonthNumberFromTimestamp(),
      DateTimeUtils.getYearFromTimestamp(),
      2
    );
    let month = date.month;
    let year = date.year;

    // MONTH 1
    let budget = await prismaTx.budgets.create({
      data: {
        month,
        year,
        observations: "🚘 Auto repair • 🎁 Hanna's birthday • 🐶 Pet training",
        is_open: false,
        users_user_id: userId,
      },
    });

    promises = [];
    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_ENTERTAINMENT_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 200_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_WAGES_ID,
          planned_amount_credit: 3500_00,
          planned_amount_debit: 0,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_LOAN_INTEREST_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 177_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_LOAN_PAYMENTS_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 270_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_AUTO_MAINTENANCE,
          planned_amount_credit: 0,
          planned_amount_debit: 20_00,
          current_amount: 0,
        },
      })
    );

    await Promise.all(promises);

    // MONTH 2
    date = DateTimeUtils.decrementMonthByX(
      DateTimeUtils.getMonthNumberFromTimestamp(),
      DateTimeUtils.getYearFromTimestamp(),
      1
    );
    month = date.month;
    year = date.year;

    budget = await prismaTx.budgets.create({
      data: {
        month,
        year,
        observations: "⛱️ Trip to Tenerife",
        is_open: false,
        users_user_id: userId,
      },
    });

    promises = [];
    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_ENTERTAINMENT_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 200_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_WAGES_ID,
          planned_amount_credit: 3500_00,
          planned_amount_debit: 0,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_LOAN_INTEREST_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 177_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_LOAN_PAYMENTS_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 270_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_GROCERIES_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 800_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_AUTO_MAINTENANCE,
          planned_amount_credit: 0,
          planned_amount_debit: 20_00,
          current_amount: 0,
        },
      })
    );

    await Promise.all(promises);

    // MONTH 3 (CURRENT)
    month = DateTimeUtils.getMonthNumberFromTimestamp();
    year = DateTimeUtils.getYearFromTimestamp();

    budget = await prismaTx.budgets.create({
      data: {
        month,
        year,
        observations: '🚘 Auto repair • 🎁 Hanna\'s birthday • 🐶 Pet training',
        is_open: true,
        users_user_id: userId,
      },
    });

    promises = [];
    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_ENTERTAINMENT_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 200_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_WAGES_ID,
          planned_amount_credit: 3500_00,
          planned_amount_debit: 0,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_LOAN_INTEREST_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 177_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_LOAN_PAYMENTS_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 270_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_GROCERIES_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 800_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_AUTO_MAINTENANCE,
          planned_amount_credit: 0,
          planned_amount_debit: 20_00,
          current_amount: 0,
        },
      })
    );

    await Promise.all(promises);

    // MONTH 4 (FUTURE)
    date = DateTimeUtils.incrementMonthByX(
      DateTimeUtils.getMonthNumberFromTimestamp(),
      DateTimeUtils.getYearFromTimestamp(),
      1
    )
    month = date.month;
    year = date.year;

    budget = await prismaTx.budgets.create({
      data: {
        month,
        year,
        observations: '💸🚘 Car Insurance',
        is_open: true,
        users_user_id: userId,
      },
    });

    promises = [];
    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_ENTERTAINMENT_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 200_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_WAGES_ID,
          planned_amount_credit: 3500_00,
          planned_amount_debit: 0,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_LOAN_INTEREST_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 177_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_LOAN_PAYMENTS_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 270_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_GROCERIES_ID,
          planned_amount_credit: 0,
          planned_amount_debit: 800_00,
          current_amount: 0,
        },
      })
    );

    promises.push(
      prismaTx.budgets_has_categories.create({
        data: {
          budgets_budget_id: budget.budget_id,
          budgets_users_user_id: userId,
          categories_category_id: CAT_AUTO_MAINTENANCE,
          planned_amount_credit: 0,
          planned_amount_debit: 20_00,
          current_amount: 0,
        },
      })
    );

    await Promise.all(promises);

  }, dbClient);

const createMockData = async (userId: bigint, dbClient = undefined) =>
  performDatabaseRequest(async (prismaTx) => {
    await deleteAllUserData(userId, prismaTx);

    // Create mock categories
    await createMockCategories(userId, prismaTx);

    // Create mock entities
    await createMockEntities(userId, prismaTx);

    // Create mock accounts
    await createMockAccounts(userId, prismaTx);

    // Create mock transactions
    await createMockTransactions(userId, prismaTx);

    // Create mock budgets
    await createMockBudgets(userId, prismaTx);

    // Create mock rules
    await createMockRules(userId, prismaTx);

    // Create mock investment assets
    await createMockAssets(userId, prismaTx);

    // Create mock investment transactions
    await createMockAssetTransactions(userId, prismaTx);

    const userAccounts = await AccountService.getAccountsForUser(userId, { account_id: true });
    for (const account of userAccounts) {
      const newBalance = await AccountService.recalculateBalanceForAccountIncrementally(
        account.account_id,
        0,
        DateTimeUtils.getCurrentUnixTimestamp() + 1,
        prismaTx
      );
      await AccountService.setNewAccountBalance(userId, account.account_id, newBalance, prismaTx);
    }
  }, dbClient);

export default {
  createMockData,
};
