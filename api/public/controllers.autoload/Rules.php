<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once 'consts.php';

class Rules
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)


    public static function getAllRulesForUser(Request $request, Response $response, $args)
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
            /* $db = new EnsoDB(true);

            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            $userID = UserModel::getUserIdByName($authusername, false);

            $outputArr["rules"] = RuleModel::getWhere(["users_user_id" => $userID]);
            foreach ($outputArr["rules"] as &$rule) {
                if ($rule["matcher_amount_value"]) {
                    $rule["matcher_amount_value"] = Input::convertIntegerToFloat($rule["matcher_amount_value"]);
                }
            }
            $outputArr["categories"] = CategoryModel::getWhere(["users_user_id" => $userID], ["category_id", "name"]);
            $outputArr["entities"] = EntityModel::getWhere(["users_user_id" => $userID], ["entity_id", "name"]);
            $outputArr["accounts"] = AccountModel::getWhere(["users_user_id" => $userID], ["account_id", "name"]);


            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, $outputArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function addRule(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            if (array_key_exists('matcher_description_operator', $request->getParsedBody()) && $request->getParsedBody()['matcher_description_operator'] !== "") {
                $matcherDescriptionOperator = Input::validate($request->getParsedBody()['matcher_description_operator'], Input::$STRICT_STRING, 3);
            } else {
                $matcherDescriptionOperator = null;
            }

            if (array_key_exists('matcher_description_value', $request->getParsedBody()) && $request->getParsedBody()['matcher_description_value'] !== "") {
                $matcherDescriptionValue = Input::validate($request->getParsedBody()['matcher_description_value'], Input::$STRICT_STRING, 4);
            } else {
                $matcherDescriptionValue = null;
            }

            if (array_key_exists('matcher_amount_operator', $request->getParsedBody()) && $request->getParsedBody()['matcher_amount_operator'] !== "") {
                $matcherAmountOperator = Input::validate($request->getParsedBody()['matcher_amount_operator'], Input::$STRICT_STRING, 5);
            } else {
                $matcherAmountOperator = null;
            }

            if (array_key_exists('matcher_amount_value', $request->getParsedBody()) && $request->getParsedBody()['matcher_amount_value'] !== "") {
                $matcherAmountValue = Input::convertFloatToInteger(Input::validate($request->getParsedBody()['matcher_amount_value'], Input::$FLOAT, 6));
            } else {
                $matcherAmountValue = null;
            }

            if (array_key_exists('matcher_type_operator', $request->getParsedBody()) && $request->getParsedBody()['matcher_type_operator'] !== "") {
                $matcherTypeOperator = Input::validate($request->getParsedBody()['matcher_type_operator'], Input::$STRICT_STRING, 7);
            } else {
                $matcherTypeOperator = null;
            }

            if (array_key_exists('matcher_type_value', $request->getParsedBody()) && $request->getParsedBody()['matcher_type_value'] !== "") {
                $matcherTypeValue = Input::validate($request->getParsedBody()['matcher_type_value'], Input::$STRICT_STRING, 8);
            } else {
                $matcherTypeValue = null;
            }

            if (array_key_exists('matcher_account_to_id_operator', $request->getParsedBody()) && $request->getParsedBody()['matcher_account_to_id_operator'] !== "") {
                $matcherAccountToIDOperator = Input::validate($request->getParsedBody()['matcher_account_to_id_operator'], Input::$STRICT_STRING, 9);
            } else {
                $matcherAccountToIDOperator = null;
            }

            if (array_key_exists('matcher_account_to_id_value', $request->getParsedBody()) && $request->getParsedBody()['matcher_account_to_id_value'] !== "") {
                $matcherAccountToIDValue = Input::validate($request->getParsedBody()['matcher_account_to_id_value'], Input::$INT, 10);
            } else {
                $matcherAccountToIDValue = null;
            }

            if (array_key_exists('matcher_account_from_id_operator', $request->getParsedBody()) && $request->getParsedBody()['matcher_account_from_id_operator'] !== "") {
                $matcherAccountFromIDOperator = Input::validate($request->getParsedBody()['matcher_account_from_id_operator'], Input::$STRICT_STRING, 11);
            } else {
                $matcherAccountFromIDOperator = null;
            }

            if (array_key_exists('matcher_account_from_id_value', $request->getParsedBody()) && $request->getParsedBody()['matcher_account_from_id_value'] !== "") {
                $matcherAccountFromIDValue = Input::validate($request->getParsedBody()['matcher_account_from_id_value'], Input::$INT, 12);
            } else {
                $matcherAccountFromIDValue = null;
            }

            if (array_key_exists('assign_category_id', $request->getParsedBody()) && $request->getParsedBody()['assign_category_id'] !== "") {
                $assignCategoryID = Input::validate($request->getParsedBody()['assign_category_id'], Input::$INT, 13);
            } else {
                $assignCategoryID = null;
            }

            if (array_key_exists('assign_entity_id', $request->getParsedBody()) && $request->getParsedBody()['assign_entity_id'] !== "") {
                $assignEntityID = Input::validate($request->getParsedBody()['assign_entity_id'], Input::$INT, 14);
            } else {
                $assignEntityID = null;
            }

            if (array_key_exists('assign_account_to_id', $request->getParsedBody()) && $request->getParsedBody()['assign_account_to_id'] !== "") {
                $assignAccountToID = Input::validate($request->getParsedBody()['assign_account_to_id'], Input::$INT, 15);
            } else {
                $assignAccountToID = null;
            }

            if (array_key_exists('assign_account_from_id', $request->getParsedBody()) && $request->getParsedBody()['assign_account_from_id'] !== "") {
                $assignAccountFromID = Input::validate($request->getParsedBody()['assign_account_from_id'], Input::$INT, 16);
            } else {
                $assignAccountFromID = null;
            }

            if (array_key_exists('assign_type', $request->getParsedBody()) && $request->getParsedBody()['assign_type'] !== "") {
                $assignType = Input::validate($request->getParsedBody()['assign_type'], Input::$STRICT_STRING, 17);
            } else {
                $assignType = null;
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

            $rulesArr = RuleModel::insert(
                ["users_user_id" => $userID,
                    "matcher_description_operator" => $matcherDescriptionOperator,
                    "matcher_description_value" => $matcherDescriptionValue,
                    "matcher_amount_operator" => $matcherAmountOperator,
                    "matcher_amount_value" => $matcherAmountValue,
                    "matcher_type_operator" => $matcherTypeOperator,
                    "matcher_type_value" => $matcherTypeValue,
                    "matcher_account_to_id_operator" => $matcherAccountToIDOperator,
                    "matcher_account_to_id_value" => $matcherAccountToIDValue,
                    "matcher_account_from_id_operator" => $matcherAccountFromIDOperator,
                    "matcher_account_from_id_value" => $matcherAccountFromIDValue,
                    "assign_category_id" => $assignCategoryID,
                    "assign_entity_id" => $assignEntityID,
                    "assign_account_to_id" => $assignAccountToID,
                    "assign_account_from_id" => $assignAccountFromID,
                    "assign_type" => $assignType,
                ]
            );

            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "Rule successfully added.");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function editRule(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            if (array_key_exists('matcher_description_operator', $request->getParsedBody()) && $request->getParsedBody()['matcher_description_operator'] !== "") {
                $matcherDescriptionOperator = Input::validate($request->getParsedBody()['matcher_description_operator'], Input::$STRICT_STRING, 3);
            } else {
                $matcherDescriptionOperator = null;
            }

            if (array_key_exists('matcher_description_value', $request->getParsedBody()) && $request->getParsedBody()['matcher_description_value'] !== "") {
                $matcherDescriptionValue = Input::validate($request->getParsedBody()['matcher_description_value'], Input::$STRICT_STRING, 4);
            } else {
                $matcherDescriptionValue = null;
            }

            if (array_key_exists('matcher_amount_operator', $request->getParsedBody()) && $request->getParsedBody()['matcher_amount_operator'] !== "") {
                $matcherAmountOperator = Input::validate($request->getParsedBody()['matcher_amount_operator'], Input::$STRICT_STRING, 5);
            } else {
                $matcherAmountOperator = null;
            }

            if (array_key_exists('matcher_amount_value', $request->getParsedBody()) && $request->getParsedBody()['matcher_amount_value'] !== "") {
                $matcherAmountValue = Input::convertFloatToInteger(Input::validate($request->getParsedBody()['matcher_amount_value'], Input::$FLOAT, 6));
            } else {
                $matcherAmountValue = null;
            }

            if (array_key_exists('matcher_type_operator', $request->getParsedBody()) && $request->getParsedBody()['matcher_type_operator'] !== "") {
                $matcherTypeOperator = Input::validate($request->getParsedBody()['matcher_type_operator'], Input::$STRICT_STRING, 7);
            } else {
                $matcherTypeOperator = null;
            }

            if (array_key_exists('matcher_type_value', $request->getParsedBody()) && $request->getParsedBody()['matcher_type_value'] !== "") {
                $matcherTypeValue = Input::validate($request->getParsedBody()['matcher_type_value'], Input::$STRICT_STRING, 8);
            } else {
                $matcherTypeValue = null;
            }

            if (array_key_exists('matcher_account_to_id_operator', $request->getParsedBody()) && $request->getParsedBody()['matcher_account_to_id_operator'] !== "") {
                $matcherAccountToIDOperator = Input::validate($request->getParsedBody()['matcher_account_to_id_operator'], Input::$STRICT_STRING, 9);
            } else {
                $matcherAccountToIDOperator = null;
            }

            if (array_key_exists('matcher_account_to_id_value', $request->getParsedBody()) && $request->getParsedBody()['matcher_account_to_id_value'] !== "") {
                $matcherAccountToIDValue = Input::validate($request->getParsedBody()['matcher_account_to_id_value'], Input::$INT, 10);
            } else {
                $matcherAccountToIDValue = null;
            }

            if (array_key_exists('matcher_account_from_id_operator', $request->getParsedBody()) && $request->getParsedBody()['matcher_account_from_id_operator'] !== "") {
                $matcherAccountFromIDOperator = Input::validate($request->getParsedBody()['matcher_account_from_id_operator'], Input::$STRICT_STRING, 11);
            } else {
                $matcherAccountFromIDOperator = null;
            }

            if (array_key_exists('matcher_account_from_id_value', $request->getParsedBody()) && $request->getParsedBody()['matcher_account_from_id_value'] !== "") {
                $matcherAccountFromIDValue = Input::validate($request->getParsedBody()['matcher_account_from_id_value'], Input::$INT, 12);
            } else {
                $matcherAccountFromIDValue = null;
            }

            if (array_key_exists('assign_category_id', $request->getParsedBody()) && $request->getParsedBody()['assign_category_id'] !== "") {
                $assignCategoryID = Input::validate($request->getParsedBody()['assign_category_id'], Input::$INT, 13);
            } else {
                $assignCategoryID = null;
            }

            if (array_key_exists('assign_entity_id', $request->getParsedBody()) && $request->getParsedBody()['assign_entity_id'] !== "") {
                $assignEntityID = Input::validate($request->getParsedBody()['assign_entity_id'], Input::$INT, 14);
            } else {
                $assignEntityID = null;
            }

            if (array_key_exists('assign_account_to_id', $request->getParsedBody()) && $request->getParsedBody()['assign_account_to_id'] !== "") {
                $assignAccountToID = Input::validate($request->getParsedBody()['assign_account_to_id'], Input::$INT, 15);
            } else {
                $assignAccountToID = null;
            }

            if (array_key_exists('assign_account_from_id', $request->getParsedBody()) && $request->getParsedBody()['assign_account_from_id'] !== "") {
                $assignAccountFromID = Input::validate($request->getParsedBody()['assign_account_from_id'], Input::$INT, 16);
            } else {
                $assignAccountFromID = null;
            }

            if (array_key_exists('assign_type', $request->getParsedBody()) && $request->getParsedBody()['assign_type'] !== "") {
                $assignType = Input::validate($request->getParsedBody()['assign_type'], Input::$STRICT_STRING, 17);
            } else {
                $assignType = null;
            }

            $ruleID = Input::validate($request->getParsedBody()["rule_id"], Input::$INT, 18);

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

            RuleModel::editWhere(
                ["rule_id" => $ruleID],
                ["users_user_id" => $userID,
                    "matcher_description_operator" => $matcherDescriptionOperator,
                    "matcher_description_value" => $matcherDescriptionValue,
                    "matcher_amount_operator" => $matcherAmountOperator,
                    "matcher_amount_value" => $matcherAmountValue,
                    "matcher_type_operator" => $matcherTypeOperator,
                    "matcher_type_value" => $matcherTypeValue,
                    "matcher_account_to_id_operator" => $matcherAccountToIDOperator,
                    "matcher_account_to_id_value" => $matcherAccountToIDValue,
                    "matcher_account_from_id_operator" => $matcherAccountFromIDOperator,
                    "matcher_account_from_id_value" => $matcherAccountFromIDValue,
                    "assign_category_id" => $assignCategoryID,
                    "assign_entity_id" => $assignEntityID,
                    "assign_account_to_id" => $assignAccountToID,
                    "assign_account_from_id" => $assignAccountFromID,
                    "assign_type" => $assignType,
                ]
            );

            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "Rule successfully updated.");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function removeRule(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
            } else {
                $mobile = false;
            }

            $ruleID = Input::validate($request->getParsedBody()["rule_id"], Input::$INT, 4);
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

            RuleModel::delete(["rule_id" => $ruleID]);

            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "Rule successfully deleted.");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e);
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e);
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }
}

$app->get('/rules/', 'Rules::getAllRulesForUser');
$app->post('/rules/', 'Rules::addRule');
$app->delete('/rules/', 'Rules::removeRule');
$app->put('/rules/', 'Rules::editRule');