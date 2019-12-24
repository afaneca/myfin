<?php
/*
 * Errors
 * 
 * 1 - Data de começo não pode ser maior do que a data de fim
 * 
 * 
 */

class Logs
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)


    public static function getFilterInfo($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
            $id_user = UserModel::getUserIdByName($authusername);

        /* 1. autenticação - validação do token */

            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername);

        /* 2. autorização - validação de permissões */

           if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewLogs'))
                throw new RBACDeniedException();

        /* 3. validação de inputs */

        /* 4. executar operações */
            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();
            
            $facilities = EnsoLogsModel::getAvailableFacilities();
            $severities = EnsoLogsModel::getUsedSeverityLevels();
            $users = EnsoLogsModel::getUsersPresentInLogs();

            $db->getDB()->commit();
            
        /* 5. response */

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, ["facilities" => $facilities, "severities" => $severities, "users" => $users]);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($username, "Tried to get filter info, operation failed.", EnsoLogsModel::$ERROR, "Logs");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Returns a filtered list with logs from the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'facility' - filter by facility
      *              - 'startTime' - filter by start time
      *              - 'endTime' - filter by end time
      *              - 'severity' - filter by severity
      *              - 'usersearch'
      *              - 'startIndex'
      *              - 'advance'
      *              - 'search' - filter by specific search terms
      *   REQUIRED ACTION(S): 'canViewLogs'
      **/
    public static function getLogs($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);

            $facility = Input::validate($request->getParam('facility'), Input::$STRING);
            $startTime = Input::validate($request->getParam('startTime'), Input::$STRING);
            $endTime = Input::validate($request->getParam('endTime'), Input::$STRING);
            $severity = Input::validate($request->getParam('severity'), Input::$STRING);
            $userSearch = Input::validate($request->getParam('userSearch'), Input::$STRING);
            $startIndex = Input::validate($request->getParam('startIndex'), Input::$STRING);
            $advance = Input::validate($request->getParam('advance'), Input::$STRING);
            $searchString = Input::validate($request->getParam('search'), Input::$STRING);

            $id_user = UserModel::getUserIdByName($authusername);
        
            /* 1. autenticação - validação do token */
            if (AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername) === false) {
               return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "");
            }

        /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewLogs')) {
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_FORBIDDEN, "");
            }

        /* 3. validação de inputs */

            if (($startTime === "" xor $startTime === "") || ($startTime > $endTime)) {
                $startTime = null;
                $endTime = null;
            } else {
                $endTime = strtotime('+1 day', intval($endTime));
            }

            $searchString = '%' . $searchString . '%';

        /* 4. executar operações */

            $logs = EnsoLogsModel::getLogs($facility, $startTime, $endTime, $severity, $userSearch, $startIndex, $advance, $searchString);

        /* 5. response */

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $logs);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get logs, operation failed.", EnsoLogsModel::$ERROR, "Logs");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with all logs in the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'limit' (OPTIONAL) - get only the last [limit] values from the DB
      *   REQUIRED ACTION(S): 'canViewLogs'
      **/
    public static function getAllLogs($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
            $id_user = UserModel::getUserIdByName($authusername);
            
            $limit = 1000000;
            try{
                $limit = Input::validate($request->getParam('limit'), Input::$INT);
            }catch(Exception $e){}
            
        /* 1. autenticação - validação do token */
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername);

        /* 2. autorização - validação de permissões */

           if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewLogs'))
                throw new RBACDeniedException();

        /* 3. validação de inputs */

        /* 4. executar operações */
            $list = EnsoLogsModel::getAllLogs($limit);

        /* 5. response */

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($username, "Tried to get filter info, operation failed.", EnsoLogsModel::$ERROR, "Logs");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns an integer representing the number of Logs recorded in the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *   REQUIRED ACTION(S): 'canViewLogs'
      **/
    public static function getLogsCounter($request, $response, $args)
        {
            try {
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
                $id_user = UserModel::getUserIdByName($authusername);
                
                
            /* 1. autenticação - validação do token */

                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewLogs'))
                    throw new RBACDeniedException();

            /* 3. validação de inputs */

            /* 4. executar operações */
                $cnt = EnsoLogsModel::getLogsCounter();

            /* 5. response */

                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $cnt);
            } catch (Exception $e) {
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get logs counter, operation failed.", EnsoLogsModel::$ERROR, "Logs");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
            }
        }

}

$app->get("/logFilters/", 'Logs::getFilterInfo');
$app->get("/logs/", "Logs::getLogs");
$app->get("/logs/all/", "Logs::getAllLogs");
$app->get("/logs/counter/", "Logs::getLogsCounter");
