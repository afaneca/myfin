-- CreateTable
CREATE TABLE `accounts` (
    `account_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `type` VARCHAR(45) NOT NULL,
    `description` LONGTEXT NULL,
    `exclude_from_budgets` BOOLEAN NOT NULL,
    `status` VARCHAR(45) NOT NULL,
    `users_user_id` BIGINT NOT NULL,
    `current_balance` BIGINT NULL DEFAULT 0,
    `created_timestamp` BIGINT NULL,
    `updated_timestamp` BIGINT NULL,
    `color_gradient` VARCHAR(45) NULL,

    UNIQUE INDEX `account_id_UNIQUE`(`account_id`),
    INDEX `fk_accounts_users1_idx`(`users_user_id`),
    UNIQUE INDEX `name_UNIQUE`(`name`, `users_user_id`),
    PRIMARY KEY (`account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `balances` (
    `balance_id` BIGINT NOT NULL AUTO_INCREMENT,
    `date_timestamp` BIGINT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `accounts_account_id` BIGINT NOT NULL,

    INDEX `fk_balances_accounts1_idx`(`accounts_account_id`),
    PRIMARY KEY (`balance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `balances_snapshot` (
    `accounts_account_id` BIGINT NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `balance` BIGINT NOT NULL DEFAULT 0,
    `created_timestamp` BIGINT NOT NULL,
    `updated_timestamp` BIGINT NULL,

    INDEX `fk_balances_snapshot_accounts1_idx`(`accounts_account_id`),
    PRIMARY KEY (`accounts_account_id`, `month`, `year`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budgets` (
    `budget_id` BIGINT NOT NULL AUTO_INCREMENT,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `observations` LONGTEXT NULL,
    `is_open` BOOLEAN NOT NULL,
    `initial_balance` BIGINT NULL,
    `users_user_id` BIGINT NOT NULL,

    UNIQUE INDEX `budget_id_UNIQUE`(`budget_id`),
    INDEX `fk_budgets_users1_idx`(`users_user_id`),
    UNIQUE INDEX `uq_month_year_user`(`month`, `year`, `users_user_id`),
    PRIMARY KEY (`budget_id`, `users_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budgets_has_categories` (
    `budgets_budget_id` BIGINT NOT NULL,
    `budgets_users_user_id` BIGINT NOT NULL,
    `categories_category_id` BIGINT NOT NULL,
    `planned_amount_credit` BIGINT NOT NULL DEFAULT 0,
    `current_amount` BIGINT NOT NULL DEFAULT 0,
    `planned_amount_debit` BIGINT NOT NULL DEFAULT 0,

    INDEX `fk_budgets_has_categories_budgets1_idx`(`budgets_budget_id`, `budgets_users_user_id`),
    INDEX `fk_budgets_has_categories_categories1_idx`(`categories_category_id`),
    PRIMARY KEY (`budgets_budget_id`, `budgets_users_user_id`, `categories_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `category_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `type` CHAR(1) NOT NULL,
    `users_user_id` BIGINT NOT NULL,
    `description` LONGTEXT NULL,
    `color_gradient` VARCHAR(45) NULL,
    `status` VARCHAR(45) NOT NULL DEFAULT 'Ativa',
    `exclude_from_budgets` TINYINT NOT NULL DEFAULT 0,

    INDEX `fk_category_users_idx`(`users_user_id`),
    UNIQUE INDEX `uq_name_type_user_id`(`users_user_id`, `type`, `name`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entities` (
    `entity_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `users_user_id` BIGINT NOT NULL,

    UNIQUE INDEX `entity_id_UNIQUE`(`entity_id`),
    INDEX `fk_entities_users1_idx`(`users_user_id`),
    INDEX `name`(`name`),
    UNIQUE INDEX `name_UNIQUE`(`name`, `users_user_id`),
    PRIMARY KEY (`entity_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invest_asset_evo_snapshot` (
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `units` DECIMAL(16, 6) NOT NULL,
    `invested_amount` BIGINT NOT NULL,
    `current_value` BIGINT NOT NULL,
    `invest_assets_asset_id` BIGINT NOT NULL,
    `created_at` BIGINT NOT NULL,
    `updated_at` BIGINT NOT NULL,
    `withdrawn_amount` BIGINT NOT NULL,

    INDEX `fk_invest_asset_evo_snapshot_invest_assets1_idx`(`invest_assets_asset_id`),
    UNIQUE INDEX `uq_month_year_invest_assets_asset_id`(`month`, `year`, `invest_assets_asset_id`),
    PRIMARY KEY (`month`, `year`, `invest_assets_asset_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invest_assets` (
    `asset_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(75) NOT NULL,
    `ticker` VARCHAR(45) NULL,
    `units` DECIMAL(16, 6) NOT NULL,
    `type` VARCHAR(75) NOT NULL,
    `broker` VARCHAR(45) NULL,
    `created_at` BIGINT NOT NULL,
    `updated_at` BIGINT NULL,
    `users_user_id` BIGINT NOT NULL,

    UNIQUE INDEX `asset_id_UNIQUE`(`asset_id`),
    INDEX `fk_invest_assets_users1_idx`(`users_user_id`),
    UNIQUE INDEX `users_user_id_type_name_unique`(`name`, `type`, `users_user_id`),
    PRIMARY KEY (`asset_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invest_desired_allocations` (
    `desired_allocations_id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(75) NOT NULL,
    `alloc_percentage` FLOAT NULL,
    `users_user_id` BIGINT NOT NULL,

    UNIQUE INDEX `desired_allocations_id_UNIQUE`(`desired_allocations_id`),
    UNIQUE INDEX `type_UNIQUE`(`type`),
    INDEX `fk_invest_desired_allocations_users1_idx`(`users_user_id`),
    PRIMARY KEY (`desired_allocations_id`, `type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invest_transactions` (
    `transaction_id` BIGINT NOT NULL AUTO_INCREMENT,
    `date_timestamp` BIGINT NOT NULL,
    `type` ENUM('B', 'S') NOT NULL,
    `note` VARCHAR(100) NULL,
    `total_price` BIGINT NOT NULL,
    `units` DECIMAL(16, 6) NOT NULL,
    `fees_taxes` BIGINT NULL DEFAULT 0,
    `invest_assets_asset_id` BIGINT NOT NULL,
    `created_at` BIGINT NOT NULL,
    `updated_at` BIGINT NOT NULL,

    UNIQUE INDEX `transaction_id_UNIQUE`(`transaction_id`),
    INDEX `fk_invest_transactions_invest_assets1_idx`(`invest_assets_asset_id`),
    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rules` (
    `rule_id` BIGINT NOT NULL AUTO_INCREMENT,
    `matcher_description_operator` VARCHAR(45) NULL,
    `matcher_description_value` VARCHAR(45) NULL,
    `matcher_amount_operator` VARCHAR(45) NULL,
    `matcher_amount_value` BIGINT NULL,
    `matcher_type_operator` VARCHAR(45) NULL,
    `matcher_type_value` VARCHAR(45) NULL,
    `matcher_account_to_id_operator` VARCHAR(45) NULL,
    `matcher_account_to_id_value` BIGINT NULL,
    `matcher_account_from_id_operator` VARCHAR(45) NULL,
    `matcher_account_from_id_value` BIGINT NULL,
    `assign_category_id` BIGINT NULL,
    `assign_entity_id` BIGINT NULL,
    `assign_account_to_id` BIGINT NULL,
    `assign_account_from_id` BIGINT NULL,
    `assign_type` VARCHAR(45) NULL,
    `users_user_id` BIGINT NOT NULL,
    `assign_is_essential` BOOLEAN NOT NULL DEFAULT false,

    INDEX `fk_rules_users1_idx`(`users_user_id`),
    PRIMARY KEY (`rule_id`, `users_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `transaction_id` BIGINT NOT NULL AUTO_INCREMENT,
    `date_timestamp` BIGINT NOT NULL,
    `amount` BIGINT NOT NULL,
    `type` CHAR(1) NOT NULL,
    `description` LONGTEXT NULL,
    `entities_entity_id` INTEGER NULL,
    `accounts_account_from_id` BIGINT NULL,
    `accounts_account_to_id` BIGINT NULL,
    `categories_category_id` BIGINT NULL,
    `is_essential` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `transaction_id_UNIQUE`(`transaction_id`),
    INDEX `fk_transactions_accounts1_idx`(`accounts_account_from_id`),
    INDEX `fk_transactions_categories1_idx`(`categories_category_id`),
    INDEX `fk_transactions_entities2_idx`(`entities_entity_id`),
    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(45) NOT NULL,
    `password` MEDIUMTEXT NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `sessionkey` MEDIUMTEXT NULL,
    `sessionkey_mobile` MEDIUMTEXT NULL,
    `trustlimit` INTEGER NULL,
    `trustlimit_mobile` INTEGER NULL,
    `last_update_timestamp` BIGINT NOT NULL DEFAULT 0,

    UNIQUE INDEX `username_UNIQUE`(`username`),
    UNIQUE INDEX `email_UNIQUE`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`entities_entity_id`) REFERENCES `entities`(`entity_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`categories_category_id`) REFERENCES `categories`(`category_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

