<?php

/*
 * Args mandatórios
 *
 *  'authusername'  - username para autenticar a request
 *  'sessionkey' - sessionkey para autenticar a request
 *
 * Errors
 *
 *  1 - Email inválido
 *  2 - LDAP inválido
 *  3 - Sysadmin inválido
 *  4 - O campo de username é obrigatório
 *  5 - Este username já existe
 *  6 - O campo de password é obrigatório
 */
require_once 'consts.php';
require_once 'libs/ensorbac/EnsoRBACModel.php';

class Users
{
    
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

  /** 
      *   EXPECTED BEHAVIOUR: Returns a String representing the username of a specific user
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'id' - ID of the user
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewUsers'
      **/
    public static function getUserNameById($request, $response, $args){
          try{
              $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
              $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
              $userId = Input::validate($request->getParam('id'), Input::$INT);

              $idAuthUser = UserModel::getUserIdByName($authusername);

              /* 1. autenticação - validação do token */
                try{
                    $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
                }catch(Exception $e){ $mobile = false; }
                
                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

              /* 2. autorização - validação de permissões */

              if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewUsers'))
                  throw new RBACDeniedException();

              $uname = UserModel::getUserNameById($userId);


              //EnsoLogsModel::addEnsoLog($authusername, "Role $roleName added to User #$userId.", EnsoLogsModel::$NOTICE, "Users");
              return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $uname);
          }catch(RBACDeniedException $e){
              EnsoLogsModel::addEnsoLog($authusername, "Tried to user by its id (#$userId), authorization failed.", EnsoLogsModel::$ERROR, "Roles");
              return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
          }catch (Exception $e) {
              EnsoLogsModel::addEnsoLog($authusername, "Tried to user by its id (#$userId), operation failed.", EnsoLogsModel::$ERROR, "Roles");
              return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
          }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Adds a role to a specific user (user_has_roles)
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'id' - ID of the user
      *              - 'role' - name of the role
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function addRoleToUser($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $userId = Input::validate($request->getParam('id'), Input::$INT);
            $roleName = Input::validate($request->getParam('role'), Input::$STRING);

            $roleId = EnsoRBACModel::getRoleIdByName($roleName);
            //$listaDeRoles = EnsoRBACModel::getUserRoles($userId);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

            EnsoLogsModel::addEnsoLog($authusername, "Role $roleName added to User #$userId.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, EnsoRBACModel::addRoleToUser($userId, $roleId));
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add the Role $roleName to User #$userId, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add the Role $roleName to User #$userId, operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Adds a role to a list of users (user_has_roles)
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'users' - JSON list of users (e.g. users={"0":"Tony"}&role=Regular)
      *              - 'role' - name of the role
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function addRoleToUsers($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            try{
                $users = json_decode(Input::validate($request->getParam('users'), Input::$STRING), true);
            }catch(Exception $e){}
            
            $roleName = Input::validate($request->getParam('role'), Input::$STRING);

            $roleId = EnsoRBACModel::getRoleIdByName($roleName);
            //$listaDeRoles = EnsoRBACModel::getUserRoles($userId);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

            if(isset($users)){        
                /* Creates a new array with the IDs of all the users */
                $userIds = array();
                foreach($users as $i => $username){
                    array_push($userIds, UserModel::getUserIdByName($users[$i]));
                }
                
                /* Clear the table before adding the new data */
                $db = new EnsoDB(true); 
                $db->getDB()->beginTransaction();

                UserModel::clearUsersinRole('user_has_roles', $roleId);

                foreach($userIds as $userId)
                    EnsoRBACModel::addRoleToUser($userId, $roleId);

            }
            
            $db->getDB()->commit();

            EnsoLogsModel::addEnsoLog($authusername, "Role $roleName added to multiple users.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "ok");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add the Role $roleName to multiple users, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add the Role $roleName to multiple users, operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Removes a Role from an User (user_has_roles)
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'id' - ID of the user
      *              - 'role' - name of the role
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function removeRoleFromUser($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $userId = Input::validate($request->getParam('id'), Input::$INT);
            $roleName = Input::validate($request->getParam('role'), Input::$STRING);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

            EnsoRBACModel::removeRoleFromUser($userId, $roleName);

            EnsoLogsModel::addEnsoLog($authusername, "Role $roleName removed from User #$userId.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Role removed from user successfully.");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete the Role $roleName from User #$userId, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete the Role $roleName from User #$userId, operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a list of all the actions available to a specific user
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'id' - ID of the user
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewActions'
      **/
    public static function getUserActions($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $userId = Input::validate($request->getParam('id'), Input::$INT);

            $lista = EnsoRBACModel::getAvailableUserActions($userId);

            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewActions'))
                throw new RBACDeniedException();


            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $lista);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Actions for User #$userId, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Actions for User #$userId, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a list of all the roles available to a specific user
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'id' - ID of the user
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewRoles'
      **/
    public static function getUserRoles($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request

            $userId = Input::validate($request->getParam('id_user'), Input::$INT);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewRoles'))
                throw new RBACDeniedException();

            $lista = EnsoRBACModel::getUserRoles($userId);


            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $lista);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Roles for User #$userId, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Roles for User #$userId, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a list of all the tasks associated with a specific user
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'userId' - ID of the user
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewTasks'
      **/
    public static function getUserTasks($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request

            $userId = Input::validate($request->getParam('userId'), Input::$INT);

            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewTasks'))
                throw new RBACDeniedException();

            $lista = TaskModel::getUserTasks($userId);

            ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $lista);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Tasks for User #$userId, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Tasks for User #$userId, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a list of all the users which have usernames similar to the the search string indicated
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'searh' - search term/expression
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewUsers'
      **/
    public static function getMatching($request, $response, $args){
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
            $search = Input::validate($request->getParam('search'), Input::$STRING);

            $idAuthUser = UserModel::getUserIdByName($authusername);
        
        /* 1. autenticação - validação do token */
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername);

        /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewUsers'))
                throw new RBACDeniedException();

        /* 3. validação de inputs */

            $string = '%' . $search . '%';

        /* 4. executar operações */

            $listaDeUsers = UserModel::getWhere(
                [
                    'username' => ["LIKE", $string]
                ],
                [
                    "username",
                    "email"
                ]
            );

            //TODO: May be missing some attributes returned due to not consulting view

        /* 5. response */

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $listaDeUsers);
        } catch (BadInputValidationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (PermissionDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get users matching $search, operation failed due to lack of permissions.", EnsoLogsModel::$NOTICE, "User");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get users matching $search, operation failed due to lack of RBAC permissions.", EnsoLogsModel::$NOTICE, "User");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (AuthenticationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
        } catch (Exception $e) {
            EnsoDebug::var_error_log($e);
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get users matching $search, operation failed.", EnsoLogsModel::$ERROR, "User");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns the user data associated with a specific username
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - user's username
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewUsers'
      **/
    public static function getInfoByUsername($request, $response, $args){
        try {

            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
            $username = Input::validate($request->getParam("username"), Input::$STRING);

            $idAuthUser = UserModel::getUserIdByName($authusername);
           
            /* 1. autenticação - validação do token */
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername);


            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewUsers') && $authusername != $username)
                throw new RBACDeniedException();


            /* 3. Data Gathering */
            $lista = UserModel::getWhere(["username" => $username]);

            foreach($lista as $i => $user){
                $userVacs = VacationModel::getUserVacDays($user['id_user']);

                foreach($userVacs as $j => $vacs){
                    //$lista[$i]['vac_days'][$vacs['year']] = $vacs['days'];
                    $lista[$i]['vac_days'][$vacs['year']]['days'] = $vacs['days'];
                    $lista[$i]['vac_days'][$vacs['year']]['days_remaining'] = $vacs['days_remaining'];
                }
            }


            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $lista);
        } catch (EntityCheckFailureException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_FOUND, "Element not found. Exception:". $e->getCode());
        } catch (BadInputValidationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (PermissionDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get user $username, operation failed due to lack of permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get user $username, operation failed due to lack of RBAC permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (AuthenticationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($username, "Tried to get user $username, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with all users and their data (including their vac_days entries)
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewUsers'
      **/
    public static function getAllUsers($request, $response, $args){
        try {

            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);


            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewUsers'))
                throw new RBACDeniedException();

            /* 3. Data Gathering */
            $lista = UserModel::getAll();
            foreach($lista as $i => $user){
                $userVacs = VacationModel::getUserVacDays($user['id_user']);
                foreach($userVacs as $j => $vacs){
                    //$lista[$i]['vac_days'][$vacs['year']] = [$vacs['days'], $vacs['days_remaining']];
                    $lista[$i]['vac_days'][$vacs['year']]['days'] = $vacs['days'];
                    $lista[$i]['vac_days'][$vacs['year']]['days_remaining'] = $vacs['days_remaining'];
                }
            }
            

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $lista);
        } catch (EntityCheckFailureException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_FOUND, "Element not found. Exception:". $e->getCode());
        } catch (BadInputValidationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (PermissionDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all users, operation failed due to lack of permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all users, operation failed due to lack of RBAC permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (AuthenticationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($username, "Tried to get all users, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }


    /** 
      *   EXPECTED BEHAVIOUR: Adds VAC_DAYS record for a specific year & a specific user. If the record for that year already exists, it replaces its value with the new one
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - username of the user to which we want to add vac days
      *              - 'vac_days' - vacation days to add to the user
      *              - 'year' - with which year are those vac days associated?
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function addUsersVac_days($request, $response, $args){
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
            $username = Input::validate($request->getParam("username"), Input::$STRICT_STRING);
            $vac_days = Input::validate($request->getParam("vac_days"), Input::$INT);
            $year = Input::validate($request->getParam("year"), Input::$INT);
            $idAuthUser = UserModel::getUserIdByName($authusername);
            $id_user = UserModel::getUserIdByName($username);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

            UserModel::addVacDays($id_user, $year, $vac_days); 

            EnsoLogsModel::addEnsoLog($authusername, "Added $vac_days vac days to user '$username' in $year.", EnsoLogsModel::$INFORMATIONAL, 'Users');

        /* 5. response */

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Added vac days to user '$username' in $year.");
        } catch (BadInputValidationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_ACCEPTABLE, $e);
        } catch (PermissionDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit User $username, operation failed due to lack of permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit User $username, operation failed due to lack of RBAC permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (AuthenticationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit User $username, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Changes the VAC_DAYS record for a specific year & a specific user. If the record for that year doesn't exist, it is added as a new entry
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - username of the user to which we want to change vac days
      *              - 'vac_days' - vacation days to add to the user
      *              - 'year' - with which year are those vac days associated?
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function changeUsersvac_days($request, $response, $args){
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
            $username = Input::validate($request->getParam("username"), Input::$STRICT_STRING);
            $vac_days = Input::validate($request->getParam("vac_days"), Input::$INT);
            $year = Input::validate($request->getParam("year"), Input::$INT);
            $idAuthUser = UserModel::getUserIdByName($authusername);
            $id_user = UserModel::getUserIdByName($username);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers') &&  $authusername !== $username)
                throw new RBACDeniedException();


            


            UserModel::editVacDays($id_user, $year, $vac_days); 

            EnsoLogsModel::addEnsoLog($authusername, "Updated user '$username' vac days.", EnsoLogsModel::$INFORMATIONAL, 'Users');

        /* 5. response */

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "User vac days updated with success.");
        } catch (BadInputValidationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (PermissionDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit User $username, operation failed due to lack of permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit User $username, operation failed due to lack of RBAC permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (AuthenticationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit User $username, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Edits/Updates user information
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - username of the user to which we want to perform this action
      *              - 'email'
      *              - 'newUsername' (OPTIONAL)
      *              - 'password' (OPTIONAL)
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function editUser($request, $response, $args){
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
            $username = Input::validate($request->getParam("username"), Input::$STRICT_STRING);
            $email = Input::validate($request->getParam("email"), Input::$EMAIL);
            //$ldap = (int)Input::validate($request->getParam("ldap"), Input::$BOOLEAN);
            
            $password = null;
            $notifications = null;
            $newUsername = null;
           
            try{
                $newUsername = Input::validate($request->getParam("newUsername"), Input::$STRICT_STRING);
            }catch(Exception $e){}
            
            try{
                $password = Input::validate($request->getParam("password"), Input::$STRICT_STRING);
            }catch(Exception $e){}
            try{
                $notifications = $request->getParam("notifications");
            }catch(Exception $e){}
            

            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers') &&  $authusername !== $username)
                throw new RBACDeniedException();

              $db = new EnsoDB(true); 
              $db->getDB()->beginTransaction();
              UserModel::editWhere(
                  [
                      'username' => $username
                  ],
                  [   
                      "email" => $email,
                  ]
              );

              /* Optional Fields */
              if($notifications){ 
                   UserModel::editWhere(
                      [
                          'username' => $username
                      ],
                      [
                          "notifications" => $notifications
                      ]
                  );
              }

              if($password){ // if a new password is defined
                   UserModel::editWhere(
                      [
                          'username' => $username
                      ],
                      [
                          "password" => EnsoShared::hash($password),
                      ]
                  );
              }
              

              if($newUsername){ // if a new username is defined
                   UserModel::editWhere(
                      [
                          'username' => $username
                      ],
                      [
                          "username" => $newUsername
                      ]
                  );
              }
              $db->getDB()->commit();
            EnsoLogsModel::addEnsoLog($authusername, "Edited user '$username'.", EnsoLogsModel::$INFORMATIONAL, 'Users');

        /* 5. response */

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "User edited with success.");
        } catch (BadInputValidationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (PermissionDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit User $username, operation failed due to lack of permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit User $username, operation failed due to lack of RBAC permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (AuthenticationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit User $username, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Adds a new user
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - username of the user to which we want to perform this action
      *              - 'email'
      *              - 'ldap' - is the user a local user or connected through ldap?
      *              - 'password' 
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function addUser($request, $response, $args){
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);

            $username = Input::validate($request->getParam("username"), Input::$STRICT_STRING, 4);
            $email = Input::validate($request->getParam("email"), Input::$EMAIL, 1);
            $ldap = (int)Input::validate($request->getParam("ldap"), Input::$BOOLEAN, 2);
            //$sysadmin = (int)Input::validate($request->getParam("sysadmin"), Input::$BOOLEAN, 3);
            $password = Input::validate($request->getParam("password"), Input::$STRICT_STRING, 6);

            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();
        /* 4. executar operações */
            UserModel::insert(
                [
                    'username' => $username,
                    'email' => $email,
                    'ldap' => $ldap,
                    'password' => EnsoShared::hash($password),
                    'notifications' => 1 // set to 1 by default; can be changed by the user later on
                ]
            );


            EnsoLogsModel::addEnsoLog($authusername, "Added user '$username'.", EnsoLogsModel::$INFORMATIONAL, 'Users');

        /* 5. response */
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "User added with success.");
        } catch (BadInputValidationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (PermissionDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried add an User, operation failed due to lack of permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add an User, operation failed due to lack of RBAC permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (AuthenticationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add an User, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Removes an User
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - username of the user to which we want to perform this action
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function removeUser($request, $response, $args){
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);

            $username = Input::validate($request->getParam("username"), Input::$STRING);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            $id_user = UserModel::getUserIdByName($username);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            $db = new EnsoDB(true); 
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
           
            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

            // Remove references from the user in user_has_roles & user_has_tasks, Vacations & work_blocks & user_has_groups & vac_days & notifications

            $db->getDB()->beginTransaction();
            
            UserModel::removeUserFromRoleJoin($id_user, true); // user_has_roles
            //UserModel::removeUserFromTasks($id_user, true); // tasks
            UserModel::removeUserFromTaskJoin($id_user, true); // user_has_tasks
            UserModel::removeUserFromVacDays($id_user, true); // vac_days
            UserModel::removeUserFromVac($id_user, true); // vacations
            UserModel::removeUserFromwork_blocksJoin($id_user, true); // work_blocks
            UserModel::removeUserFromGroupJoin($id_user, true); // user_has_groups
            UserModel::removeUserFromNotifications($id_user, true); // notifications

            /* Delete the user */
            UserModel::delete(['username' => $username], true);

            $db->getDB()->commit();

            EnsoLogsModel::addEnsoLog($authusername, "Removed user '$username'.", EnsoLogsModel::$INFORMATIONAL, 'Users');

            /* 5. response */

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "User Removed with success.");
        } catch (BadInputValidationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (PermissionDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to remove an User, operation failed due to lack of permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to remove an User, operation failed due to lack of RBAC permissions.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
        } catch (AuthenticationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to remove an User, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "" . $e);
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Adds a task to an User (user_has_tasks)
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - username of the user to which we want to perform this action
      *              - 'id_task' - ID of the task
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function addTaskToUser($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $username = Input::validate($request->getParam('username'), Input::$STRICT_STRING);
            $id_task = Input::validate($request->getParam('id_task'), Input::$INT);
            $id_user = UserModel::getUserIdByName($username);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

                TaskModel::addTaskToUser($id_user, $id_task);
                EnsoLogsModel::addEnsoLog($authusername, "Added (#$id_task) to User #$id_user.", EnsoLogsModel::$NOTICE, "Users");

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Task added to user successfully.");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Task (#$id_task) to User #$id_user, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch(Exception $e){
            EnsoLogsModel::addEnsoLog($username, "Tried to add a Task (#$id_task) to User #$id_user, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Removes a task from an User (user_has_tasks)
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - username of the user to which we want to perform this action
      *              - 'id_task' - ID of the task
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function removeTaskFromUser($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $username = Input::validate($request->getParam('username'), Input::$STRICT_STRING);
            $id_task = Input::validate($request->getParam('id_task'), Input::$INT);
            $id_user = UserModel::getUserIdByName($username);

            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

            TaskModel::removeTaskFromUser($id_user, $id_task);
            EnsoLogsModel::addEnsoLog($authusername, "Removed (#$id_task) from User #$id_user.", EnsoLogsModel::$NOTICE, "Users");

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Task removed from user successfully.");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to remove a Task (#$id_task) from User $username, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch(Exception $e){
            EnsoLogsModel::addEnsoLog($username, "Tried to remove a Task (#$id_task) from User $username, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Returns an integer representing the number of users in the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewUsers'
      **/
    public static function getUsersCounter($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request

                $id_user = UserModel::getUserIdByName($authusername);

                /* 1. autenticação - validação do token */
                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername);

                /* 2. autorização - validação de permissões */
                if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewUsers'))
                    throw new RBACDeniedException();


                $cnt = UserModel::getCounter();

                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $cnt);
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get Users counter, authorization failed.", EnsoLogsModel::$ERROR, "Users");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get Users counter, operation failed.", EnsoLogsModel::$ERROR, "Users");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
            }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Returns a list of Users and their roles
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewUsers'
      **/
    public static function getUsersRolesList($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request

                $id_user = UserModel::getUserIdByName($authusername);

                /* 1. autenticação - validação do token */
                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername);

                /* 2. autorização - validação de permissões */
                if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewUsers'))
                    throw new RBACDeniedException();


                $list = UserModel::getUserRolesList();
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get Users Roles List, authorization failed.", EnsoLogsModel::$ERROR, "Users");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get Users Roles List, operation failed.", EnsoLogsModel::$ERROR, "Users");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
            }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a list of Users and their groups
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewUsers'
      **/
    public static function getUsersGroupsList($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request

                $id_user = UserModel::getUserIdByName($authusername);

                /* 1. autenticação - validação do token */
                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername);

                /* 2. autorização - validação de permissões */
                if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewUsers'))
                    throw new RBACDeniedException();


                $list = UserModel::getUserGroupsList();
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get Users Groups List, authorization failed.", EnsoLogsModel::$ERROR, "Users");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get Users Groups List, operation failed.", EnsoLogsModel::$ERROR, "Users");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
            }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Adds multiple users to a role in one request
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'group' - name of the group
      *              - 'users' - array of users to which we want to add the role
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function addGroupToUsers($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            try{
                $users = json_decode(Input::validate($request->getParam('users'), Input::$STRING), true);
            }catch(Exception $e){}

            $groupName = Input::validate($request->getParam('group'), Input::$STRING);

            $groupId = GroupModel::getGroupIdByName($groupName);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

             if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException(); 

            if(isset($users)){  
                     
                /* Creates a new array with the IDs of all the users */
                $userIds = array();
                foreach($users as $i => $username){
                    array_push($userIds, UserModel::getUserIdByName($users[$i]));
                }
                
                /* Clear the table before adding the new data */
                $db = new EnsoDB(true); 
                $db->getDB()->beginTransaction();
                
                GroupModel::clearUsersinGroup($groupId, true);
                
                foreach($userIds as $userId)
                    GroupModel::addGroupToUser($userId, $groupId, true);
              }

                $db->getDB()->commit();

            EnsoLogsModel::addEnsoLog($authusername, "Group $groupName added to multiple users.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "ok");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add the Group $groupName to multiple users, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add the Group $groupName to multiple users, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }


    /** 
      *   EXPECTED BEHAVIOUR: Removes multiple users from a role in one request
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'group' - name of the group
      *              - 'id' - id of the user
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function removeGroupFromUser($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $userId = Input::validate($request->getParam('id'), Input::$INT);
            $groupName = Input::validate($request->getParam('group'), Input::$STRING);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

            $groupId = GroupModel::getGroupIdByName($groupName)[0]['id_group'];

            GroupModel::removeGroupFromUser($userId, $groupId);
            
            EnsoLogsModel::addEnsoLog($authusername, "Group $groupName removed from User #$userId.", EnsoLogsModel::$NOTICE, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Group removed from user successfully.");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete the Group $groupName from User #$userId, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete the Group $groupName from User #$userId, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with user data
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - name of the user
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function getUserData($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $username = Input::validate($request->getParam('username'), Input::$STRING);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            $idUser = UserModel::getUserIdByName($username);

            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers') && $idUser != $idAuthUser)
                throw new RBACDeniedException();

            $list = array();
            $list['data'] = UserModel::getWhere(['id_user' => $idUser], ['id_user', 'username', 'email', 'ldap'])[0];
            $list['roles'] = RoleModel::getAllUserRoles($idUser, true);
            $list['groups'] = GroupModel::getAllUserGroups($idUser, true);

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for $username, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for $username, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with user data
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - name of the user
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function getAllUsersWithRole($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            //$roleName = Input::validate($request->getParam('roleName'), Input::$STRING);
            try{
                $roles = json_decode(Input::validate($request->getParam('roles'), Input::$STRING), true);
            }catch(Exception $e){$roles = array();}
            $idAuthUser = UserModel::getUserIdByName($authusername);


            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();
 
            $list = UserModel::getAllUsersWithRoles($roles, false);

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for $username, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for $username, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

     /** 
      *   EXPECTED BEHAVIOUR: Returns a list with user data
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'username' - name of the user
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function getAllUsersWithGroup($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            //$roleName = Input::validate($request->getParam('roleName'), Input::$STRING);
            try{
                $groups = json_decode(Input::validate($request->getParam('groups'), Input::$STRING), true);
            }catch(Exception $e){$groups = array();}
            $idAuthUser = UserModel::getUserIdByName($authusername);

            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

            if(empty($groups)) $list = array();
            else $list = UserModel::getAllUsersWithGroups($groups, false);

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for $username, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for $username, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with all groups and roles
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function getAllGroupsAndRoles($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            
            $idAuthUser = UserModel::getUserIdByName($authusername);

            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();
            
            $list['roles'] = RoleModel::getAll(['name']);
            $list['groups'] = GroupModel::getAll(['name']);

            $db->getDB()->commit();

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for $authusername, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for $authusername, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with all groups and roles
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageUsers'
      **/
    public static function getAllUsersWithGroupsAndRoles($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            //$roleName = Input::validate($request->getParam('roleName'), Input::$STRING);
            try{
                $groups = json_decode(Input::validate($request->getParam('groups'), Input::$STRING), true);
            }catch(Exception $e){$groups = array();}
            try{
                $roles = json_decode(Input::validate($request->getParam('roles'), Input::$STRING), true);
            }catch(Exception $e){$roles = array();}
            $idAuthUser = UserModel::getUserIdByName($authusername);

            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageUsers'))
                throw new RBACDeniedException();

            if(empty($groups) && empty($roles)) $list = array();
            else $list = UserModel::getAllUsersWithGroupsAndRoles($groups, $roles, false);

            foreach($list as $i => $user){
                $userVacs = VacationModel::getUserVacDays($user['id_user']);
                foreach($userVacs as $j => $vacs){
                    //$list[$i]['vac_days'][$vacs['year']] = [$vacs['days'], $vacs['days_remaining']];
                    $list[$i]['vac_days'][$vacs['year']]['days'] = $vacs['days'];
                    $list[$i]['vac_days'][$vacs['year']]['days_remaining'] = $vacs['days_remaining'];
                }
            }

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for $username, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for $username, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with the names of all groups, roles & users
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewUsers'
      **/
    public static function getAllUsersGroupsAndRolesNames($request, $response, $args){
      try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $idAuthUser = UserModel::getUserIdByName($authusername);
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewUsers'))
                throw new RBACDeniedException();

           $list = UserModel::getAllUsersGroupsAndRolesNames();

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for all users, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to the get Data for all users, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


}




$app->get('/users/search/', 'Users::getMatching');
$app->get('/users/all/', 'Users::getAllUsers');
$app->get('/users/', 'Users::getInfoByUsername');
$app->put('/users/', 'Users::editUser');
$app->post('/users/', 'Users::addUser');
$app->delete('/users/', 'Users::removeUser');
$app->get('/users/roles/', 'Users::getUserRoles');
$app->post('/users/roles/', 'Users::addRoleToUser');
$app->post('/users/roles/mass/', 'Users::addRoleToUsers');
$app->delete('/users/roles/', 'Users::removeRoleFromUser');
$app->get('/users/actions/', 'Users::getUserActions');
$app->get('/users/tasks/', 'Users::getUserTasks');
$app->post('/users/tasks/', 'Users::addTaskToUser');
$app->delete('/users/tasks/', 'Users::removeTaskFromUser');
$app->put('/users/vac/', 'Users::changeUsersvac_days');
$app->post('/users/vac/', 'Users::addUsersVac_days');
$app->get('/users/username/', 'Users::getUsernameById');
$app->get('/users/counter/', 'Users::getUsersCounter');
$app->get('/users/roles/list/', 'Users::getUsersRolesList');
$app->post('/users/groups/', 'Users::addGroupToUsers');
$app->delete('/users/groups/', 'Users::removeGroupFromUser');
$app->get('/users/groups/list/', 'Users::getUsersGroupsList');
$app->get('/users/data/', 'Users::getUserData');
$app->get('/users/roles/all/', 'Users::getAllUsersWithRole');
$app->get('/users/groups/all/', 'Users::getAllUsersWithGroup');
$app->get('/groups/roles/all/', 'Users::getAllGroupsAndRoles');
$app->get('/users/groups/roles/all/', 'Users::getAllUsersWithGroupsAndRoles');
$app->get('/users/groups/roles/names/', 'Users::getAllUsersGroupsAndRolesNames');
