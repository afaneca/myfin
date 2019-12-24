<?php
require 'config.php';
require 'iEntity.php';
require 'EntityException.php';
require 'Entity.php';

class EnsoDB
{

	private static $ENSO_DB_VERSION = "2.1.1";

	private static $dbConn = null;
	private $queryExecute = null;

	public function __construct(bool $transactionMode = false)
	{
		global $databaseConfig;

		if (static::$dbConn === null) {
			static::$dbConn = new PDO(
				$databaseConfig['database_type'] . ':host=' . $databaseConfig['server'] . ';port=' . $databaseConfig['port'] . ';dbname=' . $databaseConfig['database_name'],
				$databaseConfig['username'],
				$databaseConfig['password']
			);

			static::$dbConn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

			if($transactionMode)
				static::$dbConn->beginTransaction();
		}
	}

	public function getDB()
	{
		return static::$dbConn;
	}

	public function getQuery()
	{
		return $this->queryExecute;
	}

	public function prepare($sql)
	{
		$this->queryExecute = static::$dbConn->prepare($sql);
	}

	public function execute($values = array())
	{
		$this->queryExecute->execute($values);
	}

	public function fetchAll($mode = PDO::FETCH_ASSOC)
	{
		$results = $this->queryExecute->fetchAll($mode);
		$this->queryExecute->closeCursor();
		return $results;
	}

	public function fetch($mode = PDO::FETCH_ASSOC)
	{
		$result = $this->queryExecute->fetch($mode);
		$this->queryExecute->closeCursor();
		return $result;
	}

	public function closeCursor()
	{
		$this->queryExecute->closeCursor();
	}
}
