<?php

class Groups
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)


    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with all groups recorded in the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewGroups'
      **/
    public static function getGroups($request, $response, $args){

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
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewGroups'))
                throw new RBACDeniedException();

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, GroupModel::getWhere([]));
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Groups, authorization failed.", EnsoLogsModel::$ERROR, "Groups");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Groups, operation failed.", EnsoLogsModel::$ERROR, "Groups");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }
    
    
    /** 
      *   EXPECTED BEHAVIOUR: Removes a group from the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'name' - name of the group to remove
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewGroups'
      **/
    public static function removeGroup($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $groupName = Input::validate($request->getParam('name'), Input::$STRING);

            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageGroups'))
                throw new RBACDeniedException();

            // Before deleting the group from the DB,
            // we need to first delete every reference to it that may exist in user_has_groups
            $groupId = GroupModel::getGroupIdByName($groupName);

            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();
            GroupModel::removeGroupFromUserJoin($groupId, true); // If any instance of this group is found in user_has_groups, it'll be deleted
            GroupModel::removeGroupFromTaskJoin($groupId, true); // group_has_tasks
            GroupModel::removeGroupFromWorkBlockJoin($groupId, true); // group_has_workblocks

            // Deleting the group
            GroupModel::delete(['name' => $groupName], true);
            $db->getDB()->commit();
     
            EnsoLogsModel::addEnsoLog($authusername, "Group $groupName removed.", EnsoLogsModel::$NOTICE, "Groups");

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Group successfully deleted.");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete a Group, authorization failed.", EnsoLogsModel::$ERROR, "Groups");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to delete a Group, operation failed.", EnsoLogsModel::$ERROR, "Groups");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Adds a group to the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'name' - name of the group to add
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageGroups'
      **/
    public static function addGroup($request, $response, $args){
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

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageGroups'))
                throw new RBACDeniedException();

            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();
            GroupModel::insert(
                [
                    'name' => $name
                ], true
            );
            $db->getDB()->commit();
                EnsoLogsModel::addEnsoLog($authusername, "Group $name added.", EnsoLogsModel::$NOTICE, "Groups");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Group added with success.");
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Group, authorization failed.", EnsoLogsModel::$ERROR, "Groups");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Group, operation failed.", EnsoLogsModel::$ERROR, "Groups");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
            }

        }


    /** 
      *   EXPECTED BEHAVIOUR: Updates the info of a group in the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'name' - original name of the group
      *              - 'newName' - new name to give the group
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageGroups'
      **/
    public static function editGroup($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $groupName = Input::validate($request->getParam('name'), Input::$STRICT_STRING);
            $newName = Input::validate($request->getParam('newName'), Input::$STRICT_STRING);

            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageGroups'))
                throw new RBACDeniedException();

            GroupModel::editWhere(
                [
                    'name' => $groupName
                ],
                [
                    'name' => $newName
                ]
            );
            EnsoLogsModel::addEnsoLog($authusername, "Group $groupName updated.", EnsoLogsModel::$NOTICE, "Groups");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "ok");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit a Group, authorization failed.", EnsoLogsModel::$ERROR, "Groups");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit a Group, operation failed.", EnsoLogsModel::$ERROR, "Groups");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Updates the vac_days of all members inside a group
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'group' - name of the group
      *              - 'vac_days' - vac_days to give to each user
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageGroups'
      **/
    public static function changeGroupVacs($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $group = Input::validate($request->getParam('group'), Input::$STRICT_STRING);
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
            GroupModel::changeGroupVacs($group, $vac_days, $year);

                EnsoLogsModel::addEnsoLog($authusername, "Vac Days changed to Group $group.", EnsoLogsModel::$NOTICE, "Groups");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Success.");
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to change Vac Days of Group $group, authorization failed.", EnsoLogsModel::$ERROR, "Groups");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to change Vac Days of Group $group, operation failed.", EnsoLogsModel::$ERROR, "Groups");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "$e");
            }

        }
}

$app->get('/groups/', 'Groups::getGroups');
$app->post('/groups/', 'Groups::addGroup');
$app->delete('/groups/', 'Groups::removeGroup');
$app->put('/groups/', 'Groups::editGroup');
$app->post('/groups/vac/', 'Groups::changeGroupVacs');