<?php

use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

require_once 'consts.php';

class Stats
{
    const DEBUG_MODE = true; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

    public static function getExpensesIncomeDistributionForMonth(Request $request, Response $response, $args)
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

            /* Auth - token validation */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* Execute Operations */
            /* $db = new EnsoDB(true);

            $db->getDB()->beginTransaction(); */

            /**
             * Skeleton:
             *  [
             *    {category_name, category_expenses },
             *    ...
             * ]
             */

            $userID = UserModel::getUserIdByName($authusername, false);


            $budgetID = BudgetModel::getWhere(["month" => $month, "year" => $year, "users_user_id" => $userID])[0]["budget_id"];

            $list["categories"] = BudgetHasCategoriesModel::getAllCategoriesForBudget($userID, $budgetID, false);

            foreach ($list["categories"] as &$category) {
                $monthToUse = $month; //$list["month"];
                $yearToUser = $year; //$list["year"];

                // TODO: map 'D' & 'C' in categories to 'I' & 'E'
                $type = ($category["type"] == 'D') ? DEFAULT_TYPE_EXPENSE_TAG : DEFAULT_TYPE_INCOME_TAG;

                $current_amount = BudgetHasCategoriesModel::getAmountForCategoryInMonth($category["category_id"], $monthToUse, $yearToUser, $type)[0]["category_balance"];
                $category["current_amount"] = Input::convertIntegerToFloat($current_amount);
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

}

$app->get('/stats/dashboard/month-expenses-income-distribution', 'Stats::getExpensesIncomeDistributionForMonth');