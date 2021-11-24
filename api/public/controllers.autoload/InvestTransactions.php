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
            $res = "";

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
            $totalPrice = Input::convertFloatToInteger(Input::validate($request->getParsedBody()['total_price'], Input::$FLOAT, 5));
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
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();


            $transactionId = InvestTransactionModel::insert([
                "date_timestamp" => $date,
                "units" => $units,
                "total_price" => $totalPrice,
                "note" => $note,
                "type" => $type,
                "invest_assets_asset_id" => $assetID,
                "created_at" => time(),
                "updated_at" => time(),
            ], true);

            /* Increment units in asset model */
            $changeInUnits = $units;
            if ($type === DEFAULT_INVESTING_TRANSACTIONS_SELL) {
                $changeInUnits *= -1;
            }

            /* Recalculate snapshot */
            $latestSnapshot = InvestAssetEvoSnapshotModel::recalculateSnapshotForAssetsIncrementally($assetID, $date - 1, time() + 1, true);
            InvestAssetModel::editWhere(["asset_id" => $assetID], ["units" => $latestSnapshot["units"]], true);

            $db->getDB()->commit();

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
}

$app->get('/invest/trx/', 'InvestTransactions::getAllTransactionsForUser');
$app->post('/invest/trx/', 'InvestTransactions::addTransaction');