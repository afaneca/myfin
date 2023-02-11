<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once 'consts.php';

class Transactions
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

    public static function getAllTransactionsForUser(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
            } else {
                $mobile = false;
            }

            if ($request->getQueryParams() != null && array_key_exists('trx_limit', $request->getQueryParams())) {
                $trxLimit = Input::validate($request->getQueryParams()['trx_limit'], Input::$INT, 4);
            } else {
                $trxLimit = DEFAULT_TRANSACTIONS_FETCH_LIMIT;
            }

            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);
            $trxArr = TransactionModel::getAllTransactionsForUser($userID, $trxLimit, true);
            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, $trxArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function getAllTransactionsForUserInCategoryAndInMonth(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
            } else {
                $mobile = false;
            }

            $month = Input::validate($request->getQueryParams()['month'], Input::$INT, 4);

            $year = Input::validate($request->getQueryParams()['year'], Input::$INT, 5);

            $catID = Input::validate($request->getQueryParams()['cat_id'], Input::$INT, 6);

            $type = Input::validate($request->getQueryParams()['type'], Input::$STRICT_STRING, 7);
            if ($type !== DEFAULT_TYPE_TRANSFER_TAG && $type !== DEFAULT_TYPE_EXPENSE_TAG && $type !== DEFAULT_TYPE_INCOME_TAG) {
                $type = DEFAULT_TYPE_INCOME_TAG;
            }

            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);
            $trxArr = TransactionModel::getAllTransactionsForUserInMonthAndCategory($userID, $month, $year, $catID, $type, true);

            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, $trxArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function addTransactionStep0(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 9);
            } else {
                $mobile = false;
            }


            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);

            $outgoingArr = array();
            $outgoingArr['entities'] = array();
            $outgoingArr['categories'] = array();
            $outgoingArr['type'] = array();
            $outgoingArr['accounts'] = array();

            /* Entities */
            $outgoingArr['entities'] = EntityModel::getWhere(["users_user_id" => $userID], ["entity_id", "name"]);

            /* Categories */
            $outgoingArr['categories'] = CategoryModel::getWhere(["users_user_id" => $userID, "status" => DEFAULT_CATEGORY_ACTIVE_STATUS], ["category_id", "name", "description"]);

            /* Type */
            $outgoingArr['type'] = array(
                [
                    "letter" => "I", "name" => "Receita"
                ],
                [
                    "letter" => "E", "name" => "Despesa"
                ],
                [
                    "letter" => "T", "name" => "Transferência"
                ]
            );

            /* Accounts */
            $outgoingArr['accounts'] = AccountModel::getWhere(["users_user_id" => $userID, "status" => DEFAULT_ACCOUNT_ACTIVE_STATUS], ["account_id", "name", "type"]);


            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, $outgoingArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    // STEP 1
    public static function addTransaction(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            $amount = Input::convertFloatToIntegerAmount(Input::validate($request->getParsedBody()['amount'], Input::$FLOAT, 2));
            $type = Input::validate($request->getParsedBody()['type'], Input::$STRICT_STRING, 3);
            $description = Input::validate($request->getParsedBody()['description'], Input::$STRING, 4);

            if (array_key_exists('entity_id', $request->getParsedBody()) && $request->getParsedBody()['entity_id'] !== "") {
                $entityID = Input::validate($request->getParsedBody()['entity_id'], Input::$INT, 5);
            } else {
                $entityID = null;
            }

            if (array_key_exists('account_from_id', $request->getParsedBody())) {
                $accountFrom = Input::validate($request->getParsedBody()['account_from_id'], Input::$INT, 7);
            } else {
                $accountFrom = null;
            }

            if (array_key_exists('account_to_id', $request->getParsedBody())) {
                $accountTo = Input::validate($request->getParsedBody()['account_to_id'], Input::$INT, 7);
            } else {
                $accountTo = null;
            }

            if (array_key_exists('category_id', $request->getParsedBody()) && $request->getParsedBody()['category_id'] !== "") {
                $categoryID = Input::validate($request->getParsedBody()['category_id'], Input::$INT, 8);
            } else {
                $categoryID = null;
            }

            //$categoryID = Input::validate($request->getParsedBody()['category_id'], Input::$INT, 8);

            if (array_key_exists('date_timestamp', $request->getParsedBody())) {
                $date_timestamp = Input::validate($request->getParsedBody()['date_timestamp'], Input::$INT, 9);
            } else {
                $date_timestamp = time();
            }


            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 10);
            } else {
                $mobile = false;
            }

            $isEssential = (int)Input::validate($request->getParsedBody()['is_essential'], Input::$BOOLEAN, 11);

            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();


            TransactionModel::insert([
                "date_timestamp" => $date_timestamp,
                "amount" => $amount,
                "type" => $type,
                "description" => $description,
                "entities_entity_id" => $entityID,
                "accounts_account_from_id" => $accountFrom,
                "accounts_account_to_id" => $accountTo,
                "categories_category_id" => $categoryID,
                "is_essential" => $isEssential,
            ], true);

            $userID = UserModel::getUserIdByName($authusername, true);
            UserModel::setLastUpdateTimestamp($userID, time(), true);

            switch ($type) {
                case DEFAULT_TYPE_INCOME_TAG:
                    AccountModel::setNewAccountBalance($userID, $accountTo,
                        AccountModel::recalculateBalanceForAccountIncrementally($accountTo, $date_timestamp - 1, time() + 1, true),
                        true);
                    break;
                case DEFAULT_TYPE_EXPENSE_TAG:
                    AccountModel::setNewAccountBalance($userID, $accountFrom,
                        AccountModel::recalculateBalanceForAccountIncrementally($accountFrom, $date_timestamp - 1, time() + 1, true),
                        true);
                    break;
                case DEFAULT_TYPE_TRANSFER_TAG:
                    AccountModel::setNewAccountBalance($userID, $accountTo,
                        AccountModel::recalculateBalanceForAccountIncrementally($accountTo, $date_timestamp - 1, time() + 1, true),
                        true);
                    AccountModel::setNewAccountBalance($userID, $accountFrom,
                        AccountModel::recalculateBalanceForAccountIncrementally($accountFrom, $date_timestamp - 1, time() + 1, true),
                        true);
                    break;
            }


            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, "Transaction added successfully!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function removeTransaction(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            $trxID = Input::validate($request->getParsedBody()['transaction_id'], Input::$INT, 3);

            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);


            $trxObj = TransactionModel::getWhere(
                [
                    "transaction_id" => $trxID
                ],
                ["amount", "date_timestamp", "type", "accounts_account_from_id", "accounts_account_to_id"]
            )[0];


            $oldAmount = $trxObj["amount"];
            $oldTimestamp = $trxObj["date_timestamp"];
            $oldType = $trxObj["type"];

            if (isset($trxObj["accounts_account_to_id"]))
                $oldAccountTo = $trxObj["accounts_account_to_id"];

            if (isset($trxObj["accounts_account_from_id"]))
                $oldAccountFrom = $trxObj["accounts_account_from_id"];

            // Make sure accounts belong to user
            if (!AccountModel::exists([
                "users_user_id" => $userID,
                "account_id" => $oldAccountFrom ?? $oldAccountTo,
            ])) {
                throw new BadValidationTypeException("Account not found!");
            }

            TransactionModel::delete([
                "transaction_id" => $trxID
            ], true);

            // Remove the effect of $oldAmount
            switch ($oldType) {
                case DEFAULT_TYPE_INCOME_TAG:
                    // Decrement $oldAmount to level it out
                    AccountModel::setNewAccountBalance($userID, $oldAccountTo,
                        AccountModel::recalculateBalanceForAccountIncrementally($oldAccountTo, $oldTimestamp - 1, time() + 1, true),
                        true);

                    break;
                case DEFAULT_TYPE_EXPENSE_TAG:
                    // Increment $oldAmount to level it out, by reimbursing the amount
                    AccountModel::setNewAccountBalance($userID, $oldAccountFrom,
                        AccountModel::recalculateBalanceForAccountIncrementally($oldAccountFrom, $oldTimestamp - 1, time() + 1, true),
                        true);
                    break;
                case DEFAULT_TYPE_TRANSFER_TAG:
                    AccountModel::setNewAccountBalance($userID, $oldAccountFrom,
                        AccountModel::recalculateBalanceForAccountIncrementally($oldAccountFrom, $oldTimestamp - 1, time() + 1, true),
                        true);
                    AccountModel::setNewAccountBalance($userID, $oldAccountTo,
                        AccountModel::recalculateBalanceForAccountIncrementally($oldAccountTo, $oldTimestamp - 1, time() + 1, true),
                        true);
                    break;
            }
            UserModel::setLastUpdateTimestamp($userID, time(), true);
            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, "Transaction Removed!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }


    public static function editTransaction(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            $amount = Input::convertFloatToIntegerAmount(Input::validate($request->getParsedBody()['new_amount'], Input::$FLOAT, 2));
            $type = Input::validate($request->getParsedBody()['new_type'], Input::$STRICT_STRING, 3);
            $description = Input::validate($request->getParsedBody()['new_description'], Input::$STRING, 4);

            if (array_key_exists('new_entity_id', $request->getParsedBody()) && $request->getParsedBody()['new_entity_id'] !== "") {
                $entityID = Input::validate($request->getParsedBody()['new_entity_id'], Input::$INT, 5);
            } else {
                $entityID = null;
            }

            if (array_key_exists('new_account_from_id', $request->getParsedBody())) {
                $accountFrom = Input::validate($request->getParsedBody()['new_account_from_id'], Input::$INT, 7);
            } else {
                $accountFrom = null;
            }

            if (array_key_exists('new_account_to_id', $request->getParsedBody())) {
                $accountTo = Input::validate($request->getParsedBody()['new_account_to_id'], Input::$INT, 7);
            } else {
                $accountTo = null;
            }

            if (array_key_exists('new_category_id', $request->getParsedBody()) && $request->getParsedBody()['new_category_id'] !== "") {
                $categoryID = Input::validate($request->getParsedBody()['new_category_id'], Input::$INT, 8);
            } else {
                $categoryID = null;
            }

            //$categoryID = Input::validate($request->getParsedBody()['new_category_id'], Input::$INT, 8);

            if (array_key_exists('new_date_timestamp', $request->getParsedBody())) {
                $date_timestamp = Input::validate($request->getParsedBody()['new_date_timestamp'], Input::$INT, 9);
            } else {
                $date_timestamp = time();
            }


            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 10);
            } else {
                $mobile = false;
            }

            $trxID = Input::validate($request->getParsedBody()['transaction_id'], Input::$INT, 11);

            if (array_key_exists('is_split', $request->getParsedBody()) && $request->getParsedBody()['is_split'] !== "") {
                $isSplit = (int)Input::validate($request->getParsedBody()['is_split'], Input::$BOOLEAN, 12);
            } else {
                $isSplit = false;
            }

            if (array_key_exists('split_amount', $request->getParsedBody()) && $request->getParsedBody()['split_amount'] !== "") {
                $split_amount = Input::convertFloatToIntegerAmount(Input::validate($request->getParsedBody()['split_amount'], Input::$FLOAT, 13));
            } else {
                $split_amount = 0;
            }

            if (array_key_exists('split_category', $request->getParsedBody()) && $request->getParsedBody()['split_category'] !== "") {
                $split_cat_id = Input::validate($request->getParsedBody()['split_category'], Input::$INT, 14);
            } else {
                $split_cat_id = null;
            }

            if (array_key_exists('split_entity', $request->getParsedBody()) && $request->getParsedBody()['split_entity'] !== "") {
                $split_entity_id = Input::validate($request->getParsedBody()['split_entity'], Input::$INT, 15);
            } else {
                $split_entity_id = null;
            }

            if (array_key_exists('split_type', $request->getParsedBody()) && $request->getParsedBody()['split_type'] !== "") {
                $split_type = Input::validate($request->getParsedBody()['split_type'], Input::$STRICT_STRING, 16);
            } else {
                $split_type = null;
            }

            if (array_key_exists('split_account_from', $request->getParsedBody()) && $request->getParsedBody()['split_account_from'] !== "") {
                $split_accountFromID = Input::validate($request->getParsedBody()['split_account_from'], Input::$INT, 17);
            } else {
                $split_accountFromID = null;
            }

            if (array_key_exists('split_account_to', $request->getParsedBody()) && $request->getParsedBody()['split_account_to'] !== "") {
                $split_accountToID = Input::validate($request->getParsedBody()['split_account_to'], Input::$INT, 18);
            } else {
                $split_accountToID = null;
            }

            if (array_key_exists('split_description', $request->getParsedBody()) && $request->getParsedBody()['split_description'] !== "") {
                $split_description = Input::validate($request->getParsedBody()['split_description'], Input::$STRING, 19);
            } else {
                $split_description = "";
            }

            if (array_key_exists('split_is_essential', $request->getParsedBody()) && $request->getParsedBody()['split_is_essential'] !== "") {
                $split_is_essential = (int)Input::validate($request->getParsedBody()['split_is_essential'], Input::$BOOLEAN, 20);
            } else {
                $split_is_essential = "";
            }

            $isEssential = (int)Input::validate($request->getParsedBody()['new_is_essential'], Input::$BOOLEAN, 21);


            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);

            $trxObj = TransactionModel::getWhere(
                [
                    "transaction_id" => $trxID
                ],
                ["amount", "date_timestamp", "type", "accounts_account_from_id", "accounts_account_to_id"]
            )[0];

            $oldAmount = $trxObj["amount"];
            $oldTimestamp = $trxObj["date_timestamp"];
            $oldType = $trxObj["type"];

            if (isset($trxObj["accounts_account_to_id"]))
                $oldAccountTo = $trxObj["accounts_account_to_id"];

            if (isset($trxObj["accounts_account_from_id"]))
                $oldAccountFrom = $trxObj["accounts_account_from_id"];

            // Make sure accounts belong to user
            if (!AccountModel::exists([
                "users_user_id" => $userID,
                "account_id" => $oldAccountFrom ?? $oldAccountTo,
            ])) {
                throw new BadValidationTypeException("Account not found!");
            }

            TransactionModel::editWhere([
                "transaction_id" => $trxID,
            ], [
                "date_timestamp" => $date_timestamp,
                "amount" => $amount,
                "type" => $type,
                "description" => $description,
                "entities_entity_id" => $entityID,
                "accounts_account_from_id" => $accountFrom,
                "accounts_account_to_id" => $accountTo,
                "categories_category_id" => $categoryID,
                "is_essential" => $isEssential,
            ], true);


            // Remove the effect of $oldAmount
            switch ($oldType) {
                case DEFAULT_TYPE_INCOME_TAG:
                    // Decrement $oldAmount to level it out
                    AccountModel::changeBalance($userID, $oldAccountTo, -$oldAmount, true);
                    AccountModel::recalculateBalanceForAccountIncrementally($oldAccountTo, $oldTimestamp - 1, time() + 1, true);
                    break;
                case DEFAULT_TYPE_EXPENSE_TAG:
                    // Increment $oldAmount to level it out, by reimbursing the amount
                    AccountModel::changeBalance($userID, $oldAccountFrom, $oldAmount, true);
                    AccountModel::recalculateBalanceForAccountIncrementally($oldAccountFrom, $oldTimestamp - 1, time() + 1, true);
                    break;
                case DEFAULT_TYPE_TRANSFER_TAG:
                    AccountModel::changeBalance($userID, $oldAccountFrom, $oldAmount, true);
                    AccountModel::changeBalance($userID, $oldAccountTo, -$oldAmount, true);
                    AccountModel::recalculateBalanceForAccountIncrementally($oldAccountTo, $oldTimestamp - 1, time() + 1, true);
                    AccountModel::recalculateBalanceForAccountIncrementally($oldAccountFrom, $oldTimestamp - 1, time() + 1, true);
                    break;
            }

            // Add the effect of the new $amount
            switch ($type) {
                case DEFAULT_TYPE_INCOME_TAG:
                    // Decrement $oldAmount to level it out
                    //AccountModel::changeBalance($userID, $accountTo, $amount, true);
                    AccountModel::setNewAccountBalance($userID, $accountTo,
                        AccountModel::recalculateBalanceForAccountIncrementally($accountTo, min($oldTimestamp, $date_timestamp) - 1, time() + 1, true),
                        true);

                    break;
                case DEFAULT_TYPE_EXPENSE_TAG:
                    // Increment $oldAmount to level it out, by reimbursing the amount
                    //AccountModel::changeBalance($userID, $accountFrom, -$amount, true);
                    AccountModel::setNewAccountBalance($userID, $accountFrom,
                        AccountModel::recalculateBalanceForAccountIncrementally($accountFrom, min($oldTimestamp, $date_timestamp) - 1, time() + 1, true),
                        true);
                    break;
                case DEFAULT_TYPE_TRANSFER_TAG:
                    //AccountModel::changeBalance($userID, $accountFrom, -$amount, true);
                    //AccountModel::changeBalance($userID, $accountTo, +$amount, true);
                    AccountModel::setNewAccountBalance($userID, $accountTo,
                        AccountModel::recalculateBalanceForAccountIncrementally($accountTo, min($oldTimestamp, $date_timestamp) - 1, time() + 1, true),
                        true);
                    AccountModel::setNewAccountBalance($userID, $accountFrom,
                        AccountModel::recalculateBalanceForAccountIncrementally($accountFrom, min($oldTimestamp, $date_timestamp) - 1, time() + 1, true),
                        true);
                    break;
            }

            if ($isSplit) {
                TransactionModel::insert([
                    "date_timestamp" => $date_timestamp,
                    "amount" => $split_amount,
                    "type" => $split_type,
                    "description" => $split_description,
                    "entities_entity_id" => $split_entity_id,
                    "accounts_account_from_id" => $split_accountFromID,
                    "accounts_account_to_id" => $split_accountToID,
                    "categories_category_id" => $split_cat_id,
                    "is_essential" => $split_is_essential,
                ], true);
            }

            switch ($split_type) {
                case DEFAULT_TYPE_INCOME_TAG:
                    // Decrement $oldAmount to level it out
                    AccountModel::setNewAccountBalance($userID, $split_accountToID,
                        AccountModel::recalculateBalanceForAccountIncrementally($split_accountToID, min($oldTimestamp, $date_timestamp) - 1, time() + 1, true), true);
                    break;
                case DEFAULT_TYPE_EXPENSE_TAG:
                    // Increment $oldAmount to level it out, by reimbursing the amount
                    /*AccountModel::changeBalance($userID, $accountFrom, -$split_amount, true);*/
                    AccountModel::setNewAccountBalance($userID, $split_accountFromID,
                        AccountModel::recalculateBalanceForAccountIncrementally($split_accountFromID, min($oldTimestamp, $date_timestamp) - 1, time() + 1,
                            true), true);
                    break;
                case DEFAULT_TYPE_TRANSFER_TAG:
                    AccountModel::setNewAccountBalance($userID, $split_accountToID,
                        AccountModel::recalculateBalanceForAccountIncrementally($split_accountToID, min($oldTimestamp, $date_timestamp) - 1, time() + 1,
                            true), true);
                    AccountModel::setNewAccountBalance($userID, $split_accountFromID,
                        AccountModel::recalculateBalanceForAccountIncrementally($split_accountFromID, min($oldTimestamp, $date_timestamp) - 1, time() + 1,
                            true), true);
                    break;
            }
            UserModel::setLastUpdateTimestamp($userID, time(), true);
            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, "Transaction updated successfully!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function importTransactionsStep0(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
            } else {
                $mobile = false;
            }


            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);

            $outgoingArr = AccountModel::getAllAccountsForUserWithAmounts($userID, true, true);
            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, $outgoingArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    /**
     * Gets the imported transactions in this format:
     * {
     *  date, description, amount, type
     * }
     */
    public static function importTransactionsStep1(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            $accountID = Input::validate($request->getParsedBody()['account_id'], Input::$INT);
            $trxList = json_decode(Input::validate($request->getParsedBody()['trx_list'], Input::$ARRAY, 2), true);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
            } else {
                $mobile = false;
            }


            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);


            $outgoingArr = [];
            /**
             * fillData: trx[] => [date, description, amount, type, selectedCategoryID, selectedEntityID, accountFromID, accountToID],
             * categories: [],
             * entities: [],
             * accounts: [],
             */
            $outgoingArr["fillData"] = [];
            foreach ($trxList as $trx) {
                $trx["accounts_account_from_id"] = ($trx["type"] == DEFAULT_TYPE_INCOME_TAG) ? null : $accountID;
                $trx["accounts_account_to_id"] = ($trx["type"] != DEFAULT_TYPE_INCOME_TAG) ? null : $accountID;
                $foundRule = RuleModel::getRuleForTransaction($userID, $trx, true);
                /*print_r($foundRule);
                die();*/
                $outgoingArr["fillData"][] = [
                    "date" => $trx["date"],
                    "description" => $trx["description"],
                    "amount" => $trx["amount"],
                    "type" => $trx["type"],
                    "selectedCategoryID" => ($foundRule) ? $foundRule["assign_category_id"] : null,
                    "selectedEntityID" => ($foundRule) ? $foundRule["assign_entity_id"] : null,
                    "selectedAccountFromID" => ($trx["type"] == DEFAULT_TYPE_INCOME_TAG) ? (($foundRule) ? $foundRule["assign_account_from_id"] : null) : $accountID,
                    "selectedAccountToID" => ($trx["type"] == DEFAULT_TYPE_INCOME_TAG) ? $accountID : (($foundRule) ? $foundRule["assign_account_to_id"] : null),
                    "isEssential" => ($foundRule) ? $foundRule["assign_is_essential"] : "0",
                ];
                /*  array_push($outgoingArr["fillData"], [
                    "date" => $trx["date"],
                    "description" => $trx["description"],
                    "amount" => $trx["amount"],
                    "type" => $trx["type"],
                    "selectedCategoryID" => null,
                    "selectedEntityID" => null,
                    "accountFromID" => null,
                    "accountToID" => null
                ]); */
            }

            $outgoingArr["categories"] = CategoryModel::getWhere(["users_user_id" => $userID, "status" => DEFAULT_CATEGORY_ACTIVE_STATUS], ["category_id", "name"]);
            $outgoingArr["entities"] = EntityModel::getWhere(["users_user_id" => $userID], ["entity_id", "name"]);
            $outgoingArr["accounts"] = AccountModel::getWhere(["users_user_id" => $userID], ["account_id", "name"]);

            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, $outgoingArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    /**
     * Imports transactions in bulk
     */
    public static function
    importTransactionsStep2(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            $trxList = json_decode(Input::validate($request->getParsedBody()['trx_list'], Input::$ARRAY, 2), true);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
            } else {
                $mobile = false;
            }


            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);
            $importedTrxsCnt = 0;

            foreach ($trxList as $trx) {
                $date_timestamp = $trx["date_timestamp"];
                $amount = Input::convertFloatToIntegerAmount($trx["amount"]);
                $type = $trx["type"];
                $description = $trx["description"];
                $entityID = $trx["entity_id"];
                $accountFrom = (isset($trx["account_from_id"])) ? $trx["account_from_id"] : null;
                $accountTo = (isset($trx["account_to_id"])) ? $trx["account_to_id"] : null;
                $categoryID = $trx["category_id"];
                $isEssential = (int)$trx["is_essential"];

                if (!$date_timestamp || !$amount || !$type || (!$accountFrom && !$accountTo)) {
                    continue;
                }
                $importedTrxsCnt++;

                TransactionModel::insert([
                    "date_timestamp" => $date_timestamp, // in order to avoid diff trxs with same timestamp
                    "amount" => $amount,
                    "type" => $type,
                    "description" => $description,
                    "entities_entity_id" => $entityID,
                    "accounts_account_from_id" => $accountFrom,
                    "accounts_account_to_id" => $accountTo,
                    "categories_category_id" => $categoryID,
                    "is_essential" => $isEssential,
                ], true);


                switch ($type) {
                    case DEFAULT_TYPE_INCOME_TAG:
                        AccountModel::setNewAccountBalance($userID, $accountTo,
                            AccountModel::recalculateBalanceForAccountIncrementally($accountTo, $date_timestamp - 1, time() + 1, true),
                            true);
                        break;
                    case DEFAULT_TYPE_EXPENSE_TAG:
                        AccountModel::setNewAccountBalance($userID, $accountFrom,
                            AccountModel::recalculateBalanceForAccountIncrementally($accountFrom, $date_timestamp - 1, time() + 1, true),
                            true);
                        break;
                    case DEFAULT_TYPE_TRANSFER_TAG:
                        AccountModel::setNewAccountBalance($userID, $accountTo,
                            AccountModel::recalculateBalanceForAccountIncrementally($accountTo, $date_timestamp - 1, time() + 1, true),
                            true);
                        AccountModel::setNewAccountBalance($userID, $accountFrom,
                            AccountModel::recalculateBalanceForAccountIncrementally($accountFrom, $date_timestamp - 1, time() + 1, true),
                            true);
                        break;
                }
            }

            UserModel::setLastUpdateTimestamp($userID, time(), true);
            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, "$importedTrxsCnt transactions successfully imported!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function getTransactionsForUserByPage(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
            } else {
                $mobile = false;
            }

            if ($request->getQueryParams() != null && array_key_exists('page_size', $request->getQueryParams())) {
                $pageSize = Input::validate($request->getQueryParams()['page_size'], Input::$INT, 4);
            } else {
                $pageSize = DEFAULT_TRANSACTIONS_FETCH_LIMIT;
            }

            $page = Input::validate($args['page'], Input::$INT, 5);

            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);
            $trxArr = TransactionModel::getTransactionsForUserByPage($userID, $page, $pageSize, true);
            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, $trxArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function autoCategorizeTransaction(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            $trx["description"] = Input::validate($request->getParsedBody()['description'], Input::$STRING, 2);
            $trx["amount"] = Input::validate($request->getParsedBody()['amount'], Input::$FLOAT, 3);
            $trx["type"] = Input::validate($request->getParsedBody()['type'], Input::$STRICT_STRING, 4);
            $trx["accounts_account_from_id"] = Input::validate($request->getParsedBody()['account_from_id'], Input::$INT, 5);
            $trx["accounts_account_to_id"] = Input::validate($request->getParsedBody()['account_to_id'], Input::$INT, 6);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 7);
            } else {
                $mobile = false;
            }


            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);

            $outgoingArr = [];
            /**
             * fillData: trx[] => [date, description, amount, type, selectedCategoryID, selectedEntityID, accountFromID, accountToID],
             * categories: [],
             * entities: [],
             * accounts: [],
             */
            // Set trx object to ignore matching certain fields
            $trx["selectedCategoryID"] = RuleModel::RULES_MATCHING_IGNORE;
            $trx["selectedEntityID"] = RuleModel::RULES_MATCHING_IGNORE;

            // Rule matching
            $foundRule = RuleModel::getRuleForTransaction($userID, $trx, true);
            $outgoing["matching_rule"] = $foundRule ? $foundRule["rule_id"] : null;
            $outgoing["date"] = array_key_exists("date", $trx) ? $trx["date"] : null;
            $outgoing["description"] = array_key_exists("description", $trx) ? $trx["description"] : null;
            $outgoing["amount"] = array_key_exists("amount", $trx) ? $trx["amount"] : null;
            $outgoing["type"] = array_key_exists("type", $trx) ? $trx["type"] : null;
            $outgoing["selectedCategoryID"] = ($foundRule) ? $foundRule["assign_category_id"] : null;
            $outgoing["selectedEntityID"] = ($foundRule) ? $foundRule["assign_entity_id"] : null;
            $outgoing["selectedAccountFromID"] = (($foundRule) ? $foundRule["assign_account_from_id"] : null);
            $outgoing["selectedAccountToID"] = (($foundRule) ? $foundRule["assign_account_to_id"] : null);
            $outgoing["isEssential"] = (($foundRule) ? $foundRule["assign_is_essential"] : null);

            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, $outgoing);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }
}

$app->get('/trxs/', 'Transactions::getAllTransactionsForUser');
$app->get('/trxs/inMonthAndCategory', 'Transactions::getAllTransactionsForUserInCategoryAndInMonth');
$app->post('/trxs/step0', 'Transactions::addTransactionStep0');
$app->post('/trxs/step1', 'Transactions::addTransaction');
$app->delete('/trxs/', 'Transactions::removeTransaction');
$app->put('/trxs/', 'Transactions::editTransaction');
$app->post('/trxs/import/step0', 'Transactions::importTransactionsStep0');
$app->post('/trxs/import/step1', 'Transactions::importTransactionsStep1');
$app->post('/trxs/import/step2', 'Transactions::importTransactionsStep2');
$app->get('/trxs/page/{page}', 'Transactions::getTransactionsForUserByPage');
$app->post('/trxs/auto-cat-trx', 'Transactions::autoCategorizeTransaction');

