<?php
    class Actions{
        const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

        
        /** 
          *   EXPECTED BEHAVIOUR: Returns a list with all actions in the DB
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canViewActions'
          **/
        public static function getActions($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
                
                $id_user = UserModel::getUserIdByName($authusername);
            
                /* 1. autenticação - validação do token */
                try{
                    $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
                }catch(Exception $e){ $mobile = false; }

                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

                /* 2. autorização - validação de permissões */

                if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewActions'))
                    throw new RBACDeniedException();


                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, ActionModel::getWhere([]));
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Actions, authorization failed.", EnsoLogsModel::$ERROR, "Actions");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Actions, operation failed.", EnsoLogsModel::$ERROR, "Actions");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
            }
        }

        /** 
          *   EXPECTED BEHAVIOUR: Adds an Action to the DB
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'name' - name to give to the new action
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canManageActions'
          **/
        public static function addAction($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
                $name = Input::validate($request->getParam('name'), Input::$STRICT_STRING); // action_name
                
                $id_user = UserModel::getUserIdByName($authusername);
                
                /* 1. autenticação - validação do token */
                try{
                    $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
                }catch(Exception $e){ $mobile = false; }
                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

                /* 2. autorização - validação de permissões */

                if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageActions'))
                    throw new RBACDeniedException();

                ActionModel::insert(
                    [
                        'action_name' => $name,
                        'created_timestamp' => time()
                    ]
                );
                
                EnsoLogsModel::addEnsoLog($authusername, "Action $name added.", EnsoLogsModel::$NOTICE, "Actions");
                
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Action added with success.");
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to add an Action, authorization failed.", EnsoLogsModel::$ERROR, "Actions");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to add an Action, operation failed.", EnsoLogsModel::$ERROR, "Actions");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
            }
        }

        /** 
          *   EXPECTED BEHAVIOUR: Removes an Action from the DB
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'name' - name of the action to remove
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canManageActions'
          **/
        public static function removeAction($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
                $name = Input::validate($request->getParam('name'), Input::$STRICT_STRING); // Action Name

                $id_user = UserModel::getUserIdByName($authusername);
                
                /* 1. autenticação - validação do token */
                try{
                    $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
                }catch(Exception $e){ $mobile = false; }

                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

                /* 2. autorização - validação de permissões */
                if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageActions'))
                    throw new RBACDeniedException();

                $db = new EnsoDB(true); 
                $db->getDB()->beginTransaction();
                // Before deleting the action, we have to also delete its references from Role_has_Action, if they exist
                RoleModel::removeActionFromJoin($name); // If any instance of this action is found in role_has_actions, it'll be deleted

                // Deleting the action
                ActionModel::delete(['action_name' => $name]);
                $db->getDB()->commit();

                EnsoLogsModel::addEnsoLog($authusername, "Action $name deleted.", EnsoLogsModel::$NOTICE, "Actions");

                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Action was successfully deleted.");
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to delete an Action, authorization failed.", EnsoLogsModel::$ERROR, "Actions");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to delete an Action, operation failed.", EnsoLogsModel::$ERROR, "Actions");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
            }
        }

        /** 
          *   EXPECTED BEHAVIOUR: Returns an Integer number representing the count of Actions in the DB
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canViewActions'
          **/
        public static function getActionsCounter($request, $response, $args){
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
                if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewActions'))
                    throw new RBACDeniedException();

               
                $cnt = ActionModel::getCounter();
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $cnt);
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get Actions counter, authorization failed.", EnsoLogsModel::$ERROR, "Actions");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get Actions counter, operation failed.", EnsoLogsModel::$ERROR, "Actions");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
            }
        }
 
    }

    $app->get('/actions/', 'Actions::getActions');
    $app->post('/actions/', 'Actions::addAction');
    $app->delete('/actions/', 'Actions::removeAction');
    $app->get('/actions/counter/', 'Actions::getActionsCounter');
    