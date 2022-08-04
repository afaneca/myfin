<?php
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__)->load();

return
    [
        'paths' => [
            'migrations' => '%%PHINX_CONFIG_DIR%%/db/migrations',
            'seeds' => '%%PHINX_CONFIG_DIR%%/db/seeds'
        ],
        'environments' => [
            'default_migration_table' => 'phinxlog',
            'default_environment' => 'production',
            'production' => [
                'adapter' => 'mysql',
                'host' => 'localhost',
                'name' => getenv("DB_TABLE"),
                'user' => getenv("DB_USER"),
                'pass' => getenv("DB_PW"),
                'port' => getenv("DB_PORT"),
                'charset' => 'utf8',
            ],
        ],
        'version_order' => 'creation'
    ];
