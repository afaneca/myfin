<?php

declare(strict_types=1);

use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

return function (App $app) {

    /* $app->add(function (Request $request, Response $response, $next) {
        if ($request->getMethod() !== 'OPTIONS' || php_sapi_name() === 'cli') {
            return $next($request, $response);
        }

        $response = $next($request, $response);

        $response = $response->withHeader('Access-Control-Allow-Origin', '*');
        $response = $response->withHeader('Access-Control-Allow-Methods', '*');
        $response = $response->withHeader('Access-Control-Allow-Headers', '*');
        return $response;
    }); */

    $app->add(function ($request, $handler) {
        $response = $handler->handle($request);
        return $response
            ->withHeader('Access-Control-Allow-Origin', 'https://myfin.afaneca.com')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization', 'authusername', 'sessionkey', 'sessionkey_mobile')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    });

    $app->options('/{routes:.+}', function (Request $request, Response $response) {
        // CORS Pre-Flight OPTIONS Request Handler
        return $response;
    });

    /* $app->get('/hello/', function (Request $request, Response $response, array $args) {
        $name = $args['name'];
        $response->getBody()->write("dsa, $name");
        return sendResponse($response, EnsoShared::$REST_OK, "fdsa"); //$response;
    }); */
    /*
    $app->group('/users', function (Group $group) {
        $group->get('', ListUsersAction::class);
        $group->get('/{id}', ViewUserAction::class);
    }); */
};
