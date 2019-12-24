<?php

class Roles
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)


    /** 
      *   EXPECTED BEHAVIOUR: Removes a role from the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'roleName' - original name of the group
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageRoles'
      **/
    public static function removeRole($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $roleName = Input::validate($request->getParam('roleName'), Input::$STRING);

            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageRoles'))
                throw new RBACDeniedException();

            // Before deleting the role from the DB,
            // we need to first delete every reference to it that may exist in role_has_actions & user_has_roles
            $roleId = EnsoRBACModel::getRoleIdByName($roleName);

            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();
            
            RoleModel::removeRoleFromActionJoin($roleId); // If any instance of this role is found in role_has_actions, it'll be deleted
            RoleModel::removeRoleFromUserJoin($roleId); // If any instance of this role is found in user_has_roles, it'll be deleted
            RoleModel::removeRoleFromTaskJoin($roleId); // role_has_tasks
            RoleModel::removeRoleFromWorkBlockJoin($roleId); // role_has_workblocks

            
            // Deleting the role
            RoleModel::delete(['name' => $roleName]);
            $db->getDB()->commit();


            EnsoLogsModel::addEnsoLog($authusername, "Role $roleName removed.", EnsoLogsModel::$NOTICE, "Roles");

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Role successfully deleted.");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete a Role, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete a Role, operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Adds an action to a role (role_has_actions)
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'actionName' - name of the action
      *              - 'roleName' - name of the group
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageRoles'
      **/
    public static function addActionToRole($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $action_name = Input::validate($request->getParam('actionName'), Input::$STRING);
            $roleName = Input::validate($request->getParam('roleName'), Input::$STRING);

            $roleId = EnsoRBACModel::getRoleIdByName($roleName);
            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageRoles'))
                throw new RBACDeniedException();

            RoleModel::insertActionWhere($roleId, $action_name);

            EnsoLogsModel::addEnsoLog($authusername, "Action $action_name added to Role $roleName.", EnsoLogsModel::$NOTICE, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "ok");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete an Action ($action_name) from a Role ($roleName), authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete an Action ($action_name) from a Role ($roleName), operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }


    /** 
      *   EXPECTED BEHAVIOUR: Removes an action from a role (role_has_actions)
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'actionName' - name of the action
      *              - 'roleName' - name of the group
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageRoles'
      **/
    public static function removeActionFromRole($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $action_name = Input::validate($request->getParam('actionName'), Input::$STRING);
            $roleName = Input::validate($request->getParam('roleName'), Input::$STRING);

            $roleId = EnsoRBACModel::getRoleIdByName($roleName);
            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageRoles'))
                throw new RBACDeniedException();

            // Deleting the action from the role
            RoleModel::removeActionFromJoinWhere($roleId, $action_name);

            EnsoLogsModel::addEnsoLog($authusername, "Action $action_name removed from Role $roleName.", EnsoLogsModel::$NOTICE, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "ok");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete an Action ($action_name) from a Role ($roleName), authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete an Action ($action_name) from a Role ($roleName), operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Gets a list with all the actions of a specific actions
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'roleName' - original name of the group
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewRoles'
      **/
    public static function getRoleActions($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $roleName = Input::validate($request->getParam('roleName'), Input::$STRING);
            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewRoles'))
                throw new RBACDeniedException();

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, EnsoRBACModel::getAvailableRoleActions($roleName));
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Roles, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Roles, operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Gets a list with all the roles
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewRoles'
      **/
    public static function getRoles($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request

            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewRoles'))
                throw new RBACDeniedException();

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, RoleModel::getWhere([]));
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Roles, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Roles, operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Updates the data of a specific role
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'name' - original name of the role
      *              - 'newName' - new name to give the role
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewRoles'
      **/
    public static function editRole($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $roleName = Input::validate($request->getParam('name'), Input::$STRICT_STRING);
            $newName = Input::validate($request->getParam('newName'), Input::$STRICT_STRING);

            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageRoles'))
                throw new RBACDeniedException();

            RoleModel::editWhere(
                [
                    'name' => $roleName
                ],
                [
                    'name' => $newName
                ]
            );
            EnsoLogsModel::addEnsoLog($authusername, "Role $roleName updated.", EnsoLogsModel::$NOTICE, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "ok");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit a Role, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit a Role, operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Add a new Role
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'name' - original name of the role
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageRoles'
      **/
    public static function addRole($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $name = Input::validate($request->getParam('name'), Input::$STRICT_STRING);

            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageRoles'))
                throw new RBACDeniedException();

            RoleModel::insert(
                [
                    'name' => $name
                ]
            );
                EnsoLogsModel::addEnsoLog($authusername, "Role $name added.", EnsoLogsModel::$NOTICE, "Roles");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Role added with success.");
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Role, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Role, operation failed.", EnsoLogsModel::$ERROR, "Roles");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
            }

        }




    public static function checkRoleAction($request, $response, $args){
            $action = $request->getParam('action');
            $role = $request->getParam('role');

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, EnsoRBACModel::checkRoleHasAction($role, $action));
        }

    /** 
      *   EXPECTED BEHAVIOUR: Returns an Integer representing the number of roles recorded in the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewRoles'
      **/
    public static function getRolesCounter($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request

            $id_user = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewRoles'))
                throw new RBACDeniedException();

           
            $cnt = RoleModel::getCounter();
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $cnt);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Roles counter, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Roles counter, operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with all of the roles & their associated actions
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewRoles'
      **/
    public static function getAllRolesActions($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewRoles'))
                throw new RBACDeniedException();

            $list = array();
            $roleActions = array();

            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();

            $roles = RoleModel::getAll(['name']);
            

            $list['all'] = ActionModel::getAll(['action_name']);
            for($i = 0; $i < count($roles); $i++){
                $list[$i]['role'] = $roles[$i]['name'];
                $roleActions = EnsoRBACModel::getAvailableRoleActions($roles[$i]['name']); // Get the actions associated with this role
                $list[$i]['actions'] = $roleActions;

            }
            $db->getDB()->commit();
            
            //EnsoRBACModel::getAvailableRoleActions($roleName);


            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Roles Actions, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Roles Actions, operation failed.", EnsoLogsModel::$ERROR, "Roles");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
      *   EXPECTED BEHAVIOUR: Updates the vac_days of all the users that belong to a specific role
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageRoles'
      **/
    public static function changeRoleVacs($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $role = Input::validate($request->getParam('role'), Input::$STRICT_STRING);
            $vac_days = Input::validate($request->getParam("vac_days"), Input::$INT);
            $year = Input::validate($request->getParam("year"), Input::$INT);

            $id_user = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageRoles'))
                throw new RBACDeniedException();

            // If a record already exists, it will replace its value with the new one 
            RoleModel::changeRoleVacs($role, $vac_days, $year);

                EnsoLogsModel::addEnsoLog($authusername, "Vac Days changed to Role $role.", EnsoLogsModel::$NOTICE, "Roles");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Success.");
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to change Vac Days of Role $role, authorization failed.", EnsoLogsModel::$ERROR, "Roles");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to change Vac Days of Role $role, operation failed.", EnsoLogsModel::$ERROR, "Roles");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "$e");
            }

        }

}




    $app->get('/roles/', 'Roles::getRoles');
    $app->post('/roles/', 'Roles::addRole');
    $app->put('/roles/', 'Roles::editRole');
    $app->delete('/roles/', 'Roles::removeRole');
    $app->get('/roles/actions/', 'Roles::getRoleActions');
    $app->post('/roles/actions/', 'Roles::addActionToRole');
    $app->delete('/roles/actions/', 'Roles::removeActionFromRole');
    $app->get('/roles/counter/', 'Roles::getRolesCounter');
    $app->get('/roles/all/actions/', 'Roles::getAllRolesActions');
    $app->post('/roles/vac/', 'Roles::changeRoleVacs');
