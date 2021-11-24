<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once './consts.php';

class InvestAssets
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

    public static function getAllAssetsForUser(Request $request, Response $response, $args)
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

            $assetsArr = InvestAssetModel::getAllAssetsForUser($userID);

            $res = array();

            foreach ($assetsArr as $asset) {
                $month = date('m', EnsoShared::now());
                $year = date('Y', EnsoShared::now());
                $snapshot = InvestAssetEvoSnapshotModel::getAssetSnapshotAtMonth($month, $year, $asset["asset_id"]);
                $investedValue = Input::convertIntegerToFloat($snapshot ? $snapshot["invested_amount"] : 0);
                $currentValue = Input::convertIntegerToFloat($snapshot ? $snapshot["current_value"] : 0);
                $roiValue = $currentValue - $investedValue;
                $roiPercentage = ($investedValue == 0) ? "∞" : ($roiValue / $investedValue) * 100;

                array_push($res, [
                        "asset_id" => $asset["asset_id"],
                        "name" => $asset["name"],
                        "ticker" => $asset["ticker"],
                        "type" => $asset["type"],
                        "units" => floatval($asset["units"]),
                        "broker" => $asset["broker"],
                        "invested_value" => $investedValue,
                        "current_value" => $currentValue,
                        "absolute_roi_value" => $roiValue,
                        "relative_roi_percentage" => $roiPercentage,
                    ]

                );
            }

            return sendResponse($response, EnsoShared::$REST_OK, $res);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function addAsset(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            $name = Input::validate($request->getParsedBody()['name'], Input::$STRING, 3);
            $type = Input::validate($request->getParsedBody()['type'], Input::$STRICT_STRING, 4);

            if (array_key_exists('ticker', $request->getParsedBody())) {
                $ticker = Input::validate($request->getParsedBody()['ticker'], Input::$STRING, 5);
            } else {
                $ticker = "";
            }

            if (array_key_exists('broker', $request->getParsedBody())) {
                $broker = Input::validate($request->getParsedBody()['broker'], Input::$STRING, 6);
            } else {
                $broker = "";
            }

            if (
                $type !== DEFAULT_ASSETS_TYPE_PPR && $type !== DEFAULT_ASSETS_TYPE_ETF
                && $type !== DEFAULT_ASSETS_TYPE_CRYPTO && $type !== DEFAULT_ASSETS_TYPE_FIXED_INCOME
                && $type !== DEFAULT_ASSETS_TYPE_INDEX_FUNDS
                && $type !== DEFAULT_ASSETS_TYPE_INVESTMENT_FUNDS
                && $type !== DEFAULT_ASSETS_TYPE_P2P
                && $type !== DEFAULT_ASSETS_TYPE_STOCKS
            ) {
                throw new BadValidationTypeException("Asset type not valid!");
            }

            /* Auth - token validation */ {
                if (!self::DEBUG_MODE) {
                    AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
                }
            }

            /* Execute Operations */
            /*$db = new EnsoDB(true);
            $db->getDB()->beginTransaction();*/
            $userID = UserModel::getUserIdByName($authusername/*, true*/);

            $assetID = InvestAssetModel::insert([
                "name" => $name,
                "ticker" => $ticker,
                "units" => 0,
                "type" => $type,
                "broker" => $broker,
                "users_user_id" => $userID,
                "created_at" => time(),
                "updated_at" => time(),
            ]/*, true*/);

            /*$db->getDB()->commit();*/

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

    public static function removeAsset(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            $assetID = Input::validate($args['id'], Input::$INT, 2);
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

            InvestAssetModel::delete([
                "users_user_id" => $userID,
                "asset_id" => $assetID,
            ]);

            return sendResponse($response, EnsoShared::$REST_OK, "Asset successfully removed!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function editAsset(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }
            $assetID = Input::validate($args['id'], Input::$INT, 2);
            $name = Input::validate($request->getParsedBody()['name'], Input::$STRING, 3);
            $type = Input::validate($request->getParsedBody()['type'], Input::$STRICT_STRING, 4);

            if (array_key_exists('ticker', $request->getParsedBody())) {
                $ticker = Input::validate($request->getParsedBody()['ticker'], Input::$STRING, 5);
            } else {
                $ticker = "";
            }

            if (array_key_exists('broker', $request->getParsedBody())) {
                $broker = Input::validate($request->getParsedBody()['broker'], Input::$STRING, 6);
            } else {
                $broker = "";
            }

            if (
                $type !== DEFAULT_ASSETS_TYPE_PPR && $type !== DEFAULT_ASSETS_TYPE_ETF
                && $type !== DEFAULT_ASSETS_TYPE_CRYPTO && $type !== DEFAULT_ASSETS_TYPE_FIXED_INCOME
                && $type !== DEFAULT_ASSETS_TYPE_INDEX_FUNDS
                && $type !== DEFAULT_ASSETS_TYPE_INVESTMENT_FUNDS
                && $type !== DEFAULT_ASSETS_TYPE_P2P
                && $type !== DEFAULT_ASSETS_TYPE_STOCKS
            ) {
                throw new BadValidationTypeException("Asset type not valid!");
            }

            /* Auth - token validation */ {
                if (!self::DEBUG_MODE) {
                    AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
                }
            }

            /* Execute Operations */
            /*$db = new EnsoDB(true);
            $db->getDB()->beginTransaction();*/
            $userID = UserModel::getUserIdByName($authusername/*, true*/);

            InvestAssetModel::editWhere(
                [
                    'users_user_id' => $userID,
                    'asset_id' => $assetID,
                ],
                [
                    "name" => $name,
                    "ticker" => $ticker,
                    "units" => 0,
                    "type" => $type,
                    "broker" => $broker,
                    "users_user_id" => $userID,
                    "updated_at" => time(),
                ]/*, true*/);

            /*$db->getDB()->commit();*/

            return sendResponse($response, EnsoShared::$REST_OK, "Account updated!");
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

    public static function updateCurrentAssetValue(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            $assetID = Input::validate($args['id'], Input::$INT, 2);
            $newValue = Input::validate($request->getParsedBody()["new_value"], Input::$FLOAT, 3);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 4);
            } else {
                $mobile = false;
            }

            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            $userID = UserModel::getUserIdByName($authusername, false);

            $month = date('m', EnsoShared::now());
            $year = date('Y', EnsoShared::now());
            $units = InvestAssetModel::getWhere(["users_user_id" => $userID, "asset_id" => $assetID], ["units"])[0]["units"];

            InvestAssetEvoSnapshotModel::updateCurrentAssetValue($month, $year, $assetID, $units, $newValue);

            return sendResponse($response, EnsoShared::$REST_OK, "Asset value successfully updated!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }
}

$app->get('/invest/assets/', 'InvestAssets::getAllAssetsForUser');
$app->post('/invest/assets/', 'InvestAssets::addAsset');
$app->delete('/invest/assets/{id}', 'InvestAssets::removeAsset');
$app->put('/invest/assets/{id}', 'InvestAssets::editAsset');
$app->put('/invest/assets/{id}/value', 'InvestAssets::updateCurrentAssetValue');