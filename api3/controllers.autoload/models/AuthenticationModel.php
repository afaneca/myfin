<?php
class AuthenticationModel
{

    /**
     * Função para verificar se o utilizador e a password correspondem
     *
     * @param string $username
     * @param string $password plain-text password
     * @return TRUE a autenticação for feita com sucesso, FALSE senão
     */
    public static function performCredentialCheck($username, $password)
    {
        

        // If the user doesnt exist in the local DB, maybe its his first time acessing the app (and he is registered in LDAP)
        if (!UserModel::exists([
                "username" => $username,
            ])){
        	return self::performExternalCredentialCheck($username, $password);
        }

        $user = UserModel::getWhere(
            [
                'username' => $username
            ]
        )[0];

        if ($user['ldap'] == 1) {
            return self::performExternalCredentialCheck($username, $password);
        } else {
            return self::performInternalCredentialCheck($password, $user);
        }
    }

    /**
     * Função para gerar uma nova sessionkey para o utilizador
     *
     * @param string $username
     * @return sessionkey se for gerada com sucesso, FALSE se ocorreu um erro
     */
    public static function generateNewsessionkeyForUser($username, $mobile = false)
    {
        $renewTime = '+30 minutes';
        if($mobile) $renewTime = '+1 month';
        
        error_log($username . ' - renewTime: '.$renewTime);
        $newkey = EnsoShared::generateSecret();
        
        $id_user = UserModel::getUserIdByName($username);
        
        if(!$mobile){
            UserModel::editWhere(
            [
                "id_user" => $id_user
            ],
            [
                "sessionkey" => $newkey,
                "trustlimit" => strtotime($renewTime)
            ]
            );
        }else{
            UserModel::editWhere(
            [
                "id_user" => $id_user
            ],
            [
                "sessionkey_mobile" => $newkey,
                "trustlimit_mobile" => strtotime($renewTime)
            ]
            );
        }
        

        return $newkey;
    }

    /**
     * Função para verificar se o utilizador e a sessionkey são válidas
     *
     * @param string $username
     * @param string $sessionkey chave de sessão a verificar
     * @return TRUE se estiver válida, FALSE senão
     */
    public static function checkIfsessionkeyIsValid($key, $username, $renewtrustlimit = true, $mobile = false)
    {
        $renewTime = '+30 minutes';
        if($mobile) $renewTime = '+1 month';
        if($renewtrustlimit) error_log('renewTime 2: '.$renewTime);
        else error_log($username . ' - renewTime 2: ' . $renewTime . '. TrustLimit WILL NOT be renewed.');
        
        try{
            if(!$mobile){
                if (UserModel::exists([
                "username" => $username,
                "sessionkey" => $key,
                "trustlimit" => [">", time()]
            ])) {
    
                if ($renewtrustlimit) {
                    UserModel::editWhere(
                        [
                            'username' => $username
                        ],
                        [
                            'trustlimit' => strtotime($renewTime)
                        ]
                    );
                }
    
                return true;
            } else {
                throw new AuthenticationException($username);
            }
        }else{
            if (UserModel::exists([
                "username" => $username,
                "sessionkey_mobile" => $key,
                "trustlimit_mobile" => [">", time()]
            ])) {
    
                if ($renewtrustlimit) {
                    UserModel::editWhere(
                        [
                            'username' => $username
                        ],
                        [
                            'trustlimit_mobile' => strtotime($renewTime)
                        ]
                    );
                }
    
                return true;
            } else {
                throw new AuthenticationException($username);
            }
        }
            
        }catch(Exception $e){
            throw new AuthenticationException($username);
        }
        
    }

    public static function performInternalCredentialCheck($password, $userdata)
    {
        if ($userdata !== false && $userdata["password"] == EnsoShared::hash($password)) {
			//error_log('erewrwerw');
            return true;
        } else {
			//error_log('eeeeeeerrrrrrrrrrrrro');
            throw new AuthenticationException($userdata["username"]);
        }
    }

    public static function performExternalCredentialCheck($username, $password)
    {

		global $ldapConfig;

		/* connect as anon */
		$ds = ldap_connect($ldapConfig['host'], $ldapConfig['port']);

		/*
		if(!$ds){
			return new AuthenticationException($username);
		}
		*/

		ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);
		ldap_set_option($ds, LDAP_OPT_REFERRALS, 0);
		ldap_set_option($ds, LDAP_OPT_NETWORK_TIMEOUT, $ldapConfig['timeout']);

				
		/* search user */
		$formattedSearch = sprintf($ldapConfig['query'], $username, $username);
		$userSearch = ldap_search($ds, $ldapConfig['mainDn'], $formattedSearch);
		/*
		if($userSearch){
			throw new AuthenticationException($username);
		}
		*/
		$userEntry = ldap_first_entry($ds, $userSearch);

		if ($userEntry === false) //No user found
			//return 0;
			//return new AuthenticationException($username);
			//return 0;
			throw new AuthenticationException($username);

		$userDn = ldap_get_dn($ds, $userEntry);
		
		/* try to auth as user */
		if (@$bind = ldap_bind($ds, $userDn, $password)) {
			//connected successfully, auth ok
			$filter="(objectclass=*)"; // this command requires some filter
			$attributes = array("mail"); //the attributes to pull
			$sr = ldap_read($ds, $userDn, $filter, $attributes);
			$entry1 = ldap_get_entries($ds, $sr);
			$userEmail = $entry1[0]['mail'][0];
			
			self::syncWithLocalBD($username, $userEmail);
			
			@ldap_close($ds);
			return true;
		} else {
			/* failed to connect bad auth */
			throw new AuthenticationException($username);
		}

    }
	
    /*
     If it's the first time the user logs in => adds its data to the DB
     Else => updates its info in the DB
    */
	public static function syncWithLocalBD($username, $email){
		// Default Attributes
		$ldap = true;
		$notifications = true;
		$password = 0;

		$sql =  'INSERT INTO users (username, email, ldap, password, notifications)' .
                ' VALUES(:username, :email, :ldap, :password, :notifications)' . 
                ' ON CONFLICT ON CONSTRAINT username_uq' . 
                ' DO UPDATE SET email = :email';


            $values = array();
            $values[':username'] = $username;
            $values[':email'] = $email;
            $values[':ldap'] = $ldap;
            $values[':password'] = $password;
            $values[':notifications'] = $notifications;

            try{
                $db = new EnsoDB(false);
                $db->prepare($sql);
                $db->execute($values);

                return true;
            }catch(Exception $e){
                return $e;
            }
	
    }
}
