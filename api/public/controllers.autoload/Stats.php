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
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

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
            $list["last_update_timestamp"] = intval(UserModel::getWhere(["user_id" => $userID], ["last_update_timestamp"])[0]["last_update_timestamp"]);

            foreach ($list["categories"] as &$category) {
                $monthToUse = $month; //$list["month"];
                $yearToUser = $year; //$list["year"];

                // TODO: map 'D' & 'C' in categories to 'I' & 'E'
                $type = ($category["type"] == 'D') ? DEFAULT_TYPE_EXPENSE_TAG : DEFAULT_TYPE_INCOME_TAG;

                $current_amounts = BudgetHasCategoriesModel::getAmountForCategoryInMonth($category["category_id"], $monthToUse, $yearToUser)[0];
                $current_amount_credit = $current_amounts["category_balance_credit"];
                $current_amount_debit = $current_amounts["category_balance_debit"];

                $category["current_amount_credit"] = Input::convertIntegerToFloat($current_amount_credit);
                $category["current_amount_debit"] = Input::convertIntegerToFloat($current_amount_debit);
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

    public static function getMonthlyPatrimonyProjections(Request $request, Response $response, $args)
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

            /**
             * Skeleton:
             *  [
             *    {category_name, category_expenses },
             *    ...
             * ]
             */

            $userID = UserModel::getUserIdByName($authusername, false);
            $currentMonth = $date = date('m');
            $currentYear = $date = date('Y');
            $previousMonth = ($currentMonth > 1) ? $currentMonth - 1 : 12;
            $previousMonthsYear = ($currentMonth > 1) ? $currentYear : $currentYear - 1;

            $outputArr = array();
            $budgetsList = BudgetModel::getBudgetsAfterCertainMonth($userID, $previousMonth, $previousMonthsYear);

            $lastPlannedFinalBalance = null;
            foreach ($budgetsList as &$budget) {
                $budget["planned_balance"] = BudgetModel::calculateBudgetBalance($userID, $budget);//BudgetModel::getBudgetPlannedBalance($budget);
                $month = $budget["month"];
                $year = $budget["year"];
                if (!$lastPlannedFinalBalance) {
                    $budget["planned_initial_balance"] = floatVal(AccountModel::getBalancesSnapshotForMonthForUser($userID,
                        ($month > 1) ? $month - 1 : 12, ($month > 1) ? $year : $year - 1, false));
                } else {
                    $budget["planned_initial_balance"] = $lastPlannedFinalBalance;
                }

                $budget["planned_final_balance"] = $budget["planned_initial_balance"] + $budget["planned_balance"];
                $lastPlannedFinalBalance = $budget["planned_final_balance"];
            }

            $accountsFromPreviousMonth = AccountModel::getWhere(["users_user_id" => $userID],
                ["account_id", "type"]);

            $currentMonth = $date = date('m');
            $currentYear = $date = date('Y');
            $previousMonth = ($currentMonth > 1) ? $currentMonth - 1 : 12;
            $previousMonthsYear = ($currentMonth > 1) ? $currentYear : $currentYear - 1;

            foreach ($accountsFromPreviousMonth as &$acc) {
                $acc["balance"] = AccountModel::getBalanceSnapshotAtMonth($acc["account_id"], $previousMonth, $previousMonthsYear, false)["balance"];
                if (!$acc["balance"]) $acc["balance"] = "0.00";
            }

            $outputArr["budgets"] = $budgetsList;
            $outputArr["accountsFromPreviousMonth"] = $accountsFromPreviousMonth;
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

    public static function getUserCounterStats(Request $request, Response $response, $args)
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

            /**
             * Skeleton:
             *  [
             *    {category_name, category_expenses },
             *    ...
             * ]
             */

            $userID = UserModel::getUserIdByName($authusername, false);
            $outputArr = array();
            $outputArr["nr_of_trx"] = TransactionModel::getCounterOfUserTransactions($userID);
            $outputArr["nr_of_entities"] = EntityModel::getCounterWhere(["users_user_id" => $userID]);
            $outputArr["nr_of_categories"] = CategoryModel::getCounterWhere(["users_user_id" => $userID]);
            $outputArr["nr_of_accounts"] = AccountModel::getCounterWhere(["users_user_id" => $userID]);
            $outputArr["nr_of_budgets"] = BudgetModel::getCounterWhere(["users_user_id" => $userID]);
            $outputArr["nr_of_rules"] = RuleModel::getCounterWhere(["users_user_id" => $userID]);

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

    public static function getCategoryExpensesEvolution(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
            } else {
                $mobile = false;
            }
            if (array_key_exists('cat_id', $request->getQueryParams())) {
                $catID = Input::validate($request->getQueryParams()['cat_id'], Input::$INT, 4);
            } else {
                $catID = null;
            }
            if (array_key_exists('ent_id', $request->getQueryParams())) {
                $entID = Input::validate($request->getQueryParams()['ent_id'], Input::$INT, 4);
            } else {
                $entID = null;
            }

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
            $currentMonth = $date = date('m');
            $currentYear = $date = date('Y');
            /*$nextMonth = ($currentMonth < 12) ? $currentMonth + 1 : 1;
            $nextMonthsYear = ($currentMonth < 12) ? $currentYear : $currentYear + 1;*/


            $budgetsList = BudgetModel::getBudgetsUntilCertainMonth($userID, $currentMonth, $currentYear, "DESC");

            $outputArr = [];
            foreach ($budgetsList as &$budget) {
                $item = [];
                $item["month"] = $budget["month"];
                $item["year"] = $budget["year"];

                if ($catID) {
                    $calculatedAmounts = BudgetHasCategoriesModel::getAmountForCategoryInMonth($catID, $item["month"], $item["year"])[0];
                    $amount_credit = abs($calculatedAmounts["category_balance_credit"]);
                    $amount_debit = abs($calculatedAmounts["category_balance_debit"]);
                } else if ($entID) {
                    $calculatedAmounts = BudgetHasCategoriesModel::getAmountForEntityInMonth($entID, $item["month"], $item["year"])[0];
                    $amount_credit = abs($calculatedAmounts["entity_balance_credit"]);
                    $amount_debit = abs($calculatedAmounts["entity_balance_debit"]);
                }

                $item["value"] = Input::convertIntegerToFloat($amount_debit);
                array_push($outputArr, $item);
            }

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

    public static function getCategoryIncomeEvolution(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 3);
            } else {
                $mobile = false;
            }

            if (array_key_exists('cat_id', $request->getQueryParams())) {
                $catID = Input::validate($request->getQueryParams()['cat_id'], Input::$INT, 4);
            } else {
                $catID = null;
            }
            if (array_key_exists('ent_id', $request->getQueryParams())) {
                $entID = Input::validate($request->getQueryParams()['ent_id'], Input::$INT, 4);
            } else {
                $entID = null;
            }


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
            $currentMonth = $date = date('m');
            $currentYear = $date = date('Y');
            /*$nextMonth = ($currentMonth < 12) ? $currentMonth + 1 : 1;
            $nextMonthsYear = ($currentMonth < 12) ? $currentYear : $currentYear + 1;*/


            $budgetsList = BudgetModel::getBudgetsUntilCertainMonth($userID, $currentMonth, $currentYear, "DESC");

            $outputArr = [];
            foreach ($budgetsList as &$budget) {
                $item = [];
                $item["month"] = $budget["month"];
                $item["year"] = $budget["year"];

                if ($catID) {
                    $calculatedAmounts = BudgetHasCategoriesModel::getAmountForCategoryInMonth($catID, $item["month"], $item["year"])[0];
                    $amount_credit = abs($calculatedAmounts["category_balance_credit"]);
                    $amount_debit = abs($calculatedAmounts["category_balance_debit"]);
                } else if ($entID) {
                    $calculatedAmounts = BudgetHasCategoriesModel::getAmountForEntityInMonth($entID, $item["month"], $item["year"])[0];
                    $amount_credit = abs($calculatedAmounts["entity_balance_credit"]);
                    $amount_debit = abs($calculatedAmounts["entity_balance_debit"]);
                }

                $item["value"] = Input::convertIntegerToFloat($amount_credit);
                array_push($outputArr, $item);
            }

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
}

$app->get('/stats/dashboard/month-expenses-income-distribution', 'Stats::getExpensesIncomeDistributionForMonth');
$app->get('/stats/stats/monthly-patrimony-projections', 'Stats::getMonthlyPatrimonyProjections');
$app->get('/stats/userStats', 'Stats::getUserCounterStats');
$app->get("/stats/category-expenses-evolution", 'Stats:getCategoryExpensesEvolution');
$app->get("/stats/category-income-evolution", 'Stats:getCategoryIncomeEvolution');