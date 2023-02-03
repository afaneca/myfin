<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once './consts.php';

class InvestTransactions
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

            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            $userID = UserModel::getUserIdByName($authusername, false);
            $res = InvestTransactionModel::getAllTransactionsForUser($userID);

            return sendResponse($response, EnsoShared::$REST_OK, $res);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function addTransaction(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            $date = Input::validate($request->getParsedBody()['date_timestamp'], Input::$INT, 3);
            $note = Input::validate($request->getParsedBody()['note'], Input::$STRING, 4);
            $totalPrice = Input::convertFloatToIntegerAmount(Input::validate($request->getParsedBody()['total_price'], Input::$FLOAT, 5));
            $units = Input::validate($request->getParsedBody()['units'], Input::$FLOAT, 6);
            $assetID = Input::validate($request->getParsedBody()['asset_id'], Input::$INT, 7);
            $type = Input::validate($request->getParsedBody()['type'], Input::$STRICT_STRING, 8);
            if (
                $type !== DEFAULT_INVESTING_TRANSACTIONS_BUY && $type !== DEFAULT_INVESTING_TRANSACTIONS_SELL
            ) {
                throw new BadValidationTypeException("Transaction type not valid!");
            }

            /* Auth - token validation */ {
                if (!self::DEBUG_MODE) {
                    AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
                }
            }
            $userID = UserModel::getUserIdByName($authusername, true);

            /* Make sure user owns the asset with the provided asset_id */
            if (!InvestAssetModel::exists(["users_user_id" => $userID, "asset_id" => $assetID])) {
                throw new AuthenticationException("Asset not found.");
            }

            /* Execute Operations */
            InvestTransactionModel::addTransaction($date, $units, $totalPrice, $note, $type, $assetID, true);

            return sendResponse($response, EnsoShared::$REST_OK, "New transaction added!");
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

            $trxId = Input::validate($args['id'], Input::$INT, 2);

            /* Auth - token validation */ {
                if (!self::DEBUG_MODE) {
                    AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
                }
            }
            $userID = UserModel::getUserIdByName($authusername, true);

            /* Execute Operations */
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $asset = InvestTransactionModel::getWhere(["transaction_id" => $trxId], ["invest_assets_asset_id", "date_timestamp"])[0];
            InvestTransactionModel::deleteTransactionForUser($trxId, $userID, true);

            /* Recalculate snapshot */
            $latestSnapshot = InvestAssetEvoSnapshotModel::recalculateSnapshotForAssetsIncrementally($asset["invest_assets_asset_id"], $asset["date_timestamp"] - 1, time() + 1, true);
            InvestAssetModel::editWhere(["asset_id" => $asset["invest_assets_asset_id"]], ["units" => $latestSnapshot["units"]], true);

            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, "Transaction successfully removed!");
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

    public static function editTransaction(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }
            $trxID = Input::validate($args['id'], Input::$INT, 3);
            $date = Input::validate($request->getParsedBody()['date_timestamp'], Input::$INT, 4);
            $note = Input::validate($request->getParsedBody()['note'], Input::$STRING, 5);
            $totalPrice = Input::convertFloatToIntegerAmount(Input::validate($request->getParsedBody()['total_price'], Input::$FLOAT, 6));
            $units = Input::validate($request->getParsedBody()['units'], Input::$FLOAT, 7);
            $assetID = Input::validate($request->getParsedBody()['asset_id'], Input::$INT, 8);
            $type = Input::validate($request->getParsedBody()['type'], Input::$STRICT_STRING, 9);
            if (
                $type !== DEFAULT_INVESTING_TRANSACTIONS_BUY && $type !== DEFAULT_INVESTING_TRANSACTIONS_SELL
            ) {
                throw new BadValidationTypeException("Transaction type not valid!");
            }

            /* Auth - token validation */ {
                if (!self::DEBUG_MODE) {
                    AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
                }
            }
            $userID = UserModel::getUserIdByName($authusername, true);

            /* Make sure user owns the asset with the provided asset_id */
            if (!InvestAssetModel::exists(["users_user_id" => $userID, "asset_id" => $assetID])) {
                throw new AuthenticationException("Asset not found.");
            }

            /* Execute Operations */
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            /* Check transaction belongs to user */
            $trx = InvestAssetModel::getTransactionForUser($trxID, $userID, true);
            if (!$trx) {
                throw new AuthenticationException("Transaction ID not found.");
            }

            if (!InvestAssetModel::exists(["asset_id" => $assetID, "users_user_id" => $userID])) {
                throw new AuthenticationException("Asset ID not found.");
            }

            InvestTransactionModel::editWhere([
                "transaction_id" => $trxID,
            ], [
                "date_timestamp" => $date,
                "units" => $units,
                "total_price" => $totalPrice,
                "note" => $note,
                "type" => $type,
                "invest_assets_asset_id" => $assetID,
                "updated_at" => time(),
            ], true);

            /* Recalculate snapshot */
            $latestSnapshot = InvestAssetEvoSnapshotModel::recalculateSnapshotForAssetsIncrementally($assetID, $date - 1, time() + 1, true);
            InvestAssetModel::editWhere(["asset_id" => $assetID], ["units" => $latestSnapshot["units"]], true);

            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, "Transaction successfully updated!");
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

$app->get('/invest/trx/', 'InvestTransactions::getAllTransactionsForUser');
$app->post('/invest/trx/', 'InvestTransactions::addTransaction');
$app->delete('/invest/trx/{id}', 'InvestTransactions::removeTransaction');
$app->put('/invest/trx/{id}', 'InvestTransactions::editTransaction');