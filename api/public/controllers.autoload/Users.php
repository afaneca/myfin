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
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

    /* 
    $app->group('/users/{id:[0-9]+}', function (RouteCollectorProxy $group) {
    $group->map(['GET', 'DELETE', 'PATCH', 'PUT'], '', function ($request, $response, $args) {
        // Find, delete, patch or replace user identified by $args['id']
    })->setName('user');
    
    $group->get('/reset-password', function ($request, $response, $args) {
        // Route for /users/{id:[0-9]+}/reset-password
        // Reset the password for user identified by $args['id']
    })->setName('user-password-reset');
});
    */

    public static function getUserInfo(Request $request, Response $response, $args)
    {
        //$request = $request->getParsedBody();
        $userID = $args['userID']; // xxxx/{userID}
        $name = $request->getQueryParams()['name']; // xxxx/yy?name={name}
        $age = $request->getParsedBody()['idade']; // body


        return sendResponse($response, EnsoShared::$REST_OK, "$age , $name , $userID");
    }

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
}

$app->get('/users/{userID}', 'Users::getUserInfo');
$app->post('/users/', 'Users::addUser');
