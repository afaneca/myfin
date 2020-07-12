<?php

/*$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);*/
$dotenv = Dotenv\Dotenv::createMutable(dirname(__DIR__, 2), '.env')->load();

$DB_HOST = getenv('DB_HOST');


/* Database Settings */
$databaseConfig["database_type"] = "mysql";
$databaseConfig["server"] = "localhost";
$databaseConfig["username"] = getenv('DB_USER');
$databaseConfig["password"] = getenv('DB_PW');
$databaseConfig["charset"] = "utf8";
$databaseConfig["port"] = getenv('DB_PORT');
$databaseConfig["database_name"] = getenv('DB_TABLE');
