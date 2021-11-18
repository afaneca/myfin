<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Scheb\YahooFinanceApi\ApiClient;

require_once './consts.php';

class InvestAssets
{
    const DEBUG_MODE = true; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

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

            return sendResponse($response, EnsoShared::$REST_OK, $assetsArr);
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
            $units = Input::validate($request->getParsedBody()['units'], Input::$FLOAT, 5);

            if (array_key_exists('ticker', $request->getParsedBody())) {
                $ticker = Input::validate($request->getParsedBody()['ticker'], Input::$STRING, 6);
            } else {
                $ticker = "";
            }

            if (array_key_exists('broker', $request->getParsedBody())) {
                $broker = Input::validate($request->getParsedBody()['broker'], Input::$STRING, 7);
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
                "units" => $units,
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

}

$app->get('/invest/assets/', 'InvestAssets::getAllAssetsForUser');
$app->post('/invest/assets/', 'InvestAssets::addAsset');