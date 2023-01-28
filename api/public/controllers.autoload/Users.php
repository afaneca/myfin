<?php

/*
 * Args mandatórios
 *
 *  'authusername'  - username para autenticar a request
 *  'sessionkey' - sessionkey para autenticar a request
 *
 * Errors
 *
 *  1 - Email inválido
 *  2 - LDAP inválido
 *  3 - Sysadmin inválido
 *  4 - O campo de username é obrigatório
 *  5 - Este username já existe
 *  6 - O campo de password é obrigatório
 */

//use Slim\Psr7\Request;
use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

require_once 'consts.php';


class Users
{
    const DEBUG_MODE = true; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

    public static function addUser($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
            } else {
                $mobile = false;
            }


            $username = Input::validate($request->getParsedBody()["username"], Input::$STRICT_STRING, 2);
            $email = Input::validate($request->getParsedBody()["email"], Input::$EMAIL, 3);
            $password = Input::validate($request->getParsedBody()["password"], Input::$STRICT_STRING, 4);

            //$idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);


            /* 4. executar operações */
            UserModel::insert(
                [
                    'username' => $username,
                    'email' => $email,
                    'password' => EnsoShared::hash($password)
                ]
            );


            EnsoLogsModel::addEnsoLog($authusername, "Added user '$username'.", EnsoLogsModel::$INFORMATIONAL, 'Users');

            /* 5. response */
            return sendResponse($response, EnsoShared::$REST_OK, "User added with success.");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (PermissionDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried add an User, operation failed due to lack of permissions.", EnsoLogsModel::$NOTICE, "Users");
            return sendResponse($response, EnsoShared::$REST_FORBIDDEN, $e);
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getMessage());
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add an User, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function changeUserPassword($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
            } else {
                $mobile = false;
            }

            $currentPassword = Input::validate($request->getParsedBody()["current_password"], Input::$STRICT_STRING, 2);
            $newPassword = Input::validate($request->getParsedBody()["new_password"], Input::$STRICT_STRING, 3);

            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Check if current password is correct */
            AuthenticationModel::performCredentialCheck($authusername, $currentPassword);

            /* Changes the password */
            $hashedPassword = EnsoShared::hash($newPassword);
            UserModel::editWhere(["user_id" => $idAuthUser], ["password" => $hashedPassword]);

            EnsoLogsModel::addEnsoLog($authusername, "Changed password of user '$authusername'.", EnsoLogsModel::$INFORMATIONAL, 'Users');

            AuthenticationModel::generateNewsessionkeyForUser($authusername);
            /* 5. response */
            return sendResponse($response, EnsoShared::$REST_OK, "User password changed with success.");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (PermissionDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to change user password, operation failed due to lack of permissions.", EnsoLogsModel::$NOTICE, "Users");
            return sendResponse($response, EnsoShared::$REST_FORBIDDEN, $e);
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getMessage());
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to change user password, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function getUserCategoriesAndEntities(Request $request, Response $response, $args)
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
            /* $db = new EnsoDB(true);

            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            $userID = UserModel::getUserIdByName($authusername, false);
            $outputArr = array();
            $catsArr = CategoryModel::getWhere(
                ["users_user_id" => $userID],
                ["category_id", "name", "type"]
            );
            $entsArr = EntityModel::getWhere(
                ["users_user_id" => $userID],
                ["entity_id", "name"]
            );

            $outputArr["categories"] = $catsArr;
            $outputArr["entities"] = $entsArr;


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

    public static function autoPopulateDemoData($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
            } else {
                $mobile = false;
            }

            /* 1. autenticação — validação do token */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 4. executar operações */
            /*$db = new EnsoDB(true);
            $db->getDB()->beginTransaction();*/

            $userID = UserModel::getUserIdByName($authusername, false);

            // DELETE ALL CURRENT BUDGETS
            BudgetModel::delete([
                "users_user_id" => $userID,
            ], false);

            // DELETE ALL CURRENT TRANSACTIONS
            TransactionModel::removeAllTransactionsFromUser($userID, false);

            // DELETE ALL CURRENT CATEGORIES
            CategoryModel::delete([
                "users_user_id" => $userID,
            ], false);

            // DELETE ALL CURRENT ENTITIES
            EntityModel::delete([
                "users_user_id" => $userID,
            ], false);



            // Create mock categories
            CategoryModel::createMockCategories($userID, 5, false);

            // Create mock entities
            EntityModel::createMockEntities($userID, 5, false);

            // Create mock accounts
            AccountModel::createMockAccounts($userID, 5, false);

            // Create mock transactions
            TransactionModel::createMockTransactions($userID, 100, false);

            // Create mock budgets
            BudgetModel::createMockBudgets($userID, false);

            $userAccounts = AccountModel::getWhere(["users_user_id" => $userID], ["account_id"]);


            foreach ($userAccounts as $account) {
                AccountModel::setNewAccountBalance($account["account_id"],
                    AccountModel::recalculateBalanceForAccountIncrementally($account["account_id"], 0, time() + 1, false),
                    false);
            }

            /*$db->getDB()->commit();*/
            /* 5. response */
            return sendResponse($response, EnsoShared::$REST_OK, "Demo data successfully populated.");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (PermissionDeniedException $e) {
            return sendResponse($response, EnsoShared::$REST_FORBIDDEN, $e);
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getMessage());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

}

/*$app->get('/users/{userID}', 'Users::getUserInfo');*/
$app->get('/user/categoriesAndEntities', 'Users::getUserCategoriesAndEntities');
$app->post('/users/', 'Users::addUser');
$app->put('/users/changePW/', 'Users::changeUserPassword');
$app->post('/users/demo/', 'Users::autoPopulateDemoData');
