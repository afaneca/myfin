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
    const DEBUG_MODE = true; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

    public static function getAllBudgetsForUser(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int) Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
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

            if (isset($status))
                switch ($status) {
                    case "O":
                        $isOpen = true;
                        break;
                    case "C":
                        $isOpen = false;
                        break;
                }

            
            $budgetsArr = BudgetModel::getBudgetsForUser($userID,  isset($isOpen) ? (($isOpen) ? "true" : "false") : null);


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
}

$app->get('/budgets/', 'Budgets::getAllBudgetsForUser');
