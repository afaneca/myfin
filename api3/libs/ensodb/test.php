<?php
require 'include.php';

echo "INIT\n";

try {
	$db = new EnsoDB ();

	$db->prepare ( "SELECT * FROM \"user\" WHERE 'username' = ':username'" );
	$values = array ();
	$values [':username'] = 'Tony';
	$db->execute ($values);

	$row = $db->fetchAll ();
	print_r ( $row );
} catch ( PDOException $e ) {
	echo "FALHOU\n";
	print_r ( $e );

}

//var_dump($databaseConfig);
echo "CORREU\n";
