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
                $mobile = (int) Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
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
            $userID = UserModel::getUserIdByName($authusername, false);

            /* $accsArr = AccountModel::getWhere(
            ["users_user_id" => $userID],
            ["account_id", "name", "type", "description"]

            ); */

            $trxArr = TransactionModel::getAllTransactionsForUser($userID, false);

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
                $mobile = (int) Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 9);
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
            $outgoingArr['categories'] = CategoryModel::getWhere(["users_user_id" => $userID], ["category_id", "name",  "description"]);

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

            $amount = Input::validate($request->getParsedBody()['amount'], Input::$FLOAT, 2);
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
                $mobile = (int) Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 10);
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
                $mobile = (int) Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
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

            TransactionModel::delete([
                "transaction_id" => $trxID
            ]);

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

            $amount = Input::validate($request->getParsedBody()['new_amount'], Input::$FLOAT, 2);
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
                $mobile = (int) Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 10);
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
}

$app->get('/trxs/', 'Transactions::getAllTransactionsForUser');
$app->post('/trxs/step0', 'Transactions::addTransactionStep0');
$app->post('/trxs/step1', 'Transactions::addTransaction');
$app->delete('/trxs/', 'Transactions::removeTransaction');
$app->put('/trxs/', 'Transactions::editTransaction');
