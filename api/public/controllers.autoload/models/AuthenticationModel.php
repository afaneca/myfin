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
        
        if (!UserModel::exists([
            "username" => $username,
        ])) {
            return false;
        }
        
        $user = UserModel::getWhere(
            [
                'username' => $username
            ]
        )[0];
        
        return self::performInternalCredentialCheck($password, $user);

        /* // If the user doesnt exist in the local DB, maybe its his first time acessing the app (and he is registered in LDAP)
        if (!UserModel::exists([
            "username" => $username,
        ])) {
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
        } */
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
        if ($mobile) $renewTime = '+1 month';

        error_log($username . ' - renewTime: ' . $renewTime);
        
        $newkey = EnsoShared::generateSecret();
          
        $id_user = UserModel::getUserIdByName($username);
        
        if (!$mobile) {
            UserModel::editWhere(
                [
                    "user_id" => $id_user
                ],
                [
                    "sessionkey" => $newkey,
                    "trustlimit" => strtotime($renewTime)
                ]
            );
        } else {
            UserModel::editWhere(
                [
                    "user_id" => $id_user
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
        if ($mobile) $renewTime = '+1 month';
        if ($renewtrustlimit) error_log('renewTime 2: ' . $renewTime);
        else error_log($username . ' - renewTime 2: ' . $renewTime . '. TrustLimit WILL NOT be renewed.');
        

        try {
            if (!$mobile) {
                
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
            } else {
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
        } catch (Exception $e) {
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
}
