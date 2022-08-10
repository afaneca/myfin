-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema myfin
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema myfin
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `myfin` DEFAULT CHARACTER SET utf8 ;
-- -----------------------------------------------------
-- Schema myfin_prod
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema myfin_prod
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `myfin_prod` DEFAULT CHARACTER SET utf8mb4 ;
USE `myfin` ;

-- -----------------------------------------------------
-- Table `myfin`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`users` (
                                               `user_id` BIGINT NOT NULL AUTO_INCREMENT,
                                               `username` VARCHAR(45) NOT NULL,
                                               `password` TEXT(128) NOT NULL,
                                               `email` VARCHAR(45) NOT NULL,
                                               `sessionkey` TEXT(128) NULL,
                                               `sessionkey_mobile` TEXT(128) NULL,
                                               `trustlimit` INT NULL,
                                               `trustlimit_mobile` INT NULL,
                                               `last_update_timestamp` BIGINT NULL DEFAULT 0,
                                               PRIMARY KEY (`user_id`),
                                               UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE,
                                               UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`categories` (
                                                    `category_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                    `name` VARCHAR(255) NOT NULL,
                                                    `type` CHAR NOT NULL,
                                                    `users_user_id` BIGINT NOT NULL,
                                                    `description` MEDIUMTEXT NULL DEFAULT NULL,
                                                    `color_gradient` VARCHAR(45) NULL DEFAULT NULL,
                                                    `status` VARCHAR(45) NULL DEFAULT 'Ativa',
                                                    PRIMARY KEY (`category_id`),
                                                    INDEX `fk_category_users_idx` (`users_user_id` ASC) VISIBLE,
                                                    UNIQUE INDEX `uq_name_type_user_id` (`users_user_id` ASC, `type` ASC, `name` ASC) VISIBLE,
                                                    CONSTRAINT `fk_category_users`
                                                        FOREIGN KEY (`users_user_id`)
                                                            REFERENCES `myfin`.`users` (`user_id`)
                                                            ON DELETE NO ACTION
                                                            ON UPDATE NO ACTION)
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`accounts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`accounts` (
                                                  `account_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                  `name` VARCHAR(255) NOT NULL,
                                                  `type` VARCHAR(45) NOT NULL,
                                                  `description` MEDIUMTEXT NULL,
                                                  `exclude_from_budgets` TINYINT(1) NOT NULL,
                                                  `status` VARCHAR(45) NOT NULL,
                                                  `users_user_id` BIGINT NOT NULL,
                                                  `current_balance` BIGINT NULL DEFAULT 0,
                                                  `created_timestamp` BIGINT NULL,
                                                  `updated_timestamp` BIGINT NULL,
                                                  `color_gradient` VARCHAR(45) NULL DEFAULT NULL,
                                                  PRIMARY KEY (`account_id`),
                                                  UNIQUE INDEX `account_id_UNIQUE` (`account_id` ASC) VISIBLE,
                                                  UNIQUE INDEX `name_UNIQUE` (`name` ASC, `users_user_id` ASC) VISIBLE,
                                                  INDEX `fk_accounts_users1_idx` (`users_user_id` ASC) VISIBLE,
                                                  CONSTRAINT `fk_accounts_users1`
                                                      FOREIGN KEY (`users_user_id`)
                                                          REFERENCES `myfin`.`users` (`user_id`)
                                                          ON DELETE NO ACTION
                                                          ON UPDATE NO ACTION)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`entities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`entities` (
                                                  `entity_id` INT NOT NULL AUTO_INCREMENT,
                                                  `name` VARCHAR(255) NOT NULL,
                                                  `users_user_id` BIGINT NOT NULL,
                                                  PRIMARY KEY (`entity_id`),
                                                  UNIQUE INDEX `entity_id_UNIQUE` (`entity_id` ASC) VISIBLE,
                                                  UNIQUE INDEX `name_UNIQUE` (`name` ASC, `users_user_id` ASC) VISIBLE,
                                                  INDEX `fk_entities_users1_idx` (`users_user_id` ASC) VISIBLE,
                                                  CONSTRAINT `fk_entities_users1`
                                                      FOREIGN KEY (`users_user_id`)
                                                          REFERENCES `myfin`.`users` (`user_id`)
                                                          ON DELETE NO ACTION
                                                          ON UPDATE NO ACTION)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`transactions` (
                                                      `transaction_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                      `date_timestamp` BIGINT NOT NULL,
                                                      `amount` BIGINT NOT NULL,
                                                      `type` CHAR NOT NULL,
                                                      `description` MEDIUMTEXT NULL,
                                                      `entities_entity_id` INT NULL,
                                                      `accounts_account_from_id` BIGINT NULL,
                                                      `accounts_account_to_id` BIGINT NULL,
                                                      `categories_category_id` BIGINT NULL,
                                                      `is_essential` TINYINT(1) NOT NULL,
                                                      PRIMARY KEY (`transaction_id`),
                                                      UNIQUE INDEX `transaction_id_UNIQUE` (`transaction_id` ASC) VISIBLE,
                                                      INDEX `fk_transactions_entities2_idx` (`entities_entity_id` ASC) VISIBLE,
                                                      INDEX `fk_transactions_accounts1_idx` (`accounts_account_from_id` ASC) VISIBLE,
                                                      INDEX `fk_transactions_categories1_idx` (`categories_category_id` ASC) VISIBLE,
                                                      CONSTRAINT `fk_transactions_entities2`
                                                          FOREIGN KEY (`entities_entity_id`)
                                                              REFERENCES `myfin`.`entities` (`entity_id`)
                                                              ON DELETE NO ACTION
                                                              ON UPDATE NO ACTION,
                                                      CONSTRAINT `fk_transactions_accounts1`
                                                          FOREIGN KEY (`accounts_account_from_id`)
                                                              REFERENCES `myfin`.`accounts` (`account_id`)
                                                              ON DELETE NO ACTION
                                                              ON UPDATE NO ACTION,
                                                      CONSTRAINT `fk_transactions_categories1`
                                                          FOREIGN KEY (`categories_category_id`)
                                                              REFERENCES `myfin`.`categories` (`category_id`)
                                                              ON DELETE NO ACTION
                                                              ON UPDATE NO ACTION)
    ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `myfin`.`budgets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`budgets` (
                                                 `budget_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                 `month` INT NOT NULL,
                                                 `year` INT NOT NULL,
                                                 `observations` MEDIUMTEXT NULL,
                                                 `is_open` TINYINT(1) NOT NULL,
                                                 `initial_balance` BIGINT NULL,
                                                 `users_user_id` BIGINT NOT NULL,
                                                 PRIMARY KEY (`budget_id`, `users_user_id`),
                                                 UNIQUE INDEX `budget_id_UNIQUE` (`budget_id` ASC) VISIBLE,
                                                 INDEX `fk_budgets_users1_idx` (`users_user_id` ASC) VISIBLE,
                                                 UNIQUE INDEX `uq_month_year_user` (`month` ASC, `year` ASC, `users_user_id` ASC) VISIBLE,
                                                 CONSTRAINT `fk_budgets_users1`
                                                     FOREIGN KEY (`users_user_id`)
                                                         REFERENCES `myfin`.`users` (`user_id`)
                                                         ON DELETE NO ACTION
                                                         ON UPDATE NO ACTION)
    ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `myfin`.`budgets_has_categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`budgets_has_categories` (
                                                                `budgets_budget_id` BIGINT NOT NULL,
                                                                `budgets_users_user_id` BIGINT NOT NULL,
                                                                `categories_category_id` BIGINT NOT NULL,
                                                                `planned_amount` BIGINT NOT NULL DEFAULT 0,
                                                                `current_amount` BIGINT NOT NULL DEFAULT 0,
                                                                PRIMARY KEY (`budgets_budget_id`, `budgets_users_user_id`, `categories_category_id`),
                                                                INDEX `fk_budgets_has_categories_categories1_idx` (`categories_category_id` ASC) VISIBLE,
                                                                INDEX `fk_budgets_has_categories_budgets1_idx` (`budgets_budget_id` ASC, `budgets_users_user_id` ASC) VISIBLE,
                                                                CONSTRAINT `fk_budgets_has_categories_budgets1`
                                                                    FOREIGN KEY (`budgets_budget_id` , `budgets_users_user_id`)
                                                                        REFERENCES `myfin`.`budgets` (`budget_id` , `users_user_id`)
                                                                        ON DELETE NO ACTION
                                                                        ON UPDATE NO ACTION,
                                                                CONSTRAINT `fk_budgets_has_categories_categories1`
                                                                    FOREIGN KEY (`categories_category_id`)
                                                                        REFERENCES `myfin`.`categories` (`category_id`)
                                                                        ON DELETE NO ACTION
                                                                        ON UPDATE NO ACTION)
    ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `myfin`.`balances_snapshot`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`balances_snapshot` (
                                                           `accounts_account_id` BIGINT NOT NULL,
                                                           `month` INT NOT NULL,
                                                           `year` INT NOT NULL,
                                                           `balance` BIGINT NOT NULL DEFAULT 0,
                                                           `created_timestamp` BIGINT NOT NULL,
                                                           `updated_timestamp` BIGINT NULL,
                                                           INDEX `fk_balances_snapshot_accounts1_idx` (`accounts_account_id` ASC) VISIBLE,
                                                           PRIMARY KEY (`accounts_account_id`, `month`, `year`),
                                                           CONSTRAINT `fk_balances_snapshot_accounts1`
                                                               FOREIGN KEY (`accounts_account_id`)
                                                                   REFERENCES `myfin`.`accounts` (`account_id`)
                                                                   ON DELETE NO ACTION
                                                                   ON UPDATE NO ACTION)
    ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `myfin`.`rules`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`rules` (
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
                                               `assign_is_essential` TINYINT(1) NOT NULL,
                                               PRIMARY KEY (`rule_id`, `users_user_id`),
                                               INDEX `fk_rules_users1_idx` (`users_user_id` ASC) VISIBLE,
                                               CONSTRAINT `fk_rules_users1`
                                                   FOREIGN KEY (`users_user_id`)
                                                       REFERENCES `myfin`.`users` (`user_id`)
                                                       ON DELETE NO ACTION
                                                       ON UPDATE NO ACTION)
    ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `myfin`.`invest_assets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`invest_assets` (
                                                       `asset_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                       `name` VARCHAR(75) NOT NULL,
                                                       `ticker` VARCHAR(45) NULL,
                                                       `units` DECIMAL(16,6) ZEROFILL NOT NULL,
                                                       `type` VARCHAR(75) NOT NULL,
                                                       `broker` VARCHAR(45) NULL,
                                                       `created_at` BIGINT NOT NULL,
                                                       `updated_at` BIGINT NULL,
                                                       `users_user_id` BIGINT NOT NULL,
                                                       PRIMARY KEY (`asset_id`),
                                                       UNIQUE INDEX `asset_id_UNIQUE` (`asset_id` ASC) VISIBLE,
                                                       INDEX `fk_invest_assets_users1_idx` (`users_user_id` ASC) VISIBLE,
                                                       UNIQUE INDEX `users_user_id_type_name_unique` (`name` ASC, `type` ASC, `users_user_id` ASC) VISIBLE,
                                                       CONSTRAINT `fk_invest_assets_users1`
                                                           FOREIGN KEY (`users_user_id`)
                                                               REFERENCES `myfin`.`users` (`user_id`)
                                                               ON DELETE NO ACTION
                                                               ON UPDATE NO ACTION)
    ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `myfin`.`invest_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`invest_transactions` (
                                                             `transaction_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                             `date_timestamp` BIGINT NOT NULL,
                                                             `type` ENUM('B', 'S') NOT NULL,
                                                             `note` VARCHAR(100) NULL,
                                                             `total_price` BIGINT NOT NULL,
                                                             `units` DECIMAL(16,6) NOT NULL,
                                                             `invest_assets_asset_id` BIGINT NOT NULL,
                                                             `created_at` BIGINT NOT NULL,
                                                             `updated_at` BIGINT NOT NULL,
                                                             PRIMARY KEY (`transaction_id`),
                                                             UNIQUE INDEX `transaction_id_UNIQUE` (`transaction_id` ASC) VISIBLE,
                                                             INDEX `fk_invest_transactions_invest_assets1_idx` (`invest_assets_asset_id` ASC) VISIBLE,
                                                             CONSTRAINT `fk_invest_transactions_invest_assets1`
                                                                 FOREIGN KEY (`invest_assets_asset_id`)
                                                                     REFERENCES `myfin`.`invest_assets` (`asset_id`)
                                                                     ON DELETE NO ACTION
                                                                     ON UPDATE NO ACTION)
    ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `myfin`.`invest_asset_evo_snapshot`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`invest_asset_evo_snapshot` (
                                                                   `month` INT NOT NULL,
                                                                   `year` INT NOT NULL,
                                                                   `units` DECIMAL(16,6) ZEROFILL NOT NULL,
                                                                   `invested_amount` BIGINT NOT NULL,
                                                                   `current_value` BIGINT NOT NULL,
                                                                   `invest_assets_asset_id` BIGINT NOT NULL,
                                                                   `created_at` BIGINT NOT NULL,
                                                                   `updated_at` BIGINT NOT NULL,
                                                                   `withdrawn_amount` BIGINT NOT NULL,
                                                                   UNIQUE INDEX `uq_month_year_invest_assets_asset_id` (`month` ASC, `year` ASC, `invest_assets_asset_id` ASC) VISIBLE,
                                                                   INDEX `fk_invest_asset_evo_snapshot_invest_assets1_idx` (`invest_assets_asset_id` ASC) VISIBLE,
                                                                   CONSTRAINT `fk_invest_asset_evo_snapshot_invest_assets1`
                                                                       FOREIGN KEY (`invest_assets_asset_id`)
                                                                           REFERENCES `myfin`.`invest_assets` (`asset_id`)
                                                                           ON DELETE NO ACTION
                                                                           ON UPDATE NO ACTION)
    ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `myfin`.`invest_desired_allocations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`invest_desired_allocations` (
                                                                    `desired_allocations_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                                    `type` VARCHAR(75) NOT NULL,
                                                                    `alloc_percentage` FLOAT NULL,
                                                                    `users_user_id` BIGINT NOT NULL,
                                                                    PRIMARY KEY (`desired_allocations_id`, `type`),
                                                                    UNIQUE INDEX `type_UNIQUE` (`type` ASC) VISIBLE,
                                                                    INDEX `fk_invest_desired_allocations_users1_idx` (`users_user_id` ASC) VISIBLE,
                                                                    UNIQUE INDEX `desired_allocations_id_UNIQUE` (`desired_allocations_id` ASC) VISIBLE,
                                                                    CONSTRAINT `fk_invest_desired_allocations_users1`
                                                                        FOREIGN KEY (`users_user_id`)
                                                                            REFERENCES `myfin`.`users` (`user_id`)
                                                                            ON DELETE NO ACTION
                                                                            ON UPDATE NO ACTION)
    ENGINE = InnoDB;

USE `myfin_prod` ;

-- -----------------------------------------------------
-- Table `myfin_prod`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`users` (
                                                    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                    `username` VARCHAR(45) NOT NULL,
                                                    `password` TEXT NOT NULL,
                                                    `email` VARCHAR(45) NOT NULL,
                                                    `sessionkey` TEXT NULL DEFAULT NULL,
                                                    `sessionkey_mobile` TEXT NULL DEFAULT NULL,
                                                    `trustlimit` INT NULL DEFAULT NULL,
                                                    `trustlimit_mobile` INT NULL DEFAULT NULL,
                                                    `last_update_timestamp` BIGINT NOT NULL DEFAULT '0',
                                                    PRIMARY KEY (`user_id`),
                                                    UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE,
                                                    UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
    ENGINE = InnoDB
    AUTO_INCREMENT = 8
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`accounts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`accounts` (
                                                       `account_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                       `name` VARCHAR(255) NOT NULL,
                                                       `type` VARCHAR(45) NOT NULL,
                                                       `description` MEDIUMTEXT NULL DEFAULT NULL,
                                                       `exclude_from_budgets` TINYINT(1) NOT NULL,
                                                       `status` VARCHAR(45) NOT NULL,
                                                       `users_user_id` BIGINT NOT NULL,
                                                       `current_balance` BIGINT NULL DEFAULT '0',
                                                       `created_timestamp` BIGINT NULL DEFAULT NULL,
                                                       `updated_timestamp` BIGINT NULL DEFAULT NULL,
                                                       `color_gradient` VARCHAR(45) NULL DEFAULT NULL,
                                                       PRIMARY KEY (`account_id`),
                                                       UNIQUE INDEX `account_id_UNIQUE` (`account_id` ASC) VISIBLE,
                                                       UNIQUE INDEX `name_UNIQUE` (`name` ASC, `users_user_id` ASC) VISIBLE,
                                                       INDEX `fk_accounts_users1_idx` (`users_user_id` ASC) VISIBLE,
                                                       CONSTRAINT `fk_accounts_users1`
                                                           FOREIGN KEY (`users_user_id`)
                                                               REFERENCES `myfin_prod`.`users` (`user_id`))
    ENGINE = InnoDB
    AUTO_INCREMENT = 78
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`balances`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`balances` (
                                                       `balance_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                       `date_timestamp` BIGINT NOT NULL,
                                                       `amount` DOUBLE NOT NULL,
                                                       `accounts_account_id` BIGINT NOT NULL,
                                                       PRIMARY KEY (`balance_id`),
                                                       INDEX `fk_balances_accounts1_idx` (`accounts_account_id` ASC) VISIBLE)
    ENGINE = InnoDB
    AUTO_INCREMENT = 4
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`balances_snapshot`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`balances_snapshot` (
                                                                `accounts_account_id` BIGINT NOT NULL,
                                                                `month` INT NOT NULL,
                                                                `year` INT NOT NULL,
                                                                `balance` BIGINT NOT NULL DEFAULT '0',
                                                                `created_timestamp` BIGINT NOT NULL,
                                                                `updated_timestamp` BIGINT NULL DEFAULT NULL,
                                                                PRIMARY KEY (`accounts_account_id`, `month`, `year`),
                                                                INDEX `fk_balances_snapshot_accounts1_idx` (`accounts_account_id` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`budgets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`budgets` (
                                                      `budget_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                      `month` INT NOT NULL,
                                                      `year` INT NOT NULL,
                                                      `observations` MEDIUMTEXT NULL DEFAULT NULL,
                                                      `is_open` TINYINT(1) NOT NULL,
                                                      `initial_balance` BIGINT NULL DEFAULT NULL,
                                                      `users_user_id` BIGINT NOT NULL,
                                                      PRIMARY KEY (`budget_id`, `users_user_id`),
                                                      UNIQUE INDEX `budget_id_UNIQUE` (`budget_id` ASC) VISIBLE,
                                                      UNIQUE INDEX `uq_month_year_user` (`month` ASC, `year` ASC, `users_user_id` ASC) VISIBLE,
                                                      INDEX `fk_budgets_users1_idx` (`users_user_id` ASC) VISIBLE)
    ENGINE = InnoDB
    AUTO_INCREMENT = 44
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`budgets_has_categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`budgets_has_categories` (
                                                                     `budgets_budget_id` BIGINT NOT NULL,
                                                                     `budgets_users_user_id` BIGINT NOT NULL,
                                                                     `categories_category_id` BIGINT NOT NULL,
                                                                     `planned_amount_credit` BIGINT NOT NULL DEFAULT '0',
                                                                     `current_amount` BIGINT NOT NULL DEFAULT '0',
                                                                     `planned_amount_debit` BIGINT NOT NULL DEFAULT '0',
                                                                     PRIMARY KEY (`budgets_budget_id`, `budgets_users_user_id`, `categories_category_id`),
                                                                     INDEX `fk_budgets_has_categories_categories1_idx` (`categories_category_id` ASC) VISIBLE,
                                                                     INDEX `fk_budgets_has_categories_budgets1_idx` (`budgets_budget_id` ASC, `budgets_users_user_id` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`categories` (
                                                         `category_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                         `name` VARCHAR(255) NOT NULL,
                                                         `type` CHAR(1) NOT NULL,
                                                         `users_user_id` BIGINT NOT NULL,
                                                         `description` MEDIUMTEXT NULL DEFAULT NULL,
                                                         `color_gradient` VARCHAR(45) NULL DEFAULT NULL,
                                                         `status` VARCHAR(45) NOT NULL DEFAULT 'Ativa',
                                                         PRIMARY KEY (`category_id`),
                                                         UNIQUE INDEX `uq_name_type_user_id` (`users_user_id` ASC, `type` ASC, `name` ASC) VISIBLE,
                                                         INDEX `fk_category_users_idx` (`users_user_id` ASC) VISIBLE)
    ENGINE = InnoDB
    AUTO_INCREMENT = 59
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`entities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`entities` (
                                                       `entity_id` INT NOT NULL AUTO_INCREMENT,
                                                       `name` VARCHAR(255) NOT NULL,
                                                       `users_user_id` BIGINT NOT NULL,
                                                       PRIMARY KEY (`entity_id`),
                                                       UNIQUE INDEX `entity_id_UNIQUE` (`entity_id` ASC) VISIBLE,
                                                       UNIQUE INDEX `name_UNIQUE` (`name` ASC, `users_user_id` ASC) VISIBLE,
                                                       INDEX `fk_entities_users1_idx` (`users_user_id` ASC) VISIBLE,
                                                       INDEX `name` (`name` ASC) VISIBLE)
    ENGINE = InnoDB
    AUTO_INCREMENT = 225
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`invest_asset_evo_snapshot`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`invest_asset_evo_snapshot` (
                                                                        `month` INT NOT NULL,
                                                                        `year` INT NOT NULL,
                                                                        `units` DECIMAL(16,6) NOT NULL,
                                                                        `invested_amount` BIGINT NOT NULL,
                                                                        `current_value` BIGINT NOT NULL,
                                                                        `invest_assets_asset_id` BIGINT NOT NULL,
                                                                        `created_at` BIGINT NOT NULL,
                                                                        `updated_at` BIGINT NOT NULL,
                                                                        `withdrawn_amount` BIGINT NOT NULL,
                                                                        UNIQUE INDEX `uq_month_year_invest_assets_asset_id` (`month` ASC, `year` ASC, `invest_assets_asset_id` ASC) VISIBLE,
                                                                        INDEX `fk_invest_asset_evo_snapshot_invest_assets1_idx` (`invest_assets_asset_id` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`invest_assets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`invest_assets` (
                                                            `asset_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                            `name` VARCHAR(75) NOT NULL,
                                                            `ticker` VARCHAR(45) NULL DEFAULT NULL,
                                                            `units` DECIMAL(16,6) NOT NULL,
                                                            `type` VARCHAR(75) NOT NULL,
                                                            `broker` VARCHAR(45) NULL DEFAULT NULL,
                                                            `created_at` BIGINT NOT NULL,
                                                            `updated_at` BIGINT NULL DEFAULT NULL,
                                                            `users_user_id` BIGINT NOT NULL,
                                                            PRIMARY KEY (`asset_id`),
                                                            UNIQUE INDEX `asset_id_UNIQUE` (`asset_id` ASC) VISIBLE,
                                                            UNIQUE INDEX `users_user_id_type_name_unique` (`name` ASC, `type` ASC, `users_user_id` ASC) VISIBLE,
                                                            INDEX `fk_invest_assets_users1_idx` (`users_user_id` ASC) VISIBLE)
    ENGINE = InnoDB
    AUTO_INCREMENT = 22
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`invest_desired_allocations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`invest_desired_allocations` (
                                                                         `desired_allocations_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                                         `type` VARCHAR(75) NOT NULL,
                                                                         `alloc_percentage` FLOAT NULL DEFAULT NULL,
                                                                         `users_user_id` BIGINT NOT NULL,
                                                                         PRIMARY KEY (`desired_allocations_id`, `type`),
                                                                         UNIQUE INDEX `type_UNIQUE` (`type` ASC) VISIBLE,
                                                                         UNIQUE INDEX `desired_allocations_id_UNIQUE` (`desired_allocations_id` ASC) VISIBLE,
                                                                         INDEX `fk_invest_desired_allocations_users1_idx` (`users_user_id` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`invest_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`invest_transactions` (
                                                                  `transaction_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                                  `date_timestamp` BIGINT NOT NULL,
                                                                  `type` ENUM('B', 'S') NOT NULL,
                                                                  `note` VARCHAR(100) NULL DEFAULT NULL,
                                                                  `total_price` BIGINT NOT NULL,
                                                                  `units` DECIMAL(16,6) NOT NULL,
                                                                  `invest_assets_asset_id` BIGINT NOT NULL,
                                                                  `created_at` BIGINT NOT NULL,
                                                                  `updated_at` BIGINT NOT NULL,
                                                                  PRIMARY KEY (`transaction_id`),
                                                                  UNIQUE INDEX `transaction_id_UNIQUE` (`transaction_id` ASC) VISIBLE,
                                                                  INDEX `fk_invest_transactions_invest_assets1_idx` (`invest_assets_asset_id` ASC) VISIBLE)
    ENGINE = InnoDB
    AUTO_INCREMENT = 53
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`phinxlog`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`phinxlog` (
                                                       `version` BIGINT NOT NULL,
                                                       `migration_name` VARCHAR(100) NULL DEFAULT NULL,
                                                       `start_time` TIMESTAMP NULL DEFAULT NULL,
                                                       `end_time` TIMESTAMP NULL DEFAULT NULL,
                                                       `breakpoint` TINYINT(1) NOT NULL DEFAULT '0',
                                                       PRIMARY KEY (`version`))
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`rules`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`rules` (
                                                    `rule_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                    `matcher_description_operator` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_description_value` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_amount_operator` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_amount_value` BIGINT NULL DEFAULT NULL,
                                                    `matcher_type_operator` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_type_value` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_account_to_id_operator` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_account_to_id_value` BIGINT NULL DEFAULT NULL,
                                                    `matcher_account_from_id_operator` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_account_from_id_value` BIGINT NULL DEFAULT NULL,
                                                    `assign_category_id` BIGINT NULL DEFAULT NULL,
                                                    `assign_entity_id` BIGINT NULL DEFAULT NULL,
                                                    `assign_account_to_id` BIGINT NULL DEFAULT NULL,
                                                    `assign_account_from_id` BIGINT NULL DEFAULT NULL,
                                                    `assign_type` VARCHAR(45) NULL DEFAULT NULL,
                                                    `users_user_id` BIGINT NOT NULL,
                                                    `assign_is_essential` TINYINT(1) NOT NULL DEFAULT '0',
                                                    PRIMARY KEY (`rule_id`, `users_user_id`),
                                                    INDEX `fk_rules_users1_idx` (`users_user_id` ASC) VISIBLE)
    ENGINE = InnoDB
    AUTO_INCREMENT = 93
    DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `myfin_prod`.`transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin_prod`.`transactions` (
                                                           `transaction_id` BIGINT NOT NULL AUTO_INCREMENT,
                                                           `date_timestamp` BIGINT NOT NULL,
                                                           `amount` BIGINT NOT NULL,
                                                           `type` CHAR(1) NOT NULL,
                                                           `description` MEDIUMTEXT NULL DEFAULT NULL,
                                                           `entities_entity_id` INT NULL DEFAULT NULL,
                                                           `accounts_account_from_id` BIGINT NULL DEFAULT NULL,
                                                           `accounts_account_to_id` BIGINT NULL DEFAULT NULL,
                                                           `categories_category_id` BIGINT NULL DEFAULT NULL,
                                                           `is_essential` TINYINT(1) NOT NULL DEFAULT '0',
                                                           PRIMARY KEY (`transaction_id`),
                                                           UNIQUE INDEX `transaction_id_UNIQUE` (`transaction_id` ASC) VISIBLE,
                                                           INDEX `fk_transactions_entities2_idx` (`entities_entity_id` ASC) VISIBLE,
                                                           INDEX `fk_transactions_accounts1_idx` (`accounts_account_from_id` ASC) VISIBLE,
                                                           INDEX `fk_transactions_categories1_idx` (`categories_category_id` ASC) VISIBLE)
    ENGINE = InnoDB
    AUTO_INCREMENT = 2107
    DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
