<?php
require('EnsoDebug.php');

$date = new DateTime();
EnsoDebug::var_error_log($date);
print_r($date);
?>