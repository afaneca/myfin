<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once 'consts.php';

class Transactions
{
    const DEBUG_MODE = true; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

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
            /* $db = new EnsoDB(true);

            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            $userID = UserModel::getUserIdByName($authusername, false);

            /* $accsArr = AccountModel::getWhere(
            ["users_user_id" => $userID],
            ["account_id", "name", "type", "description"]

            ); */

            $trxArr = TransactionModel::getAllTransactionsForUser($userID, $trxLimit, false);

            /* $db->getDB()->commit(); */

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
            /* $db = new EnsoDB(true);

            $db->getDB()->beginTransaction(); */

            $userID = UserModel::getUserIdByName($authusername, false);

            $outgoingArr = array();
            $outgoingArr['entities'] = array();
            $outgoingArr['categories'] = array();
            $outgoingArr['type'] = array();
            $outgoingArr['accounts'] = array();

            /* Entities */
            $outgoingArr['entities'] = EntityModel::getWhere(["users_user_id" => $userID], ["entity_id", "name"]);

            /* Categories */
            $outgoingArr['categories'] = CategoryModel::getWhere(["users_user_id" => $userID], ["category_id", "name", "description"]);

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


            /* $db->getDB()->commit(); */

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

            $amount = Input::convertFloatToInteger(Input::validate($request->getParsedBody()['amount'], Input::$FLOAT, 2));
            $type = Input::validate($request->getParsedBody()['type'], Input::$STRICT_STRING, 3);
            $description = Input::validate($request->getParsedBody()['description'], Input::$STRING, 4);

            if (array_key_exists('entity_id', $request->getParsedBody())) {
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

            $categoryID = Input::validate($request->getParsedBody()['category_id'], Input::$INT, 8);

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


            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            /* $db = new EnsoDB(true);

            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            //$userID = UserModel::getUserIdByName($authusername, false);

            /* $accsArr = AccountModel::getWhere(
            ["users_user_id" => $userID],
            ["account_id", "name", "type", "description"]

            ); */

            TransactionModel::insert([
                "date_timestamp" => $date_timestamp,
                "amount" => $amount,
                "type" => $type,
                "description" => $description,
                "entities_entity_id" => $entityID,
                "accounts_account_from_id" => $accountFrom,
                "accounts_account_to_id" => $accountTo,
                "categories_category_id" => $categoryID
            ]);

            $userID = UserModel::getUserIdByName($authusername, false);

            switch ($type) {
                case DEFAULT_TYPE_INCOME_TAG:
                    AccountModel::changeBalance($userID, $accountTo, $amount, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($accountTo, $date_timestamp - 1, time() + 1, false);
                    break;
                case DEFAULT_TYPE_EXPENSE_TAG:
                    AccountModel::changeBalance($userID, $accountFrom, -$amount, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($accountFrom, $date_timestamp - 1, time() + 1, false);
                    break;
                case DEFAULT_TYPE_TRANSFER_TAG:
                    AccountModel::changeBalance($userID, $accountFrom, -$amount, false);
                    AccountModel::changeBalance($userID, $accountTo, $amount, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($accountTo, $date_timestamp - 1, time() + 1, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($accountFrom, $date_timestamp - 1, time() + 1, false);
                    break;
            }


            /* $db->getDB()->commit(); */

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
            /* $db = new EnsoDB(true);

            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            $userID = UserModel::getUserIdByName($authusername, false);


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

            TransactionModel::delete([
                "transaction_id" => $trxID
            ]);

            // Remove the effect of $oldAmount
            switch ($oldType) {
                case DEFAULT_TYPE_INCOME_TAG:
                    // Decrement $oldAmount to level it out
                    AccountModel::changeBalance($userID, $oldAccountTo, -$oldAmount, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($oldAccountTo, $oldTimestamp - 1, time() + 1, false);
                    break;
                case DEFAULT_TYPE_EXPENSE_TAG:
                    // Increment $oldAmount to level it out, by reimbursing the amount
                    AccountModel::changeBalance($userID, $oldAccountFrom, $oldAmount, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($oldAccountFrom, $oldTimestamp - 1, time() + 1, false);
                    break;
                case DEFAULT_TYPE_TRANSFER_TAG:
                    AccountModel::changeBalance($userID, $oldAccountFrom, $oldAmount, false);
                    AccountModel::changeBalance($userID, $oldAccountTo, -$oldAmount, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($oldAccountFrom, $oldTimestamp - 1, time() + 1, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($oldAccountTo, $oldTimestamp - 1, time() + 1, false);
                    break;
            }

            /* $db->getDB()->commit(); */

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

            $amount = Input::convertFloatToInteger(Input::validate($request->getParsedBody()['new_amount'], Input::$FLOAT, 2));
            $type = Input::validate($request->getParsedBody()['new_type'], Input::$STRICT_STRING, 3);
            $description = Input::validate($request->getParsedBody()['new_description'], Input::$STRING, 4);

            if (array_key_exists('new_entity_id', $request->getParsedBody())) {
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

            $categoryID = Input::validate($request->getParsedBody()['new_category_id'], Input::$INT, 8);

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

            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            /* $db = new EnsoDB(true);

            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            //$userID = UserModel::getUserIdByName($authusername, false);

            /* $accsArr = AccountModel::getWhere(
            ["users_user_id" => $userID],
            ["account_id", "name", "type", "description"]

            ); */
            $userID = UserModel::getUserIdByName($authusername, false);

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
                "categories_category_id" => $categoryID
            ]);

            // Remove the effect of $oldAmount
            switch ($oldType) {
                case DEFAULT_TYPE_INCOME_TAG:
                    // Decrement $oldAmount to level it out
                    AccountModel::changeBalance($userID, $oldAccountTo, -$oldAmount, false);
                    //AccountModel::recalculateIterativelyBalanceForAccount($oldAccountTo, $oldTimestamp - 1, time() + 1, false);
                    break;
                case DEFAULT_TYPE_EXPENSE_TAG:
                    // Increment $oldAmount to level it out, by reimbursing the amount
                    AccountModel::changeBalance($userID, $oldAccountFrom, $oldAmount, false);
                    //AccountModel::recalculateIterativelyBalanceForAccount($oldAccountFrom, $oldTimestamp - 1, time() + 1, false);
                    break;
                case DEFAULT_TYPE_TRANSFER_TAG:
                    AccountModel::changeBalance($userID, $oldAccountFrom, $oldAmount, false);
                    AccountModel::changeBalance($userID, $oldAccountTo, -$oldAmount, false);
                    /*AccountModel::recalculateIterativelyBalanceForAccount($oldAccountTo, $oldTimestamp - 1, time() + 1, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($oldAccountFrom, $oldTimestamp - 1, time() + 1, false);*/
                    break;
            }

            // Add the effect of the new $amount
            switch ($type) {
                case DEFAULT_TYPE_INCOME_TAG:
                    // Decrement $oldAmount to level it out
                    AccountModel::changeBalance($userID, $accountTo, $amount, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($accountTo, min($oldTimestamp, $date_timestamp) - 1, time() + 1, false);
                    break;
                case DEFAULT_TYPE_EXPENSE_TAG:
                    // Increment $oldAmount to level it out, by reimbursing the amount
                    AccountModel::changeBalance($userID, $accountFrom, -$amount, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($accountFrom, min($oldTimestamp, $date_timestamp) - 1, time() + 1, false);
                    break;
                case DEFAULT_TYPE_TRANSFER_TAG:
                    AccountModel::changeBalance($userID, $accountFrom, -$amount, false);
                    AccountModel::changeBalance($userID, $accountTo, +$amount, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($accountTo, min($oldTimestamp, $date_timestamp) - 1, time() + 1, false);
                    AccountModel::recalculateIterativelyBalanceForAccount($accountFrom, min($oldTimestamp, $date_timestamp) - 1, time() + 1, false);
                    break;
            }

            /* $db->getDB()->commit(); */

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


            $userID = UserModel::getUserIdByName($authusername, false);

            //$outgoingArr = AccountModel::getWhere(["users_user_id" => $userID], ["account_id", "name"]);
            $outgoingArr = AccountModel::getAllAccountsForUserWithAmounts($userID);
            /* $db->getDB()->commit(); */

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


            $userID = UserModel::getUserIdByName($authusername, false);


            $outgoingArr = [];
            /**
             * fillData: trx[] => [date, description, amount, type, selectedCategoryID, selectedEntityID, accountFromID, accountToID],
             * categories: [],
             * entities: [],
             * accounts: [],
             */
            $outgoingArr["fillData"] = [];
            foreach ($trxList as $trx) {
                $outgoingArr["fillData"][] = [
                    "date" => $trx["date"],
                    "description" => $trx["description"],
                    "amount" => $trx["amount"],
                    "type" => $trx["type"],
                    "selectedCategoryID" => null,
                    "selectedEntityID" => null,
                    "selectedAccountFromID" => ($trx["type"] == DEFAULT_TYPE_INCOME_TAG) ? null : $accountID,
                    "selectedAccountToID" => ($trx["type"] == DEFAULT_TYPE_INCOME_TAG) ? $accountID : null
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

            $outgoingArr["categories"] = CategoryModel::getWhere(["users_user_id" => $userID], ["category_id", "name"]);
            $outgoingArr["entities"] = EntityModel::getWhere(["users_user_id" => $userID], ["entity_id", "name"]);
            $outgoingArr["accounts"] = AccountModel::getWhere(["users_user_id" => $userID], ["account_id", "name"]);

            /* $db->getDB()->commit(); */

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
    public static function importTransactionsStep2(Request $request, Response $response, $args)
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


            $userID = UserModel::getUserIdByName($authusername, false);
            $importedTrxsCnt = 0;

            foreach ($trxList as $trx) {
                $date_timestamp = $trx["date_timestamp"];
                $amount = Input::convertFloatToInteger($trx["amount"]);
                $type = $trx["type"];
                $description = $trx["description"];
                $entityID = $trx["entity_id"];
                $accountFrom = (isset($trx["account_from_id"])) ? $trx["account_from_id"] : null;
                $accountTo = (isset($trx["account_to_id"])) ? $trx["account_to_id"] : null;
                $categoryID = $trx["category_id"];

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
                    "categories_category_id" => $categoryID
                ]);


                switch ($type) {
                    case DEFAULT_TYPE_INCOME_TAG:
                        AccountModel::changeBalance($userID, $accountTo, $amount, true);
                        AccountModel::recalculateIterativelyBalanceForAccount($accountTo, $date_timestamp - 1, time() + 1, false);
                        break;
                    case DEFAULT_TYPE_EXPENSE_TAG:
                        AccountModel::changeBalance($userID, $accountFrom, -$amount, true);
                        AccountModel::recalculateIterativelyBalanceForAccount($accountFrom, $date_timestamp - 1, time() + 1, false);
                        break;
                    case DEFAULT_TYPE_TRANSFER_TAG:
                        AccountModel::changeBalance($userID, $accountFrom, -$amount, true);
                        AccountModel::changeBalance($userID, $accountTo, $amount, true);
                        AccountModel::recalculateIterativelyBalanceForAccount($accountTo, $date_timestamp - 1, time() + 1, false);
                        AccountModel::recalculateIterativelyBalanceForAccount($accountFrom, $date_timestamp - 1, time() + 1, false);
                        break;
                }
            }


            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "$importedTrxsCnt transactions successfully imported!");
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
$app->post('/trxs/step0', 'Transactions::addTransactionStep0');
$app->post('/trxs/step1', 'Transactions::addTransaction');
$app->delete('/trxs/', 'Transactions::removeTransaction');
$app->put('/trxs/', 'Transactions::editTransaction');
$app->post('/trxs/import/step0', 'Transactions::importTransactionsStep0');
$app->post('/trxs/import/step1', 'Transactions::importTransactionsStep1');
$app->post('/trxs/import/step2', 'Transactions::importTransactionsStep2');
