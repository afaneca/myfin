<?php

use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

require_once 'consts.php';

class Categories
{
    public static function getAllCategoriesForUser(Request $request, Response $response, $args)
    {
        $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
        $userID = $args['userID'];

    }
}
