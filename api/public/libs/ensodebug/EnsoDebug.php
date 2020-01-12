<?php

class EnsoDebug{
	
	private static $ENSO_DEBUG_VERSION = "2.0.0";
	
	const isDevel = true;
	
	public static function d($message, $facility = null){
		if (!self::isDevel)
			return;
		
		if($facility == null)
			error_log($message);
		else 
			error_log('['.$facility.'] '.$message);
	}
	
	public static function var_error_log( $object=null ){
		
		if (!self::isDevel)
			return;
		
		ob_start();                    // start buffer capture
		var_dump( $object );           // dump the values
		$contents = ob_get_contents(); // put the buffer into a variable
		ob_end_clean();                // end capture
		error_log( $contents );        // log contents of the result of var_dump( $object )
	}
}