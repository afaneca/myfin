<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once 'consts.php';

class Accounts
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

    public static function getAllAccountsForUser(Request $request, Response $response, $args)
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

            $accsArr = AccountModel::getAllAccountsForUserWithAmounts($userID);

            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, $accsArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function addAccount(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int) Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            $name = Input::validate($request->getParsedBody()['name'], Input::$STRING, 3);
            $type = Input::validate($request->getParsedBody()['type'], Input::$STRING, 4);
            $description = Input::validate($request->getParsedBody()['description'], Input::$STRING, 5);
            $status = Input::validate($request->getParsedBody()['status'], Input::$STRING, 6);
            $excludeFromBudgets = (int) Input::validate($request->getParsedBody()['exclude_from_budgets'], Input::$BOOLEAN, 7);
            $currentBalance = Input::convertFloatToInteger(Input::validate($request->getParsedBody()['current_balance'], Input::$FLOAT, 8));

            if (
                $type !== "CHEAC" && $type !== "SAVAC"
                && $type !== "INVAC" && $type !== "CREAC"
                && $type !== "OTHAC"
            ) {
                throw new BadValidationTypeException("Account type not valid!");
            }

            /* Auth - token validation */ {
                if (!self::DEBUG_MODE) {
                    AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
                }
            }

            /* Execute Operations */
            /* $db = new EnsoDB(true);

            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            $userID = UserModel::getUserIdByName($authusername, false);

            $accountID = AccountModel::insert([
                "name" => $name,
                "type" => $type,
                "description" => $description,
                "exclude_from_budgets" => $excludeFromBudgets,
                "status" => $status,
                "users_user_id" => $userID,
            ], false);



            BalanceModel::insert(
                [
                    "date_timestamp" => time(),
                    "amount" => $currentBalance,
                    "accounts_account_id" => intval($accountID)
                ],
                false
            );
            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "New account added!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (BadValidationTypeException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->__toString());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function removeAccount(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int) Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            $accountID = Input::validate($request->getParsedBody()['account_id'], Input::$INT, 3);

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
                "accounts_account_from_id" => $accountID
            ]);

            TransactionModel::delete([
                "accounts_account_to_id" => $accountID
            ]);

            BalanceModel::delete([
                "accounts_account_id" => $accountID
            ], false);



            AccountModel::delete([
                "account_id" => $accountID,
                "users_user_id" => $userID,
            ], false);

            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "Account Removed!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function editAccount(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int) Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            $accountID = Input::validate($request->getParsedBody()['account_id'], Input::$INT, 3);
            $newName = Input::validate($request->getParsedBody()['new_name'], Input::$STRING, 4);
            $newType = Input::validate($request->getParsedBody()['new_type'], Input::$STRING, 5);
            $newDescription = Input::validate($request->getParsedBody()['new_description'], Input::$STRING, 6);
            $newStatus = Input::validate($request->getParsedBody()['new_status'], Input::$STRING, 7);
            $excludeFromBudgets = (int) Input::validate($request->getParsedBody()['exclude_from_budgets'], Input::$BOOLEAN, 8);
            $currentBalance = Input::convertFloatToInteger(Input::validate($request->getParsedBody()['current_balance'], Input::$FLOAT, 9));

            if (
                $newType !== "CHEAC" && $newType !== "SAVAC"
                && $newType !== "INVAC" && $newType !== "CREAC"
                && $newType !== "OTHAC"
            ) {
                throw new BadValidationTypeException("New account type not valid!");
            }

            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            /* $db = new EnsoDB(true);

                false
            );
            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            $userID = UserModel::getUserIdByName($authusername, false);

            AccountModel::editWhere(
                [
                    "account_id" => $accountID,
                    "users_user_id" => $userID,
                ],
                [
                    "name" => $newName,
                    "type" => $newType,
                    "description" => $newDescription,
                    "exclude_from_budgets" => $excludeFromBudgets,
                    "status" => $newStatus
                ],
                false
            );

            BalanceModel::insert([
                "accounts_account_id" => $accountID,
                "date_timestamp" => time(),
                "amount" => $currentBalance
            ]);

            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "Account Updated!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (BadValidationTypeException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->__toString());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }
}

$app->get('/accounts/', 'Accounts::getAllAccountsForUser');
$app->post('/accounts/', 'Accounts::addAccount');
$app->delete('/accounts/', 'Accounts::removeAccount');
$app->put('/accounts/', 'Accounts::editAccount');
