<?php
class EnsoShared {
	
	private static $ENSOSHARED_VERSION = "5.0.0";
	
	/**
	 * Códigos da resposta da chamada REST
	 */
	public static $ENSO_REST_OK = 200;
	public static $ENSO_REST_CREATED = 201;
	public static $ENSO_REST_UPDATE_DELETED = 202;
	public static $ENSO_REST_BAD_REQUEST = 400;
	public static $ENSO_REST_NOT_AUTHORIZED = 401;
	public static $ENSO_REST_FORBIDDEN = 403;
	public static $ENSO_REST_NOT_FOUND = 404;
	public static $ENSO_REST_NOT_ACCEPTABLE = 406;
	public static $ENSO_REST_INTERNAL_SERVER_ERROR = 500;
	
	/**
	 * Tamanho do blocksize
	 *
	 * @var int
	 */
	public static $BLOCK_SIZE = 16;
	
	/**
	 * Tipo de hashing
	 *
	 * @var string
	 */
	public static $HASH_TYPE = "sha512";

	/**
	 * IV DIVIDER
	 *
	 * @var string
	 */
	public static $DIVIDER = ")(";
	
	/**
	 * Network safe char - a char that will never be used has a encode result
	 * char, can be used to split several network encoded strings
	 *
	 * @var string
	 */
	public static $NETWORK_ENCODE_SAFE_CHAR = " ";
	
	/**
	 * Tipo de Cifra utilizada no processo de encriptação/desencriptação
	 *
	 * @var string
	 */
	public static $CIPHER = "aes-256-cbc";
	
	/**
	 * Get the current unix time stamp in seconds
	 *
	 * @return current UNIX timestamp in seconds
	 */
	public static function now(){
		return (int)microtime(true);
	}
	
	/**
	 * Get the current unix time stamp in millis
	 *
	 * @return current UNIX timestamp in milliseconds
	 */
	public static function nowMillis(){
		list($usec, $sec) = explode(" ", microtime());
		return (int)(((float)$usec + (float)$sec) * 1000);
	}
	
	/**
	 * Hash function to construct an hash based on the inputed data
	 *
	 * @param
	 *        	string
	 *        	data to hash
	 *
	 * @return string corresponding hashed value
	 */
	public static function hash($data) {
		return strtolower ( hash ( self::$HASH_TYPE, $data ) );
	}

	/**
	 * Função de encriptação, na versão atual da lib é estabelecido a utilização de AES 265 CBC
	 *
	 * @param string $data
	 *        	dados a encriptar
	 * @param string $key
	 *        	chave de encriptação
	 *        	
	 * @return string dados encriptados com IV, tude em Base64
	 */
	public static function encrypt($data, $key_str) {
		// Generate an initialization vector
		$iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length(self::$CIPHER));
		
		$encrypted = openssl_encrypt(self::pad($data), self::$CIPHER, $key_str, OPENSSL_RAW_DATA|OPENSSL_ZERO_PADDING, $iv);

		return EnsoShared::networkEncode($encrypted) . self::$DIVIDER . EnsoShared::networkEncode($iv);
	}
	
	/**
	 * Função de encriptação, na versão atual da lib é estabelecido a utilização de AES 256 CBC
	 *
	 * @param string $data
	 *        	dados a desencriptar
	 * @param string $key
	 *        	chave de encriptação
	 *        	
	 * @return string dados desencriptados
	 */
	public static function decrypt($data, $key_str) {
		// To decrypt, split the encrypted data from our IV - our unique separator used was "::"
		list($encrypted_data, $iv) = explode(self::$DIVIDER, $data, 2);
		$encrypted_data = EnsoShared::networkDecode($encrypted_data);
		$iv = EnsoShared::networkDecode($iv);
		return self::unpad(openssl_decrypt($encrypted_data, self::$CIPHER, $key_str, OPENSSL_RAW_DATA|OPENSSL_ZERO_PADDING, $iv));
	}
	
	/**
	 * Pad - creates the padding according to a cypher block size PKCS7
	 *
	 * @param	string $data
	 *        	data to pad
	 *
	 * @return string data already padded
	 */
	private static function pad($data) {
		$pad = self::$BLOCK_SIZE - (strlen($data) % self::$BLOCK_SIZE);
		return $data . str_repeat(chr($pad), $pad);

	}

	/**
	 * Unpad - removes the padding according to a cypher block size PKCS7
	 *
	 * @param  	string $data
	 *        	data to unppad
	 *
	 * @return string data already padded
	 */
	private static function unpad($data)
	{
		$len = strlen($data);
		$pad = ord($data[$len - 1]);
		return substr($data, 0, strlen($data) - $pad);
	}
	
	/**
	 * getKeyHash function to make a key compatible with the current cypher
	 * algorithm length
	 *
	 * @param
	 *        	initHash
	 *        	- hash that should be the original key
	 * @return string - new compatible key
	 */
	public static function normalizeKey($initHash) {
		if ($initHash == "") {
			return null;
		} else if (strlen ( $initHash ) == self::$BLOCK_SIZE) {
			return $initHash;
		} else if (strlen ( $initHash ) < self::$BLOCK_SIZE) {
			while ( strlen ( $initHash ) < self::$BLOCK_SIZE ) {
				$initHash .= $initHash;
			}
			return substr ( $initHash, 0, self::$BLOCK_SIZE );
		} else if (strlen ( $initHash ) > self::$BLOCK_SIZE) {
			return substr ( $initHash, 0, self::$BLOCK_SIZE );
		}
	
		return null;
	}
	
	/**
	 * Função de codificação para transferência em rede, na versão atual da lib é estabelecido
	 * como recurso a utilização de base64
	 *
	 * @param string $data
	 *        	dados a codificar
	 *        	
	 * @return string with the resulting encoded representation of data
	 */
	public static function networkEncode($data) {
		return self::netUrlEncode ( base64_encode ( $data ) );
	}
	
	/**
	 * Função de descodificação de dados codificados para transferência em rede,
	 * na versão atual da lib é estabelecido como recurso a utilização de base64
	 *
	 * @param string $data
	 *        	dados a codificar
	 *        	
	 * @return string with the resulting decoded representation of data
	 */
	public static function networkDecode($data) {
		return base64_decode ( self::netUrlDecode ( $data ) );
	}
	
	/**
	 * Function to encode data ensuring it only contains valid url chars
	 *
	 * @param
	 *        	string
	 *        	data to encode
	 * @return string with encoded data
	 */
	private static function netUrlEncode($data) {
		return strtr ( $data, '+/=', '-_:' );
	}
	
	/**
	 * Function to decode data previously encoded with netUrlEncode
	 * 
	 * @param string
	 *            data to decode
	 * @return string with decoded data
	 */
	private static function netUrlDecode($data) {
		return strtr ( $data, '-_:', '+/=' );
	}
	
	/**
	 * Function to generate a new time base secrets (passwords)
	 * 
	 * @return string
	 */
	public static function generateSecret($blockSize=null){
		if($blockSize === null)
			$blockSize = self::$BLOCK_SIZE;
		
		$uniq = uniqid ();
		$uniq = substr($uniq, $blockSize / 2);
		$timeBasedSalt = substr ( self::networkEncode ( $uniq . openssl_random_pseudo_bytes ( $blockSize - strlen ( $uniq ) ) ), 0, $blockSize );
	
		return $timeBasedSalt;
	}
}
?>