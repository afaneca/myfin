<?php

class DemoDataManager
{
    // ACCOUNTS
    private static int $ACCOUNT_CURRENT1_ID = -1;
    private static int $ACCOUNT_SAVINGS1_ID = -1;
    private static int $ACCOUNT_CREDIT1_ID = -1;
    private static int $ACCOUNT_CREDIT2_MORTGAGE_ID = -1;
    private static int $ACCOUNT_INVEST1_ID = -1;

    // CATEGORIES
    private static int $CAT_HOME_REPAIRS_ID = -1;
    private static int $CAT_WAGES_ID = -1;
    private static int $CAT_GROCERIES_ID = -1;
    private static int $CAT_REIMBURSABLE_ID = -1;
    private static int $CAT_UTILITIES_ID = -1;
    private static int $CAT_LOAN_PAYMENTS_ID = -1;
    private static int $CAT_LOAN_INTEREST_ID = -1;
    private static int $CAT_ENTERTAINMENT_ID = -1;
    private static int $CAT_AUTO_MAINTENANCE = -1;

    // ENTITIES
    private static int $ENT_SUPERMARKET1_ID = -1;
    private static int $ENT_COMPANY1_ID = -1;
    private static int $ENT_STORE1_ID = -1;
    private static int $ENT_STORE2_ID = -1;
    private static int $ENT_RESTAURANT1_ID = -1;
    private static int $ENT_RESTAURANT2_ID = -1;
    private static int $ENT_CINEMA1 = -1;
    private static int $ENT_BANK1_ID = -1;
    private static int $ENT_BANK2_ID = -1;

    // ASSETS
    private static int $ASSET_FIXED_INC1 = -1;

    private static int $ASSET_FIXED_INC2 = -1;
    private static int $ASSET_ETF1 = -1;
    private static int $ASSET_CRYPTO1 = -1;


    public static function createMockData($userID, $transactional = false): void
    {
        DemoDataManager::deleteAllUserData($userID, $transactional);


        // Create mock categories
        DemoDataManager::createMockCategories($userID, $transactional);

        // Create mock entities
        DemoDataManager::createMockEntities($userID, $transactional);

        // Create mock accounts
        DemoDataManager::createMockAccounts($userID, $transactional);

        // Create mock transactions
        DemoDataManager::createMockTransactions($userID, $transactional);

        // Create mock budgets
        DemoDataManager::createMockBudgets($userID, $transactional);
        // Create mock investment rules
        DemoDataManager::createMockRules($userID, $transactional);
        // Create mock investment assets
        DemoDataManager::createMockAssets($userID, $transactional);
        // Create mock investment transactions - TODO

        $userAccounts = AccountModel::getWhere(["users_user_id" => $userID], ["account_id"]);


        foreach ($userAccounts as $account) {
            AccountModel::setNewAccountBalance($account["account_id"],
                AccountModel::recalculateBalanceForAccountIncrementally($account["account_id"], 0, time() + 1, false),
                $transactional);
        }
    }

    private static function deleteAllUserData($userID, $transactional): void
    {
        // DELETE ALL CURRENT BUDGETS
        BudgetHasCategoriesModel::delete(["budgets_users_user_id" => $userID], $transactional);
        BudgetModel::delete([
            "users_user_id" => $userID,
        ], $transactional);

        // DELETE ALL CURRENT TRANSACTIONS
        TransactionModel::removeAllTransactionsFromUser($userID, $transactional);

        // DELETE ALL CURRENT CATEGORIES
        CategoryModel::delete([
            "users_user_id" => $userID,
        ], $transactional);

        // DELETE ALL CURRENT ENTITIES
        EntityModel::delete([
            "users_user_id" => $userID,
        ], $transactional);

        // DELETE ALL CURRENT ACCOUNTS
        AccountModel::removeBalanceSnapshotsForUser($userID, $transactional);
        AccountModel::delete([
            "users_user_id" => $userID,
        ], $transactional);

        // DELETE ALL CURRENT RULES
        RuleModel::delete([
            "users_user_id" => $userID,
        ], $transactional);

        // DELETE ALL CURRENT INVESTMENT ASSETS
        InvestAssetModel::delete([
            "users_user_id" => $userID,
        ], $transactional);
        InvestAssetEvoSnapshotModel::removeAllForUser($userID, $transactional);

        // DELETE ALL CURRENT INVESTMENT TRANSACTIONS
        InvestTransactionModel::removeAllForUser($userID, $transactional);
    }

    private static function createMockCategories($userId, $transactional = false): void
    {

        // CAT 1
        self::$CAT_HOME_REPAIRS_ID = CategoryModel::createCategory(
            $userId,
            "Home Repairs 🧰",
            "Home maintenance & repais",
            Utils::getRandomColorGradient(),
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            0,
            $transactional
        );

        // CAT 2
        self::$CAT_WAGES_ID = CategoryModel::createCategory(
            $userId,
            "Wages 💼",
            "Job salaries & related comp",
            Utils::getRandomColorGradient(),
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            0,
            $transactional
        );
        // CAT 3
        self::$CAT_GROCERIES_ID = CategoryModel::createCategory(
            $userId,
            "Groceries 🛒",
            "",
            Utils::getRandomColorGradient(),
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            0,
            $transactional
        );

        // CAT 4
        self::$CAT_REIMBURSABLE_ID = CategoryModel::createCategory(
            $userId,
            "Reimbursable 💫",
            "Minor loans to family & friends and other reimbursable expenses",
            Utils::getRandomColorGradient(),
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            1,
            $transactional
        );

        // CAT 5
        self::$CAT_UTILITIES_ID = CategoryModel::createCategory(
            $userId,
            "Utilities 💧⚡📺",
            "Water, electricity, tv & related bills",
            Utils::getRandomColorGradient(),
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            0,
            $transactional
        );

        // CAT 6
        self::$CAT_LOAN_PAYMENTS_ID = CategoryModel::createCategory(
            $userId,
            "Loan Payments 💸",
            "Principal payments related to loans",
            Utils::getRandomColorGradient(),
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            0,
            $transactional
        );

        // CAT 7
        self::$CAT_LOAN_INTEREST_ID = CategoryModel::createCategory(
            $userId,
            "Loan Interest 🧾",
            "Loans interest & other banking expenses",
            Utils::getRandomColorGradient(),
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            0,
            $transactional
        );

        // CAT 8
        self::$CAT_ENTERTAINMENT_ID = CategoryModel::createCategory(
            $userId,
            "Entertainment & Eating Out 🍿",
            "Eating out, going to the movies, etc...",
            Utils::getRandomColorGradient(),
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            0,
            $transactional
        );

        // CAT 9
        self::$CAT_AUTO_MAINTENANCE = CategoryModel::createCategory(
            $userId,
            "Auto Maintenance 🚗",
            "Car repairs, upgrades, etc...",
            Utils::getRandomColorGradient(),
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            0,
            $transactional
        );

        // CAT EXTRA
        CategoryModel::createCategory(
            $userId,
            "Some other category",
            "",
            Utils::getRandomColorGradient(),
            DEFAULT_CATEGORY_INACTIVE_STATUS,
            0,
            $transactional
        );
    }

    private static function createMockEntities($userId, $transactional = false): void
    {
        self::$ENT_SUPERMARKET1_ID = EntityModel::createEntity($userId, "ABC Supermarket", $transactional);

        self::$ENT_COMPANY1_ID = EntityModel::createEntity($userId, "Best Company", $transactional);
        self::$ENT_STORE1_ID = EntityModel::createEntity($userId, "XYZ Store", $transactional);
        self::$ENT_STORE2_ID = EntityModel::createEntity($userId, "QUERTY Store", $transactional);
        self::$ENT_RESTAURANT1_ID = EntityModel::createEntity($userId, "Chow's Restaurant", $transactional);
        self::$ENT_BANK1_ID = EntityModel::createEntity($userId, "HQ Mutual", $transactional);
        self::$ENT_RESTAURANT2_ID = EntityModel::createEntity($userId, "DeliCely Restaurant", $transactional);
        self::$ENT_CINEMA1 = EntityModel::createEntity($userId, "Popcorn World", $transactional);
        self::$ENT_BANK2_ID = EntityModel::createEntity($userId, "BBank", $transactional);
    }

    private static function createMockAccounts($userId, $transactional = false): void
    {

        // ACC 1
        self::$ACCOUNT_CURRENT1_ID = AccountModel::createAccount(
            $userId,
            "BBank - Current",
            "Current account from BBank",
            DEFAULT_ACCOUNT_TYPE_CURRENT_ACCOUNT,
            0,
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            Utils::getRandomColorGradient(),
            $transactional
        );

        // ACC 2
        self::$ACCOUNT_SAVINGS1_ID = AccountModel::createAccount(
            $userId,
            "BBank - Savings",
            "Savings account from BBank",
            DEFAULT_ACCOUNT_TYPE_SAVINGS_ACCOUNT,
            0,
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            Utils::getRandomColorGradient(),
            $transactional
        );

        // ACC 3
        self::$ACCOUNT_INVEST1_ID = AccountModel::createAccount(
            $userId,
            "XYZ Capital",
            "Brokerage account from XYZ Capital",
            DEFAULT_ACCOUNT_TYPE_INVESTMENT_ACCOUNT,
            0,
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            Utils::getRandomColorGradient(),
            $transactional
        );

        // ACC 4
        self::$ACCOUNT_CREDIT1_ID = AccountModel::createAccount(
            $userId,
            "SAFU Credit",
            "Credit card from SAFU Credit",
            DEFAULT_ACCOUNT_TYPE_CREDIT_ACCOUNT,
            1,
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            Utils::getRandomColorGradient(),
            $transactional
        );

        // ACC 5
        self::$ACCOUNT_CREDIT2_MORTGAGE_ID = AccountModel::createAccount(
            $userId,
            "HQ Mutual",
            "Mortgage loan from HQ Mutual",
            DEFAULT_ACCOUNT_TYPE_CREDIT_ACCOUNT,
            1,
            DEFAULT_CATEGORY_ACTIVE_STATUS,
            Utils::getRandomColorGradient(),
            $transactional
        );
    }

    private static function createMockTransactions($userID, mixed $transactional = false): void
    {
        // Start adding transactions from 3 months ago

        // MONTH 0
        $time = strtotime("-3 months");
        $month = date("m", $time);
        $year = date("Y", $time);

        TransactionModel::insert([
            "date_timestamp" => strtotime("25-$month-$year"),
            "description" => "Initial balance",
            "amount" => 5_000_00,
            "type" => DEFAULT_TYPE_INCOME_TAG,
            "entities_entity_id" => self::$ENT_BANK1_ID,
            "accounts_account_from_id" => null,
            "accounts_account_to_id" => self::$ACCOUNT_CURRENT1_ID,
            "categories_category_id" => null,
            "is_essential" => 0,
        ], $transactional);

        // MONTH 1
        $time = strtotime("-2 months");
        $month = date("m", $time);
        $year = date("Y", $time);

        TransactionModel::insert([
            "date_timestamp" => strtotime("02-$month-$year"),
            "amount" => 300_000_00,
            "type" => DEFAULT_TYPE_EXPENSE_TAG,
            "entities_entity_id" => self::$ENT_BANK1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CREDIT2_MORTGAGE_ID,
            "accounts_account_to_id" => null,
            "categories_category_id" => self::$CAT_HOME_REPAIRS_ID,
            "is_essential" => 0,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("03-$month-$year"),
            "description" => "Savings",
            "amount" => 2_000_00,
            "type" => DEFAULT_TYPE_TRANSFER_TAG,
            "entities_entity_id" => self::$ENT_BANK1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CURRENT1_ID,
            "accounts_account_to_id" => self::$ACCOUNT_SAVINGS1_ID,
            "categories_category_id" => null,
            "is_essential" => 0,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("03-$month-$year"),
            "description" => "Eating out",
            "amount" => 89_60,
            "type" => DEFAULT_TYPE_EXPENSE_TAG,
            "entities_entity_id" => self::$ENT_BANK1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CREDIT1_ID,
            "accounts_account_to_id" => null,
            "categories_category_id" => self::$CAT_ENTERTAINMENT_ID,
            "is_essential" => 0,
        ], $transactional);

        // MONTH 2
        $time = strtotime("-1 months");
        $month = date("m", $time);
        $year = date("Y", $time);

        TransactionModel::insert([
            "date_timestamp" => strtotime("05-$month-$year"),
            "description" => "Grocery shopping",
            "amount" => 135_67,
            "type" => DEFAULT_TYPE_EXPENSE_TAG,
            "entities_entity_id" => self::$ENT_SUPERMARKET1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CREDIT1_ID,
            "accounts_account_to_id" => null,
            "categories_category_id" => self::$CAT_GROCERIES_ID,
            "is_essential" => 1,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("21-$month-$year"),
            "description" => "Monthly wage",
            "amount" => 3500_00,
            "type" => DEFAULT_TYPE_INCOME_TAG,
            "entities_entity_id" => self::$ENT_COMPANY1_ID,
            "accounts_account_from_id" => null,
            "accounts_account_to_id" => self::$ACCOUNT_CURRENT1_ID,
            "categories_category_id" => self::$CAT_WAGES_ID,
            "is_essential" => 0,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("21-$month-$year"),
            "description" => "Savings increase",
            "amount" => 500_00,
            "type" => DEFAULT_TYPE_TRANSFER_TAG,
            "entities_entity_id" => self::$ENT_BANK1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CURRENT1_ID,
            "accounts_account_to_id" => self::$ACCOUNT_SAVINGS1_ID,
            "categories_category_id" => null,
            "is_essential" => 0,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("23-$month-$year"),
            "description" => "Loan principal payment",
            "amount" => 267_30,
            "type" => DEFAULT_TYPE_TRANSFER_TAG,
            "entities_entity_id" => self::$ENT_BANK1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CURRENT1_ID,
            "accounts_account_to_id" => self::$ACCOUNT_CREDIT2_MORTGAGE_ID,
            "categories_category_id" => self::$CAT_LOAN_PAYMENTS_ID,
            "is_essential" => 1,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("25-$month-$year"),
            "description" => "Grocery shopping",
            "amount" => 301_87,
            "type" => DEFAULT_TYPE_EXPENSE_TAG,
            "entities_entity_id" => self::$ENT_SUPERMARKET1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CREDIT1_ID,
            "accounts_account_to_id" => null,
            "categories_category_id" => self::$CAT_GROCERIES_ID,
            "is_essential" => 1,
        ], $transactional);


        TransactionModel::insert([
            "date_timestamp" => strtotime("23-$month-$year"),
            "description" => "Loan interest payment",
            "amount" => 176_50,
            "type" => DEFAULT_TYPE_EXPENSE_TAG,
            "entities_entity_id" => self::$ENT_BANK1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CURRENT1_ID,
            "accounts_account_to_id" => null,
            "categories_category_id" => self::$CAT_LOAN_INTEREST_ID,
            "is_essential" => 1,
        ], $transactional);

        // MONTH 3 (CURRENT)
        $time = time();
        $month = date("m", $time);
        $year = date("Y", $time);

        TransactionModel::insert([
            "date_timestamp" => strtotime("02-$month-$year"),
            "description" => "Grocery shopping",
            "amount" => 156_32,
            "type" => DEFAULT_TYPE_EXPENSE_TAG,
            "entities_entity_id" => self::$ENT_SUPERMARKET1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CREDIT1_ID,
            "accounts_account_to_id" => null,
            "categories_category_id" => self::$CAT_GROCERIES_ID,
            "is_essential" => 1,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("07-$month-$year"),
            "description" => "Card payment",
            "amount" => 527_14,
            "type" => DEFAULT_TYPE_TRANSFER_TAG,
            "entities_entity_id" => self::$ENT_BANK2_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CURRENT1_ID,
            "accounts_account_to_id" => self::$ACCOUNT_CREDIT1_ID,
            "categories_category_id" => self::$CAT_LOAN_PAYMENTS_ID,
            "is_essential" => 1,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("18-$month-$year"),
            "description" => "Grocery shopping",
            "amount" => 420_96,
            "type" => DEFAULT_TYPE_EXPENSE_TAG,
            "entities_entity_id" => self::$ENT_SUPERMARKET1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CREDIT1_ID,
            "accounts_account_to_id" => null,
            "categories_category_id" => self::$CAT_GROCERIES_ID,
            "is_essential" => 1,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("19-$month-$year"),
            "description" => "Going to the movies",
            "amount" => 32_64,
            "type" => DEFAULT_TYPE_EXPENSE_TAG,
            "entities_entity_id" => self::$ENT_CINEMA1,
            "accounts_account_from_id" => self::$ACCOUNT_CREDIT1_ID,
            "accounts_account_to_id" => null,
            "categories_category_id" => self::$CAT_ENTERTAINMENT_ID,
            "is_essential" => 1,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("21-$month-$year"),
            "description" => "Monthly wage",
            "amount" => 3500_00,
            "type" => DEFAULT_TYPE_INCOME_TAG,
            "entities_entity_id" => self::$ENT_COMPANY1_ID,
            "accounts_account_from_id" => null,
            "accounts_account_to_id" => self::$ACCOUNT_CURRENT1_ID,
            "categories_category_id" => self::$CAT_WAGES_ID,
            "is_essential" => 0,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("23-$month-$year"),
            "description" => "Loan principal payment",
            "amount" => 267_30,
            "type" => DEFAULT_TYPE_TRANSFER_TAG,
            "entities_entity_id" => self::$ENT_BANK1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CURRENT1_ID,
            "accounts_account_to_id" => self::$ACCOUNT_CREDIT2_MORTGAGE_ID,
            "categories_category_id" => self::$CAT_LOAN_PAYMENTS_ID,
            "is_essential" => 1,
        ], $transactional);

        TransactionModel::insert([
            "date_timestamp" => strtotime("25-$month-$year"),
            "description" => "Grocery shopping",
            "amount" => 301_87,
            "type" => DEFAULT_TYPE_EXPENSE_TAG,
            "entities_entity_id" => self::$ENT_SUPERMARKET1_ID,
            "accounts_account_from_id" => self::$ACCOUNT_CREDIT1_ID,
            "accounts_account_to_id" => null,
            "categories_category_id" => self::$CAT_GROCERIES_ID,
            "is_essential" => 1,
        ], $transactional);
    }

    private static function createMockBudgets($userId, $transactional = false): void
    {
        // Start adding transactions from 2 months ago

        // MONTH 1
        $time = strtotime("-2 months");
        $month = date("m", $time);
        $year = date("Y", $time);
        $observations = "🚘 Auto repair • 🎁 Hanna's birthday • 🐶 Pet training";
        $budgetId = BudgetModel::insert([
            "month" => $month,
            "year" => $year,
            "observations" => $observations,
            "is_open" => 0,
            "users_user_id" => $userId
        ], $transactional);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_ENTERTAINMENT_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 200_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_WAGES_ID,
            "planned_amount_credit" => 3500_00,
            "planned_amount_debit" => 0,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_LOAN_INTEREST_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 177_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_LOAN_PAYMENTS_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 270_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_GROCERIES_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 800_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_AUTO_MAINTENANCE,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 20_00,
            "current_amount" => 0,
        ]);

        // MONTH 2
        $time = strtotime("-1 months");
        $month = date("m", $time);
        $year = date("Y", $time);
        $observations = "⛱️ Trip to Tenerife";
        $budgetId = BudgetModel::insert([
            "month" => $month,
            "year" => $year,
            "observations" => $observations,
            "is_open" => 0,
            "users_user_id" => $userId
        ], $transactional);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_ENTERTAINMENT_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 200_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_WAGES_ID,
            "planned_amount_credit" => 3500_00,
            "planned_amount_debit" => 0,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_LOAN_INTEREST_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 177_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_LOAN_PAYMENTS_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 270_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_GROCERIES_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 800_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_AUTO_MAINTENANCE,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 20_00,
            "current_amount" => 0,
        ]);

        // MONTH 3 (CURRENT)
        $time = time();
        $month = date("m", $time);
        $year = date("Y", $time);
        $observations = "🚘 Auto repair • 🎁 Hanna's birthday • 🐶 Pet training";
        $budgetId = BudgetModel::insert([
            "month" => $month,
            "year" => $year,
            "observations" => $observations,
            "is_open" => 1,
            "users_user_id" => $userId
        ], $transactional);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_ENTERTAINMENT_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 200_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_WAGES_ID,
            "planned_amount_credit" => 3500_00,
            "planned_amount_debit" => 0,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_LOAN_INTEREST_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 177_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_LOAN_PAYMENTS_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 270_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_GROCERIES_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 800_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_AUTO_MAINTENANCE,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 20_00,
            "current_amount" => 0,
        ]);

        // MONTH 4 (FUTURE)
        $time = strtotime("+1 months");
        $month = date("m", $time);
        $year = date("Y", $time);
        $observations = "💸🚘 Car Insurance";
        $budgetId = BudgetModel::insert([
            "month" => $month,
            "year" => $year,
            "observations" => $observations,
            "is_open" => 1,
            "users_user_id" => $userId
        ], $transactional);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_ENTERTAINMENT_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 200_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_WAGES_ID,
            "planned_amount_credit" => 3500_00,
            "planned_amount_debit" => 0,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_LOAN_INTEREST_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 177_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_LOAN_PAYMENTS_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 270_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_GROCERIES_ID,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 800_00,
            "current_amount" => 0,
        ]);

        BudgetHasCategoriesModel::insert([
            "budgets_budget_id" => $budgetId,
            "budgets_users_user_id" => $userId,
            "categories_category_id" => self::$CAT_AUTO_MAINTENANCE,
            "planned_amount_credit" => 0,
            "planned_amount_debit" => 20_00,
            "current_amount" => 0,
        ]);
    }

    private static function createMockRules($userId, $transactional = false): void
    {
        RuleModel::insert(
            ["users_user_id" => $userId,
                "matcher_description_operator" => DEFAULT_RULES_OPERATOR_CONTAINS,
                "matcher_description_value" => "wage",
                "matcher_amount_operator" => DEFAULT_RULES_OPERATOR_EQUALS,
                "matcher_amount_value" => 3500_00,
                "matcher_type_operator" => DEFAULT_RULES_OPERATOR_EQUALS,
                "matcher_type_value" => DEFAULT_TYPE_INCOME_TAG,
                "matcher_account_to_id_operator" => DEFAULT_RULES_OPERATOR_IGNORE,
                "matcher_account_to_id_value" => null,
                "matcher_account_from_id_operator" => DEFAULT_RULES_OPERATOR_IGNORE,
                "matcher_account_from_id_value" => null,
                "assign_category_id" => self::$CAT_WAGES_ID,
                "assign_entity_id" => self::$ENT_COMPANY1_ID,
                "assign_account_to_id" => null,
                "assign_account_from_id" => null,
                "assign_type" => null,
                "assign_is_essential" => 0,
            ], $transactional
        );

        RuleModel::insert(
            ["users_user_id" => $userId,
                "matcher_description_operator" => DEFAULT_RULES_OPERATOR_CONTAINS,
                "matcher_description_value" => "movies",
                "matcher_amount_operator" => DEFAULT_RULES_OPERATOR_IGNORE,
                "matcher_amount_value" => 0,
                "matcher_type_operator" => DEFAULT_RULES_OPERATOR_IGNORE,
                "matcher_type_value" => null,
                "matcher_account_to_id_operator" => DEFAULT_RULES_OPERATOR_IGNORE,
                "matcher_account_to_id_value" => null,
                "matcher_account_from_id_operator" => DEFAULT_RULES_OPERATOR_IGNORE,
                "matcher_account_from_id_value" => null,
                "assign_category_id" => self::$CAT_ENTERTAINMENT_ID,
                "assign_entity_id" => self::$ENT_CINEMA1,
                "assign_account_to_id" => null,
                "assign_account_from_id" => null,
                "assign_type" => null,
                "assign_is_essential" => 0,
            ], $transactional
        );
    }

    private static function createMockAssets($userId, $transactional = false): void
    {
        self::$ASSET_FIXED_INC1 = InvestAssetModel::insert([
            "name" => "High Yield Savings Acc",
            "ticker" => "HYSA",
            "units" => 0,
            "type" => DEFAULT_ASSETS_TYPE_FIXED_INCOME,
            "broker" => "BBank",
            "users_user_id" => $userId,
            "created_at" => strtotime("-3 months"),
            "updated_at" => strtotime("-3 months"),
        ], $transactional);

        self::$ASSET_FIXED_INC2 = InvestAssetModel::insert([
            "name" => "Emergency Fund",
            "ticker" => "EF",
            "units" => 0,
            "type" => DEFAULT_ASSETS_TYPE_FIXED_INCOME,
            "broker" => "BBank",
            "users_user_id" => $userId,
            "created_at" => strtotime("-3 months"),
            "updated_at" => strtotime("-3 months"),
        ], $transactional);

        self::$ASSET_CRYPTO1 = InvestAssetModel::insert([
            "name" => "Bitcoin",
            "ticker" => "BTC",
            "units" => 0,
            "type" => DEFAULT_ASSETS_TYPE_CRYPTO,
            "broker" => "Binance",
            "users_user_id" => $userId,
            "created_at" => strtotime("-3 months"),
            "updated_at" => strtotime("-3 months"),
        ], $transactional);

        self::$ASSET_ETF1 = InvestAssetModel::insert([
            "name" => "Vanguard FTSE All-World UCITS ETF USD Acc",
            "ticker" => "VWCE",
            "units" => 0,
            "type" => DEFAULT_ASSETS_TYPE_ETF,
            "broker" => "DEGIRO",
            "users_user_id" => $userId,
            "created_at" => strtotime("-3 months"),
            "updated_at" => strtotime("-3 months"),
        ], $transactional);
    }
}