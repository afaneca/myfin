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
        $userID = $args['userID'];
        $name = $request->getQueryParams()['name'];
        $age = $request->getParsedBody()['idade'];
        


        return sendResponse($response, EnsoShared::$REST_OK, "$age , $name , $userID");
    }
}

$app->group('users/{id:[0-9]+}', "");

/* $app->get('/users/{userID}', 'Users::getUserInfo');
$app->put('/users/', 'Users::editUser');
$app->post('/users/', 'Users::addUser');
$app->delete('/users/', 'Users::removeUser'); */
