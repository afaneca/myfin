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
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);

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

            // orders the list DESC by year, then month
            usort($budgetsArr, function ($a, $b) {
                $rdiff = $b['year'] - $a['year'];
                if ($rdiff) return $rdiff;
                return $b['month'] - $a['month'];
            });

            foreach ($budgetsArr as &$budget) {
                $budget["balance_value"] = BudgetModel::calculateBudgetBalance($userID, $budget, true);//"-343.54";
                $budget["balance_change_percentage"] = BudgetModel::calculateBudgetBalanceChangePercentage($userID, $budget, $budget["balance_value"], true);
                $budgetSums = BudgetModel::getSumAmountsForBudget($userID, $budget, true);
                $budget["credit_amount"] = $budgetSums["balance_credit"];
                $budget["debit_amount"] = $budgetSums["balance_debit"];
                if (doubleval($budget["credit_amount"]) == 0) $budget["savings_rate_percentage"] = 0;
                else $budget["savings_rate_percentage"] = (doubleval($budget["balance_value"]) / doubleval($budget["credit_amount"])) * 100;
            }

            $db->getDB()->commit();

            return sendResponse($response, EnsoShared::$REST_OK, $budgetsArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function getBudgetsListForUser(Request $request, Response $response, $args)
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
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();


            $userID = UserModel::getUserIdByName($authusername, true);
            $budgetsArr = BudgetModel::getWhere(["users_user_id" => $userID], ["month", "year", "budget_id"]);

            // orders the list DESC by year, then month
            usort($budgetsArr, function ($a, $b) {
                $rdiff = $b['year'] - $a['year'];
                if ($rdiff) return $rdiff;
                return $b['month'] - $a['month'];
            });


            $db->getDB()->commit();

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
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();


            $userID = UserModel::getUserIdByName($authusername, true);


            $list = BudgetModel::getWhere(["users_user_id" => $userID, "budget_id" => $budgetID], ["observations", "month", "year"])[0];

            $month = intval($list["month"]);
            $year = intval($list["year"]);

            $list["initial_balance"] = AccountModel::getBalancesSnapshotForMonthForUser($userID, ($month > 1) ? $month - 1 : 12, ($month > 1) ? $year : $year - 1, true, false);
            $list["categories"] = BudgetHasCategoriesModel::getAllCategoriesForBudget($userID, $budgetID, false);

            foreach ($list["categories"] as &$category) {
                $monthToUse = $list["month"];
                $yearToUse = $list["year"];
                $currentMonth = date('M');
                $currentYear = date('Y');

                // TODO: map 'D' & 'C' in categories to 'I' & 'E'
                $type = ($category["type"] == 'D') ? DEFAULT_TYPE_EXPENSE_TAG : DEFAULT_TYPE_INCOME_TAG;

                $calculatedAmounts = BudgetHasCategoriesModel::getAmountForCategoryInMonth($category["category_id"], $monthToUse, $yearToUse, true)[0];
                $calculatedAmountsFromInvestmentAccounts = AccountModel::getAmountForInvestmentAccountsInMonth($category["category_id"], $monthToUse, $yearToUse, true)[0];
                $creditFromInvestmentAccounts = $calculatedAmountsFromInvestmentAccounts["account_balance_credit"]; // Unrealized gains
                $expensesFromInvestmentAccounts = $calculatedAmountsFromInvestmentAccounts["account_balance_debit"]; // Unrealized losses
                $current_amount_credit = $calculatedAmounts["category_balance_credit"] - $creditFromInvestmentAccounts; // remove unrealized gains from budget calcs
                $current_amount_debit = $calculatedAmounts["category_balance_debit"] - $expensesFromInvestmentAccounts; // remove unrealized losses from budget calcs
                $category["current_amount_credit"] = abs(Input::convertIntegerToFloatAmount($current_amount_credit));
                $category["current_amount_debit"] = abs(Input::convertIntegerToFloatAmount($current_amount_debit));

                $previousMonth = ($monthToUse > 1) ? $monthToUse - 1 : 12;
                $previousMonthsYear = ($monthToUse > 1) ? $yearToUse : $yearToUse - 1;
                $previousMonthAmounts = BudgetHasCategoriesModel::getAmountForCategoryInMonth($category["category_id"], $previousMonth, $previousMonthsYear, true)[0];
                $category["avg_previous_month_credit"] = abs(Input::convertIntegerToFloatAmount($previousMonthAmounts["category_balance_credit"]));
                $category["avg_previous_month_debit"] = abs(Input::convertIntegerToFloatAmount($previousMonthAmounts["category_balance_debit"]));

                $sameMonthPreviousYearAmounts = BudgetHasCategoriesModel::getAmountForCategoryInMonth($category["category_id"], $monthToUse, $yearToUse - 1, true)[0];
                $category["avg_same_month_previous_year_credit"] = abs(Input::convertIntegerToFloatAmount($sameMonthPreviousYearAmounts["category_balance_credit"]));
                $category["avg_same_month_previous_year_debit"] = abs(Input::convertIntegerToFloatAmount($sameMonthPreviousYearAmounts["category_balance_debit"]));

                $last12MonthsAverageAmounts = BudgetHasCategoriesModel::getAverageAmountForCategoryInLast12Months($category["category_id"], true)[0];
                $category["avg_12_months_credit"] = abs(Input::convertIntegerToFloatAmount($last12MonthsAverageAmounts["category_balance_credit"]));
                $category["avg_12_months_debit"] = abs(Input::convertIntegerToFloatAmount($last12MonthsAverageAmounts["category_balance_debit"]));

                $lifetimeAverageAmounts = BudgetHasCategoriesModel::getAverageAmountForCategoryInLifetime($category["category_id"], true)[0];
                $category["avg_lifetime_credit"] = abs(Input::convertIntegerToFloatAmount($lifetimeAverageAmounts["category_balance_credit"]));
                $category["avg_lifetime_debit"] = abs(Input::convertIntegerToFloatAmount($lifetimeAverageAmounts["category_balance_debit"]));
            }

            // we need to also add uncategorized transactions to the calculations
            /*$uncategorizedTrxAmounts = BudgetHasCategoriesModel::getAmountForUncategorizedTransactionsInMonth($monthToUse, $yearToUse)[0];
            array_push($list["categories"], [
                "category_id" => -1,
                "current_amount_credit" => abs(Input::convertIntegerToFloat($uncategorizedTrxAmounts["category_balance_credit"])),
                "current_amount_debit" => abs(Input::convertIntegerToFloat($uncategorizedTrxAmounts["category_balance_debit"])),
                "name" => "Não Categorizadas",
                "description" => "Transações sem categoria atribuída"
            ]);*/


            $db->getDB()->commit();

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


            $catsArr = CategoryModel::getWhere(["users_user_id" => $userID], ["category_id", "name", "type", "description", "status"]);

            foreach ($catsArr as &$category) {
                $monthToUse = date('m');
                $yearToUse = date('Y');

                $previousMonth = ($monthToUse > 1) ? $monthToUse - 1 : 12;
                $previousMonthsYear = ($monthToUse > 1) ? $yearToUse : $yearToUse - 1;
                $previousMonthAmounts = BudgetHasCategoriesModel::getAmountForCategoryInMonth($category["category_id"], $previousMonth, $previousMonthsYear, true)[0];
                $category["avg_previous_month_credit"] = abs(Input::convertIntegerToFloatAmount($previousMonthAmounts["category_balance_credit"]));
                $category["avg_previous_month_debit"] = abs(Input::convertIntegerToFloatAmount($previousMonthAmounts["category_balance_debit"]));

                $sameMonthPreviousYearAmounts = BudgetHasCategoriesModel::getAmountForCategoryInMonth($category["category_id"], $monthToUse, $yearToUse - 1, true)[0];
                $category["avg_same_month_previous_year_credit"] = abs(Input::convertIntegerToFloatAmount($sameMonthPreviousYearAmounts["category_balance_credit"]));
                $category["avg_same_month_previous_year_debit"] = abs(Input::convertIntegerToFloatAmount($sameMonthPreviousYearAmounts["category_balance_debit"]));

                $last12MonthsAverageAmounts = BudgetHasCategoriesModel::getAverageAmountForCategoryInLast12Months($category["category_id"], true)[0];
                $category["avg_12_months_credit"] = abs(Input::convertIntegerToFloatAmount($last12MonthsAverageAmounts["category_balance_credit"]));
                $category["avg_12_months_debit"] = abs(Input::convertIntegerToFloatAmount($last12MonthsAverageAmounts["category_balance_debit"]));

                $lifetimeAverageAmounts = BudgetHasCategoriesModel::getAverageAmountForCategoryInLifetime($category["category_id"], true)[0];
                $category["avg_lifetime_credit"] = abs(Input::convertIntegerToFloatAmount($lifetimeAverageAmounts["category_balance_credit"]));
                $category["avg_lifetime_debit"] = abs(Input::convertIntegerToFloatAmount($lifetimeAverageAmounts["category_balance_debit"]));
            }

            $list['categories'] = $catsArr;
            $list['initial_balance'] = "-";

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
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);

            // ADD BUDGET
            $budgetID = BudgetModel::insert([
                "month" => $month,
                "year" => $year,
                "observations" => $observations,
                "is_open" => true,
                "users_user_id" => $userID
            ], true);


            // ADD CAT VALUES TO BUDGET CATEGORIES
            foreach ($catValuesArr as $item) {

                $catID = $item['category_id'];
                $plannedValueCredit = Input::convertFloatToIntegerAmount(floatval($item['planned_value_credit']));
                $plannedValueDebit = Input::convertFloatToIntegerAmount(floatval($item['planned_value_debit']));

                BudgetHasCategoriesModel::addOrUpdateCategoryValueInBudget($userID, $budgetID, $catID, $plannedValueCredit, $plannedValueDebit, true);
            }

            $db->getDB()->commit();

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
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();
            $userID = UserModel::getUserIdByName($authusername, true);

            BudgetHasCategoriesModel::delete(["budgets_budget_id" => $budgetID, "budgets_users_user_id" => $userID], true);
            BudgetModel::delete(["budget_id" => $budgetID, "users_user_id" => $userID], true);

            $db->getDB()->commit();
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
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);

            // EDIT BUDGET
            BudgetModel::editWhere(
                ["budget_id" => $budgetID],
                [
                    "month" => $month,
                    "year" => $year,
                    "observations" => $observations,
                    "users_user_id" => $userID
                ], true
            );


            // ADD CAT VALUES TO BUDGET CATEGORIES
            /*foreach ($catValuesArr as $item) {
                $catID = $item['category_id'];
                $plannedValue = Input::convertFloatToInteger(floatval($item['planned_value']));

                BudgetHasCategoriesModel::addOrUpdateCategoryValueInBudget($userID, $budgetID, $catID, $plannedValue);
            }*/

            foreach ($catValuesArr as $item) {

                $catID = $item['category_id'];
                $plannedValueCredit = Input::convertFloatToIntegerAmount(floatval($item['planned_value_credit']));
                $plannedValueDebit = Input::convertFloatToIntegerAmount(floatval($item['planned_value_debit']));

                BudgetHasCategoriesModel::addOrUpdateCategoryValueInBudget($userID, $budgetID, $catID, $plannedValueCredit, $plannedValueDebit, true);
            }

            $db->getDB()->commit();

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
            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $userID = UserModel::getUserIdByName($authusername, true);

            // ADD BUDGET
            BudgetModel::editWhere(
                ["budget_id" => $budgetID],
                [
                    "is_open" => $isOpen
                ], true
            );

            $db->getDB()->commit();

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
$app->get('/budgets/list', 'Budgets::getBudgetsListForUser');
$app->get('/budgets/{id}', 'Budgets::getBudget');
$app->post('/budgets/step0', 'Budgets::addBudgetStep0');
$app->post('/budgets/step1', 'Budgets::addBudget');
$app->put('/budgets/', 'Budgets::editBudget');
$app->put('/budgets/status', 'Budgets::changeBudgetStatus');
$app->delete('/budgets/', 'Budgets::removeBudget');
