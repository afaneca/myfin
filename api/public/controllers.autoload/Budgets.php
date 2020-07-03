<?php

use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

require_once 'consts.php';

class Budgets
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)


    public static function getAllBudgetsForUser(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
            } else {
                $mobile = false;
            }

            if (array_key_exists('status', $request->getQueryParams())) {
                /*
                    status = null, C(losed), or O(pen)
                    Used to allow filtering, if desired
                */
                $status = Input::validate($request->getQueryParams()['status'], Input::$STRING, 2);
                if ($status !== 'C' && $status !== 'O') $status = null;
            }


            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            /* $db = new EnsoDB(true);
            
            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */

            $userID = UserModel::getUserIdByName($authusername, false);

            /* if (isset($status))
                switch ($status) {
                    case "O":
                        $isOpen = true;
                        break;
                    case "C":
                        $isOpen = false;
                        break;
                }


            $budgetsArr = BudgetModel::getBudgetsForUser($userID,  isset($isOpen) ? (($isOpen) ? "true" : "false") : null); */

            if (isset($status))
                switch ($status) {
                    case "O":
                        $isOpen = true;
                        break;
                    case "C":
                        $isOpen = false;
                        break;
                }

            if (isset($isOpen))
                $budgetsArr = BudgetModel::getWhere(["users_user_id" => $userID, "is_open" => $isOpen]);
            else
                $budgetsArr = BudgetModel::getWhere(["users_user_id" => $userID]);

            // orders the list ASC by year, then month
            usort($budgetsArr, function ($a, $b) {
                $rdiff = $a['year'] - $b['year'];
                if ($rdiff) return $rdiff;
                return $a['month'] - $b['month'];
            });


            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, $budgetsArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function getBudget(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
            } else {
                $mobile = false;
            }

            $budgetID = Input::validate($args['id'], Input::$INT);

            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            /* $db = new EnsoDB(true);
            
            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */

            $userID = UserModel::getUserIdByName($authusername, false);


            $list = BudgetModel::getWhere(["users_user_id" => $userID, "budget_id" => $budgetID], ["initial_balance", "observations", "month", "year"])[0];
            $list["categories"] = BudgetHasCategoriesModel::getAllCategoriesForBudget($userID, $budgetID, false);

            foreach ($list["categories"] as &$category) {
                $monthToUse = $list["month"];
                $yearToUser = $list["year"];

                // TODO: map 'D' & 'C' in categories to 'I' & 'E'
                $type = ($category["type"] == 'D') ? DEFAULT_TYPE_EXPENSE_TAG : DEFAULT_TYPE_INCOME_TAG;

                /* echo $monthToUse . "\n";
                 echo $yearToUser . "\n";
                 echo $type . "\n";
                 die();*/
                $current_amount = BudgetHasCategoriesModel::getAmountForCategoryInMonth($category["category_id"], $monthToUse, $yearToUser, $type)[0]["category_balance"];
                $category["current_amount"] = abs(Input::convertIntegerToFloat($current_amount));
            }

            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, $list);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }


    /**
     * Preliminary step for the add budget flow
     * Gives frontend the data it needs to display in the UI
     * (categories list)
     */
    public static function addBudgetStep0(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
            } else {
                $mobile = false;
            }


            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            $userID = UserModel::getUserIdByName($authusername, false);


            $catsArr = CategoryModel::getWhere(["users_user_id" => $userID], ["category_id", "name", "type"]);

            $list['categories'] = $catsArr;
            $list['initial_balance'] = "1010.20";

            return sendResponse($response, EnsoShared::$REST_OK, $list);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }


    public static function addBudget(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            /* month year observations is_open users_user_id cat_values_arr */

            $month = Input::validate($request->getParsedBody()['month'], Input::$INT, 3);
            $year = Input::validate($request->getParsedBody()['year'], Input::$INT, 4);
            $observations = Input::validate($request->getParsedBody()['observations'], Input::$STRING, 5);
            $catValuesArr = json_decode(Input::validate($request->getParsedBody()['cat_values_arr'], Input::$ARRAY, 6), true);


            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            /* $db = new EnsoDB(true);
            
            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */

            $userID = UserModel::getUserIdByName($authusername, false);

            // ADD BUDGET
            $budgetID = BudgetModel::insert([
                "month" => $month,
                "year" => $year,
                "observations" => $observations,
                "is_open" => true,
                "users_user_id" => $userID
            ]);


            // ADD CAT VALUES TO BUDGET CATEGORIES
            foreach ($catValuesArr as $item) {

                $catID = $item['category_id'];
                $plannedValue = Input::convertFloatToInteger(floatval($item['planned_value']));

                BudgetHasCategoriesModel::addOrUpdateCategoryValueInBudget($userID, $budgetID, $catID, $plannedValue);
            }

            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, ["budget_id" => $budgetID]);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function removeBudget(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            $budgetID = Input::validate($request->getParsedBody()['budget_id'], Input::$INT, 2);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
            } else {
                $mobile = false;
            }


            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            $userID = UserModel::getUserIdByName($authusername, false);

            BudgetHasCategoriesModel::delete(["budgets_budget_id" => $budgetID, "budgets_users_user_id" => $userID]);
            BudgetModel::delete(["budget_id" => $budgetID, "users_user_id" => $userID]);


            return sendResponse($response, EnsoShared::$REST_OK, "Budget successfully removed.");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function editBudget(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            /* month year observations is_open users_user_id cat_values_arr */
            $budgetID = Input::validate($request->getParsedBody()['budget_id'], Input::$INT, 3);
            $month = Input::validate($request->getParsedBody()['month'], Input::$INT, 4);
            $year = Input::validate($request->getParsedBody()['year'], Input::$INT, 5);
            $observations = Input::validate($request->getParsedBody()['observations'], Input::$STRING, 6);
            $catValuesArr = json_decode(Input::validate($request->getParsedBody()['cat_values_arr'], Input::$ARRAY, 7), true);

            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            /* $db = new EnsoDB(true);
            
            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */

            $userID = UserModel::getUserIdByName($authusername, false);

            // EDIT BUDGET
            BudgetModel::editWhere(
                ["budget_id" => $budgetID],
                [
                    "month" => $month,
                    "year" => $year,
                    "observations" => $observations,
                    "users_user_id" => $userID
                ]
            );


            // ADD CAT VALUES TO BUDGET CATEGORIES
            foreach ($catValuesArr as $item) {
                $catID = $item['category_id'];
                $plannedValue = Input::convertFloatToInteger(floatval($item['planned_value']));

                BudgetHasCategoriesModel::addOrUpdateCategoryValueInBudget($userID, $budgetID, $catID, $plannedValue);
            }

            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "Budget successfully updated!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function changeBudgetStatus(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }

            /* month year observations is_open users_user_id cat_values_arr */
            $budgetID = Input::validate($request->getParsedBody()['budget_id'], Input::$INT, 3);
            $isOpen = (int)Input::validate($request->getParsedBody()['is_open'], Input::$BOOLEAN, 4);


            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            /* $db = new EnsoDB(true);
            
            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */

            $userID = UserModel::getUserIdByName($authusername, false);

            // ADD BUDGET
            BudgetModel::editWhere(
                ["budget_id" => $budgetID],
                [
                    "is_open" => $isOpen
                ]
            );

            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "Budget successfully updated!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }
}

$app->get('/budgets/', 'Budgets::getAllBudgetsForUser');
$app->get('/budgets/{id}', 'Budgets::getBudget');
$app->post('/budgets/step0', 'Budgets::addBudgetStep0');
$app->post('/budgets/step1', 'Budgets::addBudget');
$app->put('/budgets/', 'Budgets::editBudget');
$app->put('/budgets/status', 'Budgets::changeBudgetStatus');
$app->delete('/budgets/', 'Budgets::removeBudget');
