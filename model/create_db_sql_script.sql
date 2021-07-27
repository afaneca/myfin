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
-- Schema myfin
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema myfin
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `myfin` DEFAULT CHARACTER SET latin1 ;
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
                                               UNIQUE INDEX `username_UNIQUE` (`username` ASC),
                                               UNIQUE INDEX `email_UNIQUE` (`email` ASC))
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
                                                    INDEX `fk_category_users_idx` (`users_user_id` ASC),
                                                    UNIQUE INDEX `uq_name_type_user_id` (`users_user_id` ASC, `type` ASC, `name` ASC),
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
                                                  UNIQUE INDEX `account_id_UNIQUE` (`account_id` ASC),
                                                  UNIQUE INDEX `name_UNIQUE` (`name` ASC, `users_user_id` ASC),
                                                  INDEX `fk_accounts_users1_idx` (`users_user_id` ASC),
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
                                                  UNIQUE INDEX `entity_id_UNIQUE` (`entity_id` ASC),
                                                  UNIQUE INDEX `name_UNIQUE` (`name` ASC, `users_user_id` ASC),
                                                  INDEX `fk_entities_users1_idx` (`users_user_id` ASC),
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
                                                      PRIMARY KEY (`transaction_id`),
                                                      UNIQUE INDEX `transaction_id_UNIQUE` (`transaction_id` ASC),
                                                      INDEX `fk_transactions_entities2_idx` (`entities_entity_id` ASC),
                                                      INDEX `fk_transactions_accounts1_idx` (`accounts_account_from_id` ASC),
                                                      INDEX `fk_transactions_categories1_idx` (`categories_category_id` ASC),
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
                                                 UNIQUE INDEX `budget_id_UNIQUE` (`budget_id` ASC),
                                                 INDEX `fk_budgets_users1_idx` (`users_user_id` ASC),
                                                 UNIQUE INDEX `uq_month_year_user` (`month` ASC, `year` ASC, `users_user_id` ASC),
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
                                                                INDEX `fk_budgets_has_categories_categories1_idx` (`categories_category_id` ASC),
                                                                INDEX `fk_budgets_has_categories_budgets1_idx` (`budgets_budget_id` ASC, `budgets_users_user_id` ASC),
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
                                                           INDEX `fk_balances_snapshot_accounts1_idx` (`accounts_account_id` ASC),
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
                                               PRIMARY KEY (`rule_id`, `users_user_id`),
                                               INDEX `fk_rules_users1_idx` (`users_user_id` ASC),
                                               CONSTRAINT `fk_rules_users1`
                                                   FOREIGN KEY (`users_user_id`)
                                                       REFERENCES `myfin`.`users` (`user_id`)
                                                       ON DELETE NO ACTION
                                                       ON UPDATE NO ACTION)
    ENGINE = InnoDB;

USE `myfin` ;

-- -----------------------------------------------------
-- Table `myfin`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`users` (
                                                    `user_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                                                    `username` VARCHAR(45) NOT NULL,
                                                    `password` TEXT NOT NULL,
                                                    `email` VARCHAR(45) NOT NULL,
                                                    `sessionkey` TEXT NULL DEFAULT NULL,
                                                    `sessionkey_mobile` TEXT NULL DEFAULT NULL,
                                                    `trustlimit` INT(11) NULL DEFAULT NULL,
                                                    `trustlimit_mobile` INT(11) NULL DEFAULT NULL,
                                                    `last_update_timestamp` BIGINT(20) NULL DEFAULT '0',
                                                    PRIMARY KEY (`user_id`),
                                                    UNIQUE INDEX `username_UNIQUE` (`username` ASC),
                                                    UNIQUE INDEX `email_UNIQUE` (`email` ASC))
    ENGINE = InnoDB
    AUTO_INCREMENT = 8
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`accounts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`accounts` (
                                                       `account_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                                                       `name` VARCHAR(255) NOT NULL,
                                                       `type` VARCHAR(45) NOT NULL,
                                                       `description` MEDIUMTEXT NULL DEFAULT NULL,
                                                       `exclude_from_budgets` TINYINT(1) NOT NULL,
                                                       `status` VARCHAR(45) NOT NULL,
                                                       `users_user_id` BIGINT(20) NOT NULL,
                                                       `current_balance` BIGINT(20) NULL DEFAULT '0',
                                                       `created_timestamp` BIGINT(20) NULL DEFAULT NULL,
                                                       `updated_timestamp` BIGINT(20) NULL DEFAULT NULL,
                                                       `color_gradient` VARCHAR(45) NULL DEFAULT NULL,
                                                       PRIMARY KEY (`account_id`),
                                                       UNIQUE INDEX `account_id_UNIQUE` (`account_id` ASC),
                                                       UNIQUE INDEX `name_UNIQUE` (`name` ASC, `users_user_id` ASC),
                                                       INDEX `fk_accounts_users1_idx` (`users_user_id` ASC),
                                                       CONSTRAINT `fk_accounts_users1`
                                                           FOREIGN KEY (`users_user_id`)
                                                               REFERENCES `myfin`.`users` (`user_id`)
                                                               ON DELETE NO ACTION
                                                               ON UPDATE NO ACTION)
    ENGINE = InnoDB
    AUTO_INCREMENT = 73
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`balances`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`balances` (
                                                       `balance_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                                                       `date_timestamp` BIGINT(20) NOT NULL,
                                                       `amount` DOUBLE NOT NULL,
                                                       `accounts_account_id` BIGINT(20) NOT NULL,
                                                       PRIMARY KEY (`balance_id`),
                                                       INDEX `fk_balances_accounts1_idx` (`accounts_account_id` ASC))
    ENGINE = InnoDB
    AUTO_INCREMENT = 4
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`balances_snapshot`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`balances_snapshot` (
                                                                `accounts_account_id` BIGINT(20) NOT NULL,
                                                                `month` INT(11) NOT NULL,
                                                                `year` INT(11) NOT NULL,
                                                                `balance` BIGINT(20) NOT NULL DEFAULT '0',
                                                                `created_timestamp` BIGINT(20) NOT NULL,
                                                                `updated_timestamp` BIGINT(20) NULL DEFAULT NULL,
                                                                PRIMARY KEY (`accounts_account_id`, `month`, `year`),
                                                                INDEX `fk_balances_snapshot_accounts1_idx` (`accounts_account_id` ASC))
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`budgets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`budgets` (
                                                      `budget_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                                                      `month` INT(11) NOT NULL,
                                                      `year` INT(11) NOT NULL,
                                                      `observations` MEDIUMTEXT NULL DEFAULT NULL,
                                                      `is_open` TINYINT(1) NOT NULL,
                                                      `initial_balance` BIGINT(20) NULL DEFAULT NULL,
                                                      `users_user_id` BIGINT(20) NOT NULL,
                                                      PRIMARY KEY (`budget_id`, `users_user_id`),
                                                      UNIQUE INDEX `budget_id_UNIQUE` (`budget_id` ASC),
                                                      UNIQUE INDEX `uq_month_year_user` (`month` ASC, `year` ASC, `users_user_id` ASC),
                                                      INDEX `fk_budgets_users1_idx` (`users_user_id` ASC))
    ENGINE = InnoDB
    AUTO_INCREMENT = 28
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`budgets_has_categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`budgets_has_categories` (
                                                                     `budgets_budget_id` BIGINT(20) NOT NULL,
                                                                     `budgets_users_user_id` BIGINT(20) NOT NULL,
                                                                     `categories_category_id` BIGINT(20) NOT NULL,
                                                                     `planned_amount_credit` BIGINT(20) NOT NULL DEFAULT '0',
                                                                     `current_amount` BIGINT(20) NOT NULL DEFAULT '0',
                                                                     `planned_amount_debit` BIGINT(20) NOT NULL DEFAULT '0',
                                                                     PRIMARY KEY (`budgets_budget_id`, `budgets_users_user_id`, `categories_category_id`),
                                                                     INDEX `fk_budgets_has_categories_categories1_idx` (`categories_category_id` ASC),
                                                                     INDEX `fk_budgets_has_categories_budgets1_idx` (`budgets_budget_id` ASC, `budgets_users_user_id` ASC))
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`categories` (
                                                         `category_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                                                         `name` VARCHAR(255) NOT NULL,
                                                         `type` CHAR(1) NOT NULL,
                                                         `users_user_id` BIGINT(20) NOT NULL,
                                                         `description` MEDIUMTEXT NULL DEFAULT NULL,
                                                         `color_gradient` VARCHAR(45) NULL DEFAULT NULL,
                                                         `status` VARCHAR(45) NOT NULL DEFAULT 'Ativa',
                                                         PRIMARY KEY (`category_id`),
                                                         UNIQUE INDEX `uq_name_type_user_id` (`users_user_id` ASC, `type` ASC, `name` ASC),
                                                         INDEX `fk_category_users_idx` (`users_user_id` ASC))
    ENGINE = InnoDB
    AUTO_INCREMENT = 57
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`entities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`entities` (
                                                       `entity_id` INT(11) NOT NULL AUTO_INCREMENT,
                                                       `name` VARCHAR(255) NOT NULL,
                                                       `users_user_id` BIGINT(20) NOT NULL,
                                                       PRIMARY KEY (`entity_id`),
                                                       UNIQUE INDEX `entity_id_UNIQUE` (`entity_id` ASC),
                                                       UNIQUE INDEX `name_UNIQUE` (`name` ASC, `users_user_id` ASC),
                                                       INDEX `fk_entities_users1_idx` (`users_user_id` ASC),
                                                       INDEX `name` (`name` ASC))
    ENGINE = InnoDB
    AUTO_INCREMENT = 180
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`rules`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`rules` (
                                                    `rule_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                                                    `matcher_description_operator` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_description_value` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_amount_operator` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_amount_value` BIGINT(20) NULL DEFAULT NULL,
                                                    `matcher_type_operator` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_type_value` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_account_to_id_operator` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_account_to_id_value` BIGINT(20) NULL DEFAULT NULL,
                                                    `matcher_account_from_id_operator` VARCHAR(45) NULL DEFAULT NULL,
                                                    `matcher_account_from_id_value` BIGINT(20) NULL DEFAULT NULL,
                                                    `assign_category_id` BIGINT(20) NULL DEFAULT NULL,
                                                    `assign_entity_id` BIGINT(20) NULL DEFAULT NULL,
                                                    `assign_account_to_id` BIGINT(20) NULL DEFAULT NULL,
                                                    `assign_account_from_id` BIGINT(20) NULL DEFAULT NULL,
                                                    `assign_type` VARCHAR(45) NULL DEFAULT NULL,
                                                    `users_user_id` BIGINT(20) NOT NULL,
                                                    PRIMARY KEY (`rule_id`, `users_user_id`),
                                                    INDEX `fk_rules_users1_idx` (`users_user_id` ASC))
    ENGINE = InnoDB
    AUTO_INCREMENT = 76
    DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `myfin`.`transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `myfin`.`transactions` (
                                                           `transaction_id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                                                           `date_timestamp` BIGINT(20) NOT NULL,
                                                           `amount` BIGINT(20) NOT NULL,
                                                           `type` CHAR(1) NOT NULL,
                                                           `description` MEDIUMTEXT NULL DEFAULT NULL,
                                                           `entities_entity_id` INT(11) NULL DEFAULT NULL,
                                                           `accounts_account_from_id` BIGINT(20) NULL DEFAULT NULL,
                                                           `accounts_account_to_id` BIGINT(20) NULL DEFAULT NULL,
                                                           `categories_category_id` BIGINT(20) NULL DEFAULT NULL,
                                                           PRIMARY KEY (`transaction_id`),
                                                           UNIQUE INDEX `transaction_id_UNIQUE` (`transaction_id` ASC),
                                                           INDEX `fk_transactions_entities2_idx` (`entities_entity_id` ASC),
                                                           INDEX `fk_transactions_accounts1_idx` (`accounts_account_from_id` ASC),
                                                           INDEX `fk_transactions_categories1_idx` (`categories_category_id` ASC))
    ENGINE = InnoDB
    AUTO_INCREMENT = 1275
    DEFAULT CHARACTER SET = utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
