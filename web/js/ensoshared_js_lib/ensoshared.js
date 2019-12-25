var EnsoShared = {
	VERSION: "5.0.0",

	ENSO_REST_OK: 200,
	ENSO_REST_CREATED: 201,
	ENSO_REST_UPDATE_DELETED: 202,
	ENSO_REST_BAD_REQUEST: 400,
	ENSO_REST_NOT_AUTHORIZED: 401,
	ENSO_REST_FORBIDDEN: 403,
	ENSO_REST_NOT_FOUND: 404,
	ENSO_REST_NOT_ACCEPTABLE: 406,
	ENSO_REST_INTERNAL_SERVER_ERROR: 500,

	BLOCK_SIZE: 16,
	NETWORK_ENCODE_SAFE_CHAR: " ",
	DIVIDER: ")(",

	/**
	 * Função de unpadding, na versão atual da lib são retirados os bytes que foram
	 * acrescentados no final dos dados até preencher o blocksize com informação
	 * (caracter que representa o número de padding necessário) PKCS7
	 * 
	 * @param string
	 *            data dados a encriptar
	 * @param string
	 *            key chave de encriptação
	 */
	ensoUnpad: function (text) {
		return text.substring(0, text.length - text.charCodeAt(text.length - 1));
	},

	/**
	 * Função de padding, na versão atual da lib são acrescentados bytes no final
	 * dos dado até preencher o blocksize com informação (caracter que representa o
	 * número de padding necessário) PKCS7
	 * 
	 * @param string
	 *            text dados a encriptar
	 */
	ensoPad: function (text) {
		var pad_size = EnsoShared.BLOCK_SIZE - (text.length % EnsoShared.BLOCK_SIZE);
		for (var i = 0; i < pad_size; i++)
			text += String.fromCharCode(pad_size);
		return text;
	},

	/**
	 * Função de encriptação, na versão atual da lib é estabelecido a utilização de
	 * AES 256 CBC
	 * 
	 * @param string
	 *            data dados a encriptar
	 * @param string
	 *            key chave de encriptação
	 */
	encrypt: function (data, key) {
		iv = "";

		for (i = 0; i < 16; i++)
			iv += String.fromCharCode(EnsoShared._getRandomByte());

		var textBytes = EnsoShared.stringToBytes(EnsoShared.ensoPad(data));

		var aesCbc = new aesjs.ModeOfOperation.cbc(EnsoShared.stringToBytes(key), EnsoShared.stringToBytes(iv));
		var encryptedBytes = aesCbc.encrypt(textBytes);

		var encrypted = EnsoShared.stringFromBytes(encryptedBytes);

		return (EnsoShared.networkEncode(encrypted) + EnsoShared.DIVIDER + EnsoShared.networkEncode(iv));
	},

	/**
	 * Função de desencriptação, na versão atual da lib é estabelecido a utilização
	 * de AES 256 CBC
	 * 
	 * @param string
	 *            data dados a desencriptar
	 * @param string
	 *            key chave de encriptação
	 */
	decrypt: function (data, key) {
		tokens = data.split(EnsoShared.DIVIDER, 2);

		tokens[0] = EnsoShared.networkDecode(EnsoShared.netUrlDecode(tokens[0]));
		tokens[1] = EnsoShared.networkDecode(EnsoShared.netUrlDecode(tokens[1]));

		var encryptedBytes = EnsoShared.stringToBytes(tokens[0]);

		var aesCbc = new aesjs.ModeOfOperation.cbc(EnsoShared.stringToBytes(key), EnsoShared.stringToBytes(tokens[1]));
		var decryptedBytes = aesCbc.decrypt(encryptedBytes);

		var decryptedText = EnsoShared.ensoUnpad(EnsoShared.stringFromBytes(decryptedBytes));

		return decryptedText;
	},

	/**
	 *	Função que converte um array de bytes numa string corretamente codificada
	 * @param array
	 *            bytes, bytes a codificar
	 *
	 *	@return string codificada
	 */
	stringFromBytes: function (bytes) {
		str = "";

		for (i = 0; i < bytes.length; i++) {
			str += String.fromCharCode(bytes[i]);
		}

		return str;
	},

	/**
	 *	Função que converte uma string num array com os bytes correspondentes a cada caracter
	 * @param string
	 *            str dados a converter
	 *
	 *	@return array de bytes
	 */
	stringToBytes: function (str) { // @http://tech.chitgoks.com/2012/09/13/convert-string-to-bytes-in-javascript/
		var ch, st, re = [];
		for (var i = 0; i < str.length; i++) {
			ch = str.charCodeAt(i);  // get char 
			st = [];                 // set up "stack"
			do {
				st.push(ch & 0xFF);  // push byte to stack
				ch = ch >> 8;          // shift value down by 1 byte
			}
			while (ch);
			// add stack contents to result
			// done because chars have "wrong" endianness
			re = re.concat(st.reverse());
		}
		// return an array of bytes
		return re;
	},

	/**
	 *	Função que retorna o tempo actual em segundos UNIX
	 *
	 *	@return retorna tempo actual em segundos UNIX
	 */
	now: function () {
		return Math.floor(new Date().getTime() / 1000);
	},

	/**
	*	Função que retorna o tempo actual em milisegundos UNIX
	*
	*	@return retorna tempo actual em milisegundos UNIX
	*/
	nowMillis: function () {
		return new Date().getTime();
	},


	/**
	 * Função de codificação para transferência em rede, na versão atual da lib é
	 * estabelecido como recurso a utilização de base64
	 * 
	 * @param string
	 *            data dados a codificar
	 */
	networkEncode: function (data) {
		if (data == null) {
			return EnsoShared.netUrlEncode(btoa(""));
		}
		else
			return EnsoShared.netUrlEncode(btoa(data));
	},

	/**
	 * Função de descodificação de dados codificados para transferência em rede, na
	 * versão atual da lib é estabelecido como recurso a utilização de base64
	 * 
	 * @param string
	 *            data dados a descodificar
	 */
	networkDecode: function (data) {
		return atob(EnsoShared.netUrlDecode(data));
	},

	/**
	 * Funcção que substitui os caracteres que não podem ser tranmitidos no url
	 * e que fazem parte do dicionario do Base64
	 * 
	 * @param String na qual será feito o UrlEncode
	 * @return string com o resultado do UrlEncode
	 */
	netUrlEncode: function (data) {
		var find = '\\+';
		var re = new RegExp(find, 'g');
		data = data.replace(re, '-');

		var find2 = '/';
		var re2 = new RegExp(find2, 'g');
		data = data.replace(re2, '_');

		var find3 = '=';
		var re3 = new RegExp(find3, 'g');
		data = data.replace(re3, ':');

		return data;
	},

	/**
	 * Funcção que repõe os caracteres que não podem ser tranmitidos no url
	 * e que fazem parte do dicionario do Base64
	 * 
	 * @param string na qual será feito o UrlDecode
	 * @return string com o resultado do UrlDecode
	 */
	netUrlDecode: function (data) {
		var find = '-';
		var re = new RegExp(find, 'g');
		data = data.replace(re, '+');

		var find2 = '_';
		var re2 = new RegExp(find2, 'g');
		data = data.replace(re2, '/');

		var find3 = ':';
		var re3 = new RegExp(find3, 'g');
		data = data.replace(re3, '=');

		return data;
	},


	/**
	 * Função de criação de hash SHA-512 a partir de uma string
	 * 
	 * @param string
	 *            data dados a codificar
	 */
	hash: function (data) {
		return sha512(data).toLowerCase();
	},


	/**
	 * Função que normaliza uma key com base no block_size utilizado na encriptação/desencriptação
	 * 
	 * @param String a ser normalizada
	 * @return string normalizada ou null caso haja algo incorrecto com a string de input
	 */
	normalizeKey: function (initHash) {
		if (initHash == "") {
			return null;
		} else if (initHash.length == EnsoShared.BLOCK_SIZE) {
			return initHash;
		} else if (initHash.length < EnsoShared.BLOCK_SIZE) {
			while (initHash.length < EnsoShared.BLOCK_SIZE) {
				initHash += initHash;
			}
			return initHash.substring(0, EnsoShared.BLOCK_SIZE);
		} else if (initHash.length > EnsoShared.BLOCK_SIZE) {
			return initHash.substring(0, EnsoShared.BLOCK_SIZE);
		}
		return null;
	},

	_getRandomByte: function () {
		// http://caniuse.com/#feat=getrandomvalues
		if (window.crypto && window.crypto.getRandomValues) {
			var result = new Uint8Array(1);
			window.crypto.getRandomValues(result);
			return result[0];
		}
		else if (window.msCrypto && window.msCrypto.getRandomValues) {
			var result = new Uint8Array(1);
			window.msCrypto.getRandomValues(result);
			return result[0];
		}
		else {
			return Math.floor(Math.random() * 256);
		}
	},

	init: function () {

		var files = ["aesjs.js", "sha512.js"];
		$.each(files, function (index, val) {

			$.ajax({
				url: "js/ensoshared_js_lib/" + val,
				dataType: "script",
				async: false,
			});
		});
	}
}

EnsoShared.init();