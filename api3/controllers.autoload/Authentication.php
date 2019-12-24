<?php
require_once 'consts.php';
class Authentication
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)


        /** 
          *   EXPECTED BEHAVIOUR: Attempts to perform login (returns Cod. 202 if it was successfull)
          *   ARGUMENTS: - 'username' 
          *              - 'password'
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): none
          **/
    public static function attemptLogin($request, $response, $args)
    {
        try {
            $username = Input::validate($request->getParam("username"), Input::$STRING);
            $password = Input::validate($request->getParam("password"), Input::$STRING);

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }

            /* 4. executar operações */
            AuthenticationModel::performCredentialCheck($username, $password);

            //Generate Session Key
            $auth_key = AuthenticationModel::generateNewsessionkeyForUser($username, $mobile);

            //Get Actions
            $actions = EnsoRBACModel::getAvailableUserActions($username);

            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();
            // Check if user already has default role
            if(!UserModel::checkUserHasRole($username, DEFAULT_ROLE_NAME)){
                // If it doesn't, add it
                $idUser = UserModel::getUserIdByName($username, true);
		        $idRole = EnsoRBACModel::getRoleIdByName(DEFAULT_ROLE_NAME);
                EnsoRBACModel::addRoleToUser($idUser, $idRole);
                EnsoLogsModel::addEnsoLog($username, "Added default Role to user logging in.", EnsoLogsModel::$INFORMATIONAL, 'Authentication');
            }
            
            // Check if user already has default group
            if(!UserModel::checkUserHasGroup($username, DEFAULT_GROUP_NAME, true)){
                // If it doesn't, add it
                $idUser = UserModel::getUserIdByName($username, true);
		        $idGroup = GroupModel::getGroupIdByName(DEFAULT_GROUP_NAME, true);
                GroupModel::addGroupToUser($idUser, $idGroup, true);
                EnsoLogsModel::addEnsoLog($username, "Added default Group to user logging in.", EnsoLogsModel::$INFORMATIONAL, 'Authentication');
            }
            $trustlimit = UserModel::getWhere(["username" => $username], ["trustlimit"])[0]["trustlimit"];

            $db->getDB()->commit();
            EnsoLogsModel::addEnsoLog($username, "Logged in.", EnsoLogsModel::$INFORMATIONAL, 'Authentication');

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, ["sessionkey" => $auth_key, "username" => $username, "actions" => $actions, "trustlimit" => $trustlimit]);

        } catch (InputException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_ACCEPTABLE, "");
        } catch (PermissionDeniedException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
        } catch (AuthenticationException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
        } catch (Exception $e) {
            EnsoDebug::var_error_log($e);
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }

    }

        /** 
          *   EXPECTED BEHAVIOUR: Checks if sessionkey is valid. (Returns cod. 202 if so, plus an array of user data (sessionkey, username and all of its actions)). 
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): none
          **/
    public static function checkValidity($request, $response, $args)
    {

        try {

            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
            

            try{
                $renewValidity = (int) Input::validate($request->getParam('renewValidity'), Input::$BOOLEAN);
            }catch(Exception $e){ $renewValidity = true; }

            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }


            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, $renewValidity, $mobile);



            //Get Actions
            $actions = EnsoRBACModel::getAvailableUserActions($authusername);
            $trustlimit = UserModel::getWhere(["username" => $authusername], ["trustlimit"])[0]["trustlimit"];

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK,  ["sessionkey" => $key, "username" => $authusername, "actions" => $actions, "trustlimit" => $trustlimit]);

        } catch (PermissionDeniedException $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "0");
        } catch (Exception $e) {
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "3");
        }
    }
}

$app->post('/auth/', 'Authentication::attemptLogin');
$app->get('/validity/', 'Authentication::checkValidity');
