<?php
require_once 'consts.php';
class Vacations
{

    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

    /**
     *   EXPECTED BEHAVIOUR: Returns a filtered list of all vac requests in the DB
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'onlyPending' - get only vac requests with status "Pending"?
     *              - 'onlyFuture' - get only vac requests with a starting day from the future?
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): 'canManageVacs'
     **/
    public static function getAllVacations($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);
            $onlyPending = (int) Input::validate($request->getParam('onlyPending'), Input::$BOOLEAN);
            $onlyFuture = (int) Input::validate($request->getParam('onlyFuture'), Input::$BOOLEAN);

            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageVacs')) {
                throw new RBACDeniedException();
            }

            // Data Gathering
            $list = array();

            if (!$onlyPending) { // Get every request, independently of its status
                if (!$onlyFuture) // Get every request made by this user, ever
                {
                    $list = VacationModel::getAllVacations();
                } else // Get every request that isn't in the past
                {
                    $list = VacationModel::getAllVacationsFromFuture();
                }

            } else { // Get only approved requests
                if (!$onlyFuture) // Get every approved request made by this user, ever
                {
                    $list = VacationModel::getAllVacationsByStatus('Pendente');
                } else // Get every approved request that isn't in the past
                {
                    $list = VacationModel::getAllVacationsFromFutureByStatus('Pendente');
                }

            }

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Vacation Requests, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Vacation Requests, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Returns a filtered list of all vac requests that are pending in the DB
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): 'canManageVacs'
     **/
    public static function getAllPendingVacations($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING);

            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageVacs')) {
                throw new RBACDeniedException();
            }

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, VacationModel::getAllVacationsByStatus("Pendente"));
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Vacation Requests, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Vacation Requests, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Returns a filtered list of all vac requests that are ãssociated with a specific user in the DB
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'username' - username of the user with the vacs
     *              - 'onlyPending' - get only vac requests with status "Pending"?
     *              - 'onlyFuture' - get only vac requests with a starting day from the future?
     *              - 'getCancelled' (OPTIONAL) get cancelled vac reqs too - DEFAULT: FALSE
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device? - DEFAULT: FALSE
     *   REQUIRED ACTION(S): 'canViewVacs'
     **/
    public static function getUserVacations($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); //Username of the one making the request
            $username = Input::validate($request->getParam('username'), Input::$STRING); // Username of the user which is info this request is trying to access
            $onlyPending = (int) Input::validate($request->getParam('onlyPending'), Input::$BOOLEAN);
            $onlyFuture = (int) Input::validate($request->getParam('onlyFuture'), Input::$BOOLEAN);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            $id_user = UserModel::getUserIdByName($username);

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            // Data Gathering
            $list = array();

            if (!$onlyPending) { // Get every request, independently of its status
                if (!$onlyFuture) // Get every request made by this user, ever
                {
                    $list = VacationModel::getAllVacationsByUser($username);
                } else // Get every request that isn't in the past
                {
                    $list = VacationModel::getAllVacationsFromFutureByUser($username);
                }

            } else { // Get only approved requests
                if (!$onlyFuture) // Get every approved request made by this user, ever
                {
                    $list = VacationModel::getAllVacationsByStatusByUser('Pendente', $username);
                } else // Get every approved request that isn't in the past
                {
                    $list = VacationModel::getAllVacationsFromFutureByStatusByUser('Pendente', $username);
                }

            }

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewVacs') && $idAuthUser !== $id_user) // users can only see their own requests (unless they have permissions to see them all)
            {
                throw new RBACDeniedException();
            }

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Vacation Requests from $username, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Vacation Requests from $username, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Returns a filtered list of all vac requests that are ãssociated with any user in a specific group in the DB
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'groupname' - username of the user with the vacs
     *              - 'onlyPending' - get only vac requests with status "Pending"?
     *              - 'onlyFuture' - get only vac requests with a starting day from the future?
     *              - 'getCancelled' (OPTIONAL) get cancelled vac reqs too - DEFAULT: FALSE
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device? - DEFAULT: FALSE
     *   REQUIRED ACTION(S): 'canViewVacs'
     **/
    public static function getGroupVacations($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); //Username of the one making the request
            $groupname = Input::validate($request->getParam('groupname'), Input::$STRING); // Username of the user which is info this request is trying to access
            $onlyPending = (int) Input::validate($request->getParam('onlyPending'), Input::$BOOLEAN);
            $onlyFuture = (int) Input::validate($request->getParam('onlyFuture'), Input::$BOOLEAN);

            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            // Data Gathering
            $aggrList = array();

            $usersInGroup = UserModel::getAllUsersWithGroups(['' . $groupname]);

            foreach ($usersInGroup as $i => $user) {
                $username = $user['username'];
                $list = array();
                if (!$onlyPending) { // Get every request, independently of its status
                    if (!$onlyFuture) // Get every request made by this user, ever
                    {
                        $list = VacationModel::getAllVacationsByUser($username);
                    } else // Get every request that isn't in the past
                    {
                        $list = VacationModel::getAllVacationsFromFutureByUser($username);
                    }

                } else { // Get only approved requests
                    if (!$onlyFuture) // Get every approved request made by this user, ever
                    {
                        $list = VacationModel::getAllVacationsByStatusByUser('Pendente', $username);
                    } else // Get every approved request that isn't in the past
                    {
                        $list = VacationModel::getAllVacationsFromFutureByStatusByUser('Pendente', $username);
                    }

                }

                $aggrList = array_merge($aggrList, $list);
            }

            

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewVacs')) // users can only see their own requests (unless they have permissions to see them all)
            {
                throw new RBACDeniedException();
            }

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $aggrList);
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Vacation Requests from $username, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Vacation Requests from $username, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Adds a new Vacation Request to the DB
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'username' - get only vac requests with status "Approved"?
     *              - 'dates' JSON array of dates
     *              - 'autoApprove' (OPTIONAL) - automatically approve the vac req?
     *              - 'vacType' (OPTIONAL) - automatically approve the vac req with which vac type?
     *              - 'comments' (OPTIONAL) - user comments associated with the request
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): 'canAddVacRequests'
     **/
    public static function addVacation($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); //Username of the one making the request
            $username = Input::validate($request->getParam('username'), Input::$STRING); // Username of the user which this vac request is for
            $idAuthUser = UserModel::getUserIdByName($authusername);
            $id_user = UserModel::getUserIdByName($username);
            $created_timestamp = EnsoShared::now(); // Unix timestamp

            $req_by_id = $id_user;

            try {
                $requestedDays = json_decode(Input::validate($request->getParam('requestedDays'), Input::$STRING), true);
            } catch (Exception $e) {
                $requestedDays = array();
            }

            try {
                $comments = Input::validate($request->getParam('comments'), Input::$STRING);
            } catch (Exception $e) {
                $comments = DEFAULT_VAC_REQ_COMMENT;
            }
            if (!$comments || $comments == "") {
                $comments = DEFAULT_VAC_REQ_COMMENT;
            }

            try {
                $autoApprove = (int) Input::validate($request->getParam('autoApprove'), Input::$BOOLEAN);
            } catch (Exception $e) {
                $autoApprove = false;
            }

            try {
                $vacType = Input::validate($request->getParam('vacType'), Input::$STRING);
                error_log('VACTYPE:' . $vacType);
            } catch (Exception $e) {
                error_log("ERROU");
                $vacType = DEFAULT_VACATIONS_VAC_TYPE;
            }

            if ($autoApprove) {
                $req_status = 'Aprovado';
            } else {
                $req_status = 'Pendente'; // All  vac requests are automatically marked as 'Pending' until someone approves/declines them
            }

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canAddVacRequests') && $idAuthUser !== $id_user) {
                throw new RBACDeniedException();
            }

            /*
            if($idAuthUser !== $id_user) // users can only make requests for themselves
            throw new RBACDeniedException();
             */

            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            /* Insert vac req into vacations table */
            VacationModel::insert(
                [
                    'created_timestamp' => $created_timestamp,
                    'req_status' => $req_status,
                    'req_by_id' => $req_by_id,
                    'comments' => $comments,
                ],
                true
            );

            /*  Insert vac req's requested days into requested_days table */
            $vac_id = VacationModel::getWhereFromTable(['created_timestamp' => $created_timestamp, 'req_by_id' => $req_by_id], ['id_vac'])[0]['id_vac'];

            VacationModel::insertVacDays($vac_id, $requestedDays, true);

            $sendTo = array();
            if (!$autoApprove) {
                $sendTo = UserModel::getAllUsersWithAction("canManageVacs");
            } else {
                $sendTo = array();
            }
            // else, don't send notifications (therefore, $sendTo is an empty array)

            // Sends a notification to every user that has permissions to manage it
            foreach ($sendTo as $i => $user) {
                NotificationModel::addNewNotification($sendTo[$i]['id_user'], NOTIF_NEW_VAC_REQ_ADDED, ['name' => $username, 'requested_days' => $requestedDays, 'comments' => $comments, 'id_vac' => $vac_id]);
            }

            if ($autoApprove) {
                if ($vacType && $vacType != DEFAULT_VACATIONS_VAC_TYPE) {
                    $idVacType = VacTypeModel::getWhere(['name' => $vacType])[0]['id_type'];
                    VacationModel::editWhere(
                        [
                            'id_vac' => $vac_id,
                        ],
                        [
                            'id_vac_type' => $idVacType,
                        ], true
                    );
                }

            }

            $db->getDB()->commit();

            EnsoLogsModel::addEnsoLog($authusername, "Vac Request added.", EnsoLogsModel::$NOTICE, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Vac Request added with success.");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add Vacation Requests to $username, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add Vacation Requests to $username, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Edits a specific vac req's info
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'id_vac' - ID of the vac req
     *              - 'requestedDays' - JSON array of dates
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): 'canManageVacs'
     *   IMPORTANT NOTE: Only the dates can be edited with this request. To accept/decline/cancel a vac request, see /vac/status/
     **/
    public static function editVacation($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); //Username of the one making the request
            $id_vac = Input::validate($request->getParam('id_vac'), Input::$INT); // ID of the Vac Request to edit

            try {
                $requestedDays = json_decode(Input::validate($request->getParam('requestedDays'), Input::$STRING), true);
            } catch (Exception $e) {
                $requestedDays = array();
            }

            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageVacs')) {
                throw new RBACDeniedException();
            }

            $vacRequest = VacationModel::getWhere(['id_vac' => $id_vac])[0]; // get the request
            $id_user = $vacRequest['req_by_id']; // get the id of the user that made the request
            $username = UserModel::getUserNameById($id_user); // get the username associated with that ID

            /* if($idAuthUser !== $id_user) // only the user that made the request can edit it
            throw new RBACDeniedException(); */

            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            /* 1 - Removes all of the requested_days already associated with this vac req */
            VacationModel::deleteAllVacDays($id_vac, true);

            /* 2 - Adds all the new ones */
            VacationModel::insertVacDays($id_vac, $requestedDays, true);

            $db->getDB()->commit();

            EnsoLogsModel::addEnsoLog($authusername, "Vac Request (#$id_vac) updated.", EnsoLogsModel::$NOTICE, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Vac Request edited with success.");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit a Vacation Requests from $username, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit a Vacation Requests from $username, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Deletes a Vac Req from the DB
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'id_vac' - ID of the vac req
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): 'canManageVacs'
     **/
    public static function removeVacation($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); //Username of the one making the request
            $id_vac = Input::validate($request->getParam('id_vac'), Input::$INT); // ID of the Vac Request to edit

            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageVacs') && $idAuthUser !== $id_user) {
                throw new RBACDeniedException();
            }

            $vacRequest = VacationModel::getWhere(['id_vac' => $id_vac])[0]; // get the request
            $id_user = $vacRequest['req_by_id']; // get the id of the user that made the request
            $username = UserModel::getUserNameById($id_user); // get the username associated with that ID

            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            /* 1 - Removes all references to this id_vac in days_requested */
            VacationModel::deleteAllVacDays($id_vac, true);

            /* 2 - Removes the vacation request from vacations */
            VacationModel::delete(
                [
                    'id_vac' => $id_vac,
                ],
                true
            );

            $db->getDB()->commit();

            EnsoLogsModel::addEnsoLog($authusername, "Vac Request (#$id_vac) removed.", EnsoLogsModel::$NOTICE, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Vac Request removed with success.");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to remove a Vacation Requests from $username, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to remove a Vacation Requests from $username, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Changes/Updates the Status of a Vacation Request
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'id_vac' - ID of the vac req
     *              - 'status' - new status
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): 'canAddVacRequests'
     **/
    public static function changeVacStatus($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); //Username of the one making the request
            $id_vac = Input::validate($request->getParam('id_vac'), Input::$INT); // ID of the Vac Request to edit
            $newStatus = Input::validate($request->getParam('status'), Input::$STRING);

            $idAuthUser = UserModel::getUserIdByName($authusername);
            /* 1. autenticação - validação do token */
            try {
                $vacType = Input::validate($request->getParam('vacType'), Input::$STRING);
            } catch (Exception $e) {$vacType = null;}
            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}
            error_log('mobile?: ' . $mobile);

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canAddVacRequests')) {
                throw new RBACDeniedException();
            }

            /* $vacRequest = VacationModel::getWhere(['id_vac' => $id_vac])[0]; // get the request
            $id_user = $vacRequest['req_by_id']; // get the id of the user that made the request
            $username = UserModel::getUserNameById($id_user); // get the username associated with that ID

            if($idAuthUser !== $id_user) // only the user that made the request can edit it
            throw new RBACDeniedException(); */

            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();

            $vacationObj = VacationModel::getWhere(['id_vac' => $id_vac], ['comments', 'req_status'])[0];
            $vacComments = $vacationObj['comments'];
            $oldStatus = $vacationObj['req_status'];

            if (!($newStatus === DEFAULT_REQ_STATUS_CANCELLED && $oldStatus === DEFAULT_REQ_STATUS_APPROVED)) {
                VacationModel::editWhere(
                    [
                        'id_vac' => $id_vac,
                    ],
                    [
                        'req_status' => $newStatus,
                        'decided_by' => $idAuthUser,
                        'replied_timestamp' => EnsoShared::now(),
                    ], true
                );

            }

            if ($newStatus === DEFAULT_REQ_STATUS_CANCELLED && $oldStatus === DEFAULT_REQ_STATUS_APPROVED) {
                // The user requested that an already approved vac should be canceled
                $newStatus = DEFAULT_REQ_STATUS_PENDING_CANCELATION;

                VacationModel::editWhere(
                    [
                        'id_vac' => $id_vac,
                    ],
                    [
                        'req_status' => $newStatus,
                        'decided_by' => $idAuthUser,
                        'replied_timestamp' => EnsoShared::now(),
                    ], true
                );

                // Send notification to all users able to manage this request
                $sendTo = array();
                $sendTo = UserModel::getAllUsersWithAction("canManageVacs");
                foreach ($sendTo as $i => $user) {
                    NotificationModel::addNewNotification($sendTo[$i]['id_user'], NOTIF_VAC_REQ_CANCELATION_REQUEST, ['ownerName' => $authusername, 'idVac' => $id_vac]);
                }

            } else if ($newStatus === DEFAULT_REQ_STATUS_CANCELLED && $oldStatus === DEFAULT_REQ_STATUS_PENDING_CANCELATION) {
                // An admin has approved the user's request to cancel an already approved vac

                // Change the status of the vac req to Cancelled <-- already done above

                // Check if its a normal Vac Req or a Special one
                $idVacType = VacationModel::getWhereFromTable(["id_vac" => $id_vac], ["id_vac_type"])[0];
                if (!$idVacType || !$idVacType["id_vac_type"] || $idVacType == DEFAULT_VACATIONS_VAC_TYPE) {
                    $vac = VacationModel::getListWhere(['id_vac' => $id_vac])[0];
                    //$change =  VacationModel::getWorkingDays(gmdate("Y-m-d", $vac[0]['date_start']), gmdate("Y-m-d", $vac[0]['date_end']), []);

                    $change = count($vac['dates']);

                    UserModel::incDecVacDays($vac['req_by_id'], date("Y", $vac['dates'][0]['date']), $change, true);

                }

                // Send notification to the owner of the request
                NotificationModel::addNewNotification($idAuthUser, NOTIF_VAC_REQ_STATUS_UPDATED, ['name' => $authusername, 'new_status' => $newStatus, 'vac_condition' => $vacType, 'id_vac' => $id_vac, 'comments' => $vacComments]);

            } else if ($newStatus !== DEFAULT_REQ_STATUS_PENDING) {
                // There's been a development in the req_status

                // Send notification to the user that made the request
                $ownerOfRequest = VacationModel::getWhere(['id_vac' => $id_vac], ['req_by_id'])[0]['req_by_id'];
                NotificationModel::addNewNotification($ownerOfRequest, NOTIF_VAC_REQ_STATUS_UPDATED, ['name' => $authusername, 'new_status' => $newStatus, 'vac_condition' => $vacType, 'id_vac' => $id_vac, 'comments' => $vacComments]);

                // Send notification to all users that can approve Vac Requests
            } else {
                /* $sendTo = array();
            $sendTo = UserModel::getAllUsersWithAction("canManageVacs");

            // Sends a notification to every user that has permissions to manage it
            foreach ($sendTo as $i => $user){
            NotificationModel::addNewNotification($sendTo[$i]['id_user'], NOTIF_NEW_VAC_REQ_ADDED, ['name' => $username]);
            } */
            }

            if ($vacType) {

                $idVacType = VacTypeModel::getWhere(['name' => $vacType])[0]['id_type'];
                VacationModel::editWhere(
                    [
                        'id_vac' => $id_vac,
                    ],
                    [
                        'id_vac_type' => $idVacType,
                    ], true
                );
            }
            // If the Vac Req has been approved, discount the amount of days requested from the total amount of vac days the user has
            if ($newStatus == DEFAULT_REQ_STATUS_APPROVED) {

                if (!$vacType || $vacType == DEFAULT_VACATIONS_VAC_TYPE) {

                    if ($oldStatus !== DEFAULT_REQ_STATUS_PENDING_CANCELATION) { // If not, it means the vac req was already accepted before, so we should not discount days again
                        $vac = VacationModel::getListWhere(['id_vac' => $id_vac])[0];
                        //$change =  VacationModel::getWorkingDays(gmdate("Y-m-d", $vac[0]['date_start']), gmdate("Y-m-d", $vac[0]['date_end']), []);

                        $change = count($vac['dates']);

                        UserModel::incDecVacDays($vac['req_by_id'], date("Y", $vac['dates'][0]['date']), $change * -1, true);

                    }

                }

            }

            $db->getDB()->commit();

            EnsoLogsModel::addEnsoLog($authusername, "Vac Request (#$id_vac) status updated.", EnsoLogsModel::$NOTICE, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Vac Request Status edited with success.");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to change the status of a Vacation Request from $username, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to change the status of a Vacation Request from $authusername, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Returns an Integer representing the number of pending vac requests in the DB
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): 'canManageVacs'
     **/
    public static function getVacsCounter($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request

            $id_user = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageVacs')) {
                throw new RBACDeniedException();
            }

            $cnt = VacationModel::getPendingCounter();
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $cnt);
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Users counter, authorization failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Users counter, operation failed.", EnsoLogsModel::$ERROR, "Users");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Returns the number of vac days the user has + an array with all vac requests made by him
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'username' - username of the user to which we want to perform this action
     *              - 'year' - username of the user making the request
     *              - 'reqStatus' - get only vac requests with a specific status
     *              - 'onlyFuture' - get only vac requests with a starting day from the future?
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): 'canManageVacs'
     **/
    public static function getUserVacsData($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); //Username of the one making the request
            $username = Input::validate($request->getParam('username'), Input::$STRING); // Username of the user which is info this request is trying to access
            $year = Input::validate($request->getParam('year'), Input::$INT);
            $idAuthUser = UserModel::getUserIdByName($authusername);
            $id_user = UserModel::getUserIdByName($username);
            try {
                $reqStatus = Input::validate($request->getParam('reqStatus'), Input::$STRING);
            } catch (Exception $e) {$reqStatus = null;}
            try {
                $onlyFuture = (int) Input::validate($request->getParam('onlyFuture'), Input::$BOOLEAN);
            } catch (Exception $e) {$onlyFuture = false;}

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageVacs') && $idAuthUser !== $id_user) // users can only see their own requests (unless they have permissions to see and manage them all)
            {
                throw new RBACDeniedException();
            }

            // Data Gathering
            $list = array();
            $list['vac_days'] = UserModel::getVacDays($id_user, $year);
            $list['remaining_vac_days'] = UserModel::getRemainingVacDays($id_user, $year);

            if (!$reqStatus) {
                if ($onlyFuture) {
                    $list['requests'] = VacationModel::getWhereFromFuture(['req_by_id' => $id_user]);
                } else {
                    $list['requests'] = VacationModel::getListWhere(['req_by_id' => $id_user]);
                }
                // list of all vac requests made by the user
            } else {
                switch ($reqStatus) {
                    case DEFAULT_REQ_STATUS_APPROVED:
                        $status = DEFAULT_REQ_STATUS_APPROVED;
                        break;
                    case DEFAULT_REQ_STATUS_PENDING:
                        $status = DEFAULT_REQ_STATUS_PENDING;
                        break;
                    case DEFAULT_REQ_STATUS_CANCELLED:
                        $status = DEFAULT_REQ_STATUS_CANCELLED;
                        break;
                    case DEFAULT_REQ_STATUS_DENIED:
                        $status = DEFAULT_REQ_STATUS_DENIED;
                        break;
                    default:$status = DEFAULT_REQ_STATUS_APPROVED;
                        break;
                }

                if ($onlyFuture) {
                    $list['requests'] = VacationModel::getWhereFromFuture(['req_by_id' => $id_user, 'req_status' => $status]);
                    if ($status == DEFAULT_REQ_STATUS_APPROVED) {
                        $list['requests'] = array_merge($list['requests'], VacationModel::getWhereFromFuture(['req_by_id' => $id_user, 'req_status' => DEFAULT_REQ_STATUS_PENDING_CANCELATION]));

                    }

                } else {
                    $list['requests'] = VacationModel::getListWhere(['req_by_id' => $id_user, 'req_status' => $status]);
                    if ($status == DEFAULT_REQ_STATUS_APPROVED) {
                        $list['requests'] = array_merge($list['requests'], VacationModel::getListWhere(['req_by_id' => $id_user, 'req_status' => DEFAULT_REQ_STATUS_PENDING_CANCELATION]));
                    }

                }

            }

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Vacation Data from $username, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Vacation Data from $username, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Returns the number of vac days the user has + an array with all vac requests made by him
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'username' - username of the user to which we want to perform this action
     *              - 'year' - username of the user making the request
     *              - 'reqStatus' - get only vac requests with a specific status
     *              - 'onlyFuture' - get only vac requests with a starting day from the future?
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): 'canManageVacs'
     **/
    public static function getUserPendingVacsAndDays($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); //Username of the one making the request
            $username = Input::validate($request->getParam('username'), Input::$STRING); // Username of the user which is info this request is trying to access
            $idAuthUser = UserModel::getUserIdByName($authusername);
            $id_user = UserModel::getUserIdByName($username);

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageVacs') && $idAuthUser !== $id_user) // users can only see their own requests (unless they have permissions to see and manage them all)
            {
                throw new RBACDeniedException();
            }

            /* 3. Data Gathering */
            $list = VacationModel::getPendingVacsAndDays($id_user, false);

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Vacation Data from $username, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Vacation Data from $username, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Sends an email to the specified address containing user's names + their vac days that month
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'month' - [1-12]
     *              - 'year' - year
     *              - 'email' - email
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): 'canViewUsers'
     **/
    public static function exportVacEntries($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); //Username of the one making the request
            $month = Input::validate($request->getParam('month'), Input::$INT); // Username of the user which is info this request is trying to access
            $year = Input::validate($request->getParam('year'), Input::$INT); // Username of the user which is info this request is trying to access
            $email = Input::validate($request->getParam('email'), Input::$STRING);
            $idAuthUser = UserModel::getUserIdByName($authusername);

            /* 1. autenticação - validação do token */
            try {
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            } catch (Exception $e) {$mobile = false;}

            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            }

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewUsers')) {
                throw new RBACDeniedException();
            }

            /* 3. Processing */
            VacationModel::exportVacEntries($month, $year, $email, false);

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Success!");
        } catch (RBACDeniedException $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to export vac entries, authorization failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to export vac entries, operation failed.", EnsoLogsModel::$ERROR, "Vacations");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

}

$app->get('/vac/all/', 'Vacations::getAllVacations'); // Get all Vac Requests
$app->get('/vac/pending/', 'Vacations::getAllPendingVacations'); //  Get all pending Vac Requests
$app->get('/vac/', 'Vacations::getUserVacations'); //   Get all Vac Requests for a User (can be filtered by its status & date)
$app->get('/vac/group/', 'Vacations::getGroupVacations'); //   Get all Vac Requests for a User (can be filtered by its status & date)
$app->post('/vac/', 'Vacations::addVacation'); //    Add a Vac Request
$app->put('/vac/', 'Vacations::editVacation'); //     Edit a Vac Request
$app->delete('/vac/', 'Vacations::removeVacation'); //      Remove a Vac Request
$app->post('/vac/status/', 'Vacations::changeVacStatus'); //       Change the status of a Vac Request
$app->get('/vac/counter/', 'Vacations::getVacsCounter');
$app->get('/vac/data/', 'Vacations::getUserVacsData');
$app->get('/vac/data/pending/', 'Vacations::getUserPendingVacsAndDays');
$app->get('/vac/data/counter/month/', 'Vacations::getCountVacReqsForMonth');
$app->post('/vac/export/', 'Vacations::exportVacEntries');
