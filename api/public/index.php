<?php

declare(strict_types=1);

use App\Application\Handlers\HttpErrorHandler;
use App\Application\Handlers\ShutdownHandler;
use App\Application\ResponseEmitter\ResponseEmitter;
use DI\ContainerBuilder;
use Slim\Factory\AppFactory;
use Slim\Factory\ServerRequestCreatorFactory;

require __DIR__ . '/../vendor/autoload.php';


// Instantiate PHP-DI ContainerBuilder
$containerBuilder = new ContainerBuilder();

if (false) { // Should be set to true in production
	$containerBuilder->enableCompilation(__DIR__ . '/../var/cache');
}

// Set up settings
$settings = require __DIR__ . '/../app/settings.php';
$settings($containerBuilder);

// Set up dependencies
$dependencies = require __DIR__ . '/../app/dependencies.php';
$dependencies($containerBuilder);

// Set up repositories
$repositories = require __DIR__ . '/../app/repositories.php';
$repositories($containerBuilder);

// Build PHP-DI Container instance
$container = $containerBuilder->build();

// Instantiate the app
AppFactory::setContainer($container);
$app = AppFactory::create();
$callableResolver = $app->getCallableResolver();

// Register middleware
$middleware = require __DIR__ . '/../app/middleware.php';
$middleware($app);

// Register routes
$routes = require __DIR__ . '/../app/routes.php';
$routes($app);

/** @var bool $displayErrorDetails */
$displayErrorDetails = $container->get('settings')['displayErrorDetails'];

// Create Request object from globals
$serverRequestCreator = ServerRequestCreatorFactory::create();
$request = $serverRequestCreator->createServerRequestFromGlobals();

// Create Error Handler
$responseFactory = $app->getResponseFactory();
$errorHandler = new HttpErrorHandler($callableResolver, $responseFactory);

// Create Shutdown Handler
$shutdownHandler = new ShutdownHandler($request, $errorHandler, $displayErrorDetails);
register_shutdown_function($shutdownHandler);

// Add Routing Middleware
$app->addRoutingMiddleware();

$app->addBodyParsingMiddleware();

// Add Error Middleware
$errorMiddleware = $app->addErrorMiddleware($displayErrorDetails, false, false);
$errorMiddleware->setDefaultErrorHandler($errorHandler);

// carregamento de libs
foreach (scandir('./libs/') as $dirname) {
	$path = './libs/' . $dirname;

	if (is_dir($path) && file_exists($path . '/include.php')) {
		require $path . '/include.php';
	}
}

foreach (scandir('./controllers.autoload/includes/') as $filename) {
	$path = './controllers.autoload/includes/' . $filename;

	if (is_file($path) && !strcmp(pathinfo($path, PATHINFO_EXTENSION), "php")) {
		require $path;
	}
}

// carregamento de controladores
foreach (scandir('./controllers.autoload/') as $filename) {
	$path = './controllers.autoload/' . $filename;

	if (is_file($path) && !strcmp(pathinfo($path, PATHINFO_EXTENSION), "php")) {
		require $path;
	}
}

// carregamento de models
foreach (scandir('./controllers.autoload/models') as $filename) {
	$path = './controllers.autoload/models/' . $filename;

	if (is_file($path) && !strcmp(pathinfo($path, PATHINFO_EXTENSION), "php")) {
		require $path;
	}
}

// Run App & Emit Response
$response = $app->handle($request);
$responseEmitter = new ResponseEmitter();
$responseEmitter->emit($response);

function sendResponse($responseObj, $responseCode, $responseBody)
{
	$responseObj = $responseObj->withHeader('Content-type', 'application/json', 'authusername', 'sessionkey', 'sessionkey_mobile')
		->withHeader('Access-Control-Allow-Origin', 'htts://myfin.afaneca.com')
		->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization', 'authusername', 'sessionkey', 'sessionkey_mobile')
		->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');;
	$responseObj = $responseObj->withStatus($responseCode);
	$responseObj->getBody()->rewind();
	for ($i = 0; $i < $responseObj->getBody()->getSize(); $i++)
		$responseObj->getBody()->write(' ');
	$responseObj->getBody()->rewind();
	$responseObj->getBody()->write(json_encode($responseBody));

	return $responseObj;
}
