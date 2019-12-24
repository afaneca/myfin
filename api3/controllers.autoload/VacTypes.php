<?php

class VacTypes
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)


    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with all vac types
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageVacTypes'
      **/
    public static function getTypes($request, $response, $args){

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

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, VacTypeModel::getAll());
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Vac Types, authorization failed.", EnsoLogsModel::$ERROR, "Vac Types");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Vac Types, operation failed.", EnsoLogsModel::$ERROR, "Vac Types");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

    /** 
          *   EXPECTED BEHAVIOUR: Adds a new vac type
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'name' - name to give the new vac type
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canManageVacTypes'
          **/
    public static function addType($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $name =  Input::validate($request->getParam('name'), Input::$STRING); 
            
            $idAuthUser = UserModel::getUserIdByName($authusername);

            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageVacTypes'))
                throw new RBACDeniedException();

            VacTypeModel::insert(
                [
                    'name' => $name,
                    'created_timestamp' => EnsoShared::now(),
                ] 
            );
            EnsoLogsModel::addEnsoLog($authusername, "Vac Type added.", EnsoLogsModel::$NOTICE, "Vac Types");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Vac Type added with success.");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Vac Type, authorization failed.", EnsoLogsModel::$ERROR, "Vac Types");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch(Exception $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Vac Type, operation failed.", EnsoLogsModel::$ERROR, "Vac Types");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
        
    }

    /** 
          *   EXPECTED BEHAVIOUR: Edits/Updates a vac type
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'name' - name of the vac type
          *              - 'newName' - name to give the new vac type
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canManageVacTypes'
          **/
    public static function editType($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $name =  Input::validate($request->getParam('name'), Input::$STRING); 
            $newName =  Input::validate($request->getParam('newName'), Input::$STRING); 
            
            $idAuthUser = UserModel::getUserIdByName($authusername);

            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageVacTypes'))
                throw new RBACDeniedException();

            VacTypeModel::editWhere(
                [
                    'name' => $name,
                ],
                [
                    'name' => $newName,
                ]
            );
            EnsoLogsModel::addEnsoLog($authusername, "Vac Type updated.", EnsoLogsModel::$NOTICE, "Vac Types");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Vac Type updated with success.");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to update a Vac Type, authorization failed.", EnsoLogsModel::$ERROR, "Vac Types");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch(Exception $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to update a Vac Type, operation failed.", EnsoLogsModel::$ERROR, "Vac Types");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
        
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a specific Vac Type
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'name' - name of the vac type to retrieve
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageVacTypes'
      **/
    public static function getType($request, $response, $args){

        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $name = Input::validate($request->getParam('name'), Input::$STRING); // Name of the vac type
            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageVacTypes'))
                throw new RBACDeniedException();

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, VacTypeModel::getWhere(['name' => $name]));
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Vac Type #$name, authorization failed.", EnsoLogsModel::$ERROR, "Vac Types");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Vac Type #$name, operation failed.", EnsoLogsModel::$ERROR, "Vac Types");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

}


    $app->get('/vac/types/all/', 'VacTypes::getTypes');
    $app->post('/vac/types/', 'VacTypes::addType');
    $app->put('/vac/types/', 'VacTypes::editType');
    $app->get('/vac/types/', 'VacTypes::getType');