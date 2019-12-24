<?php
    class WorkBlocks{

        const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

        /** 
          *   EXPECTED BEHAVIOUR: Returns a list with all workblocks in the DB
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canViewWorkBlocks'
          **/
        public static function getAllBlocks($request, $response, $args){
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

                if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewWorkBlocks'))
                    throw new RBACDeniedException();



                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, WorkBlockModel::getAll());
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Work Blocks, authorization failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch(Exception $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Work Blocks, operation failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
            }
            
        }

        /** 
          *   EXPECTED BEHAVIOUR: Returns a filtered list of blocks
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'users' (OPTIONAL) - users array
          *              - 'roles' (OPTIONAL) - roles array
          *              - 'groups' (OPTIONAL) - groups array
          *              - 'week_day' - the week day associated with the request
          *              - 'time_start' - (OPTIONAL) starting time - DEPRECATED
          *              - 'time_end' - (OPTIONAL) ending time - DEPRECATED
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canViewWorkBlocks'
          **/
        public static function getSpecificBlocks($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
                $week_day = Input::validate($request->getParam('week_day'), Input::$INT); // [2] - Monday | [3] - Tuesday ... [6] - Friday | -1 if not set
                
                /* try{
                    $time_start = Input::validate($request->getParam('time_start'), Input::$INT);
                    $time_end = Input::validate($request->getParam('time_end'), Input::$INT); 
                }catch(Exception $e){ $time_start = $time_end = null; }
                 */
                try{
                    $users = json_decode(Input::validate($request->getParam('users'), Input::$STRING), true);
                }catch(Exception $e){$users = null;}

                try{
                    $groups = json_decode(Input::validate($request->getParam('groups'), Input::$STRING), true);
                }catch(Exception $e){$groups = null;}
                
                try{
                    $roles = json_decode(Input::validate($request->getParam('roles'), Input::$STRING), true);
                }catch(Exception $e){$roles = null;}
                
                $idAuthUser = UserModel::getUserIdByName($authusername);
                $id_user = UserModel::getUserIdByName($username);
                
                /* 1. autenticação - validação do token */
                try{
                    $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
                }catch(Exception $e){ $mobile = false; }
                
                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
                
                /* 2. autorização - validação de permissões */
                if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewWorkBlocks'))
                    throw new RBACDeniedException();

                /* GET AN ARRAY WITH THE IDs of ALL WorkBlocks WE WANT TO RECOVER */
                $finalBlocksList = WorkBlockModel::getBlocksList($users, $groups, $roles);

                if($finalBlocksList){
                    $list = WorkBlockModel::getFilteredWorkBlocks($finalBlocksList);
                }else{
                    $list = array();
                }

                /* Is interval set? */
              /*   $list = array();
                if($time_start == "-1" || $time_end == "-1"){ */
                    /* If not, get all work_blocks for that week_day, associated with this specific user */
                /*     $list = WorkBlockModel::getWhere(['id_user_Users' => $id_user, 'week_day' => $week_day]);
                }else{ */
                    /* If interval is set, filter the list */
               /*      $list = WorkBlockModel::getWhereWithInterval(['id_user_Users' => $id_user, 'week_day' => $week_day], null, $time_start, $time_end);
                } */

                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get specific Work Blocks for user $username, authorization failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch(Exception $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to get specific Work Blocks for user $username, operation failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
            }
            
        }


        /** 
          *   EXPECTED BEHAVIOUR: Adds a new workblock
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'week_day' - username of the user with whom the blocks are associated
          *              - 'time_start' - starting time
          *              - 'time_end' - ending time
          *              - 'location' - specific location associated with the block
          *              - 'presential' - is it mandatorily presential?
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canManageWorkBlocks'
          **/
        public static function addBlock($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
                $week_day = Input::validate($request->getParam('week_day'), Input::$INT); // [2] - Monday | [3] - Tuesday ... [6) - Friday
                $time_start = Input::validate($request->getParam('time_start'), Input::$STRING);
                $time_end = Input::validate($request->getParam('time_end'), Input::$STRING);
                $location = Input::validate($request->getParam('location'), Input::$STRING);
                $presential = (int) Input::validate($request->getParam('presential'), Input::$BOOLEAN);
                $description = Input::validate($request->getParam('description'), Input::$STRING);
                $idAuthUser = UserModel::getUserIdByName($authusername);

                /* 1. autenticação - validação do token */
                try{
                    $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
                }catch(Exception $e){ $mobile = false; }
                
                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

                /* 2. autorização - validação de permissões */
                if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageWorkBlocks'))
                    throw new RBACDeniedException();

                WorkBlockModel::insert(
                    [
                        'week_day' => $week_day,
                        'time_start' => $time_start,
                        'time_end' => $time_end,
                        'location' => $location,
                        'presential' => $presential,
                        'description' => $description
                    ] 
                );
                EnsoLogsModel::addEnsoLog($authusername, "WorkBlock added.", EnsoLogsModel::$NOTICE, "work_blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "WorkBlock added with success.");
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to add a WorkBlock, authorization failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch(Exception $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to add a WorkBlock, operation failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
            }
            
        }

        /** 
          *   EXPECTED BEHAVIOUR: Adds a new workblock
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'week_day' - username of the user with whom the blocks are associated
          *              - 'time_start' - starting time
          *              - 'time_end' - ending time
          *              - 'location' - specific location associated with the block
          *              - 'presential' - is it mandatorily presential?
          *              - 'users' (OPTIONAL) - users JSON arr
          *              - 'groups' (OPTIONAL) - groups JSON arr
          *              - 'roles' (OPTIONAL) - roles JSON arr
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canManageWorkBlocks'
          **/
        public static function addBlockToMultipleUsers($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
                $week_day = Input::validate($request->getParam('week_day'), Input::$INT); // [2] - Monday | [3] - Tuesday ... [6) - Friday
                $time_start = Input::validate($request->getParam('time_start'), Input::$STRING);
                $time_end = Input::validate($request->getParam('time_end'), Input::$STRING);
                $location = Input::validate($request->getParam('location'), Input::$STRING);
                $presential = (int) Input::validate($request->getParam('presential'), Input::$BOOLEAN);
                $description = Input::validate($request->getParam('description'), Input::$STRING);
                $idAuthUser = UserModel::getUserIdByName($authusername);
                
                try{
                    $users = json_decode(Input::validate($request->getParam('users'), Input::$STRING), true);
                }catch(Exception $e){$users = null;}

                try{
                    $roles = json_decode(Input::validate($request->getParam('roles'), Input::$STRING), true);
                }catch(Exception $e){$roles = null;}

                try{
                    $groups = json_decode(Input::validate($request->getParam('groups'), Input::$STRING), true);
                }catch(Exception $e){$groups = null;}


                /* 1. autenticação - validação do token */
                try{
                    $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
                }catch(Exception $e){ $mobile = false; }
                
                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

                /* 2. autorização - validação de permissões */
                if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageWorkBlocks'))
                    throw new RBACDeniedException();


                $db = new EnsoDB(true); 
                $db->getDB()->beginTransaction();

                /* Adds the new Work Block */
                WorkBlockModel::insert(
                    [
                        'week_day' => $week_day,
                        'time_start' => $time_start,
                        'time_end' => $time_end,
                        'location' => $location,
                        'presential' => $presential,
                        'description' => $description
                    ] 
                );

                /* Get its ID */
                $idBlock = WorkBlockModel::getWhere(
                    [
                        'description' => $description,
                        'week_day' => $week_day,
                        'time_start' => $time_start,
                        'time_end' => $time_end
                    ],
                    ['id_block']
                )[0]['id_block'];

                /* Associate it with all users in the array */
                if($users){
                    for($i = 0; $i < count($users); $i++){
                        $req_for_id = UserModel::getUserIdByName($users[$i], true);
                        if(!$req_for_id) break;
                        WorkBlockModel::addWorkBlockToUser($req_for_id, $idBlock, true);
                    }
                }
                
                /* Associate it with all groups in the array */
                if($groups){
                    for($i = 0; $i < count($groups); $i++){
                        $idGroup = GroupModel::getGroupIdByName($groups[$i], true);
                        if(!$idGroup) break;

                        WorkBlockModel::addWorkBlockToGroup($idGroup, $idBlock, true);
                    }
                }

                /* Associate it with all roles in the array */
                if($roles){
                    for($i = 0; $i < count($roles); $i++){
                        $idRole = RoleModel::getRoleIdByName($roles[$i], true);
                        if(!$idRole) break;

                        WorkBlockModel::addWorkBlockToRole($idRole, $idBlock, true);
                    }
                }
                
                    
                $db->getDB()->commit();


                EnsoLogsModel::addEnsoLog($authusername, "WorkBlock added.", EnsoLogsModel::$NOTICE, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "WorkBlock added with success.");
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to add a WorkBlock, authorization failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch(Exception $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to add a WorkBlock, operation failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
            }
            
        }

        /** 
          *   EXPECTED BEHAVIOUR: Edits/Updates a Workblock
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'id_block' - ID of the block to be edited
          *              - 'newusername' - the new username
          *              - 'newlocation' - the new location
          *              - 'newweekday' - the new weekday
          *              - 'newtime_start' - the new starting time
          *              - 'newtime_end' - the new ending time
          *              - 'newpresential' - is it mandatorily presential?
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canManageWorkBlocks'
          **/
        public static function editBlock($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
                $id_block = Input::validate($request->getParam('id_block'), Input::$INT); 
                $newweek_day = Input::validate($request->getParam('newweek_day'), Input::$INT);  // -1 if unchanged
                $newtime_start = Input::validate($request->getParam('newtime_start'), Input::$STRING);  // -1 if unchanged
                $newtime_end = Input::validate($request->getParam('newtime_end'), Input::$STRING);  // -1 if unchanged
                $newlocation = Input::validate($request->getParam('newlocation'), Input::$STRING);  // -1 if unchanged
                $newpresential = (int) Input::validate($request->getParam('newpresential'), Input::$BOOLEAN);  // -1 if unchanged
                $newdescription = Input::validate($request->getParam('newdescription'), Input::$STRING); // -1 if unchanged

                $idAuthUser = UserModel::getUserIdByName($authusername);
                
                try{
                  $users = json_decode(Input::validate($request->getParam('users'), Input::$STRING), true);
                }catch(Exception $e){$users = null;}

                try{
                  $groups = json_decode(Input::validate($request->getParam('groups'), Input::$STRING), true);
                }catch(Exception $e){$groups = null;}
                
                try{
                  $roles = json_decode(Input::validate($request->getParam('roles'), Input::$STRING), true);
                }catch(Exception $e){$roles = null;}

                /* 1. autenticação - validação do token */
                try{
                    $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
                }catch(Exception $e){ $mobile = false; }
                
                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

                /* 2. autorização - validação de permissões */

                if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageWorkBlocks') && $idAuthUser !== $id_user)
                    throw new RBACDeniedException();

                /* A Work Block can be identified by the combination of its User ID, week day and starting time */
                $db = new EnsoDB(true); 
                $db->getDB()->beginTransaction();
                                
                if($newweek_day != "-1"){
                    WorkBlockModel::editWhere(
                        [
                            'id_block' => $id_block
                        ],
                        [
                            'week_day' => $newweek_day
                        ], true
                    );
                }
                if($newtime_start != "-1"){
                    WorkBlockModel::editWhere(
                        [
                            'id_block' => $id_block
                        ],
                        [
                            'time_start' => $newtime_start
                        ], true
                    );
                }
                if($newtime_end != "-1"){
                    WorkBlockModel::editWhere(
                        [
                            'id_block' => $id_block
                        ],
                        [
                            'time_end' => $newtime_end
                        ], true
                    );
                }
                if($newlocation != "-1"){
                    WorkBlockModel::editWhere(
                        [
                            'id_block' => $id_block
                        ],
                        [
                            'location' => $newlocation
                        ], true
                    );
                }
                if($newpresential != "-1"){
                    WorkBlockModel::editWhere(
                        [
                            'id_block' => $id_block
                        ],
                        [
                            'presential' => $newpresential
                        ], true
                    );
                }
                if($newdescription != "-1"){
                    WorkBlockModel::editWhere(
                        [
                            'id_block' => $id_block
                        ],
                        [
                            'description' => $newdescription
                        ], true
                    );
                }

                if($users || $groups || $roles){
                    /* 1 - Remove all refs to this task in user_has_tasks */
                    WorkBlockModel::removeWorkBlockFromUserJoin($id_block, true);
                    /* 2 - Remove all refs to this task in group_has_tasks */
                    WorkBlockModel::removeWorkBlockFromGroupJoin($id_block, true);
                    /* 3 - Remove all refs to this task in role_has_tasks */
                    WorkBlockModel::removeWorkBlockFromRoleJoin($id_block, true);

                    if($users){
                        /* 4 - Add the new list */
                        for($i = 0; $i < count($users); $i++){
                            $req_for_id = UserModel::getUserIdByName($users[$i], true);
                            if(!$req_for_id) break;
                            WorkBlockModel::addWorkBlockToUser($req_for_id, $id_block, true);
                        }
                    }

                    if($groups){
                        /* 4 - Add the new list */
                        for($i = 0; $i < count($groups); $i++){
                            $idGroup = GroupModel::getGroupIdByName($groups[$i], true);
                            if(!$idGroup) break;
                            WorkBlockModel::addWorkBlockToGroup($idGroup, $id_block, true);
                        }
                    }

                    if($roles){
                        /* 4 - Add the new list */
                        for($i = 0; $i < count($roles); $i++){
                            $idRole = RoleModel::getRoleIdByName($roles[$i], true);
                            if(!$idRole) break;
                            WorkBlockModel::addWorkBlockToRole($idRole, $id_block, true);
                        }
                    }
                }
                

            

                $db->getDB()->commit();
                EnsoLogsModel::addEnsoLog($authusername, "WorkBlock #$id_block updated.", EnsoLogsModel::$NOTICE, "work_blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "WorkBlock updated with success.");
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to update a WorkBlock, authorization failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch(Exception $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to update a WorkBlock, operation failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
            }
            
        }

        /** 
          *   EXPECTED BEHAVIOUR: Deletes a Workblock from the DB
          *   ARGUMENTS: - 'sessionkey' 
          *              - 'authusername' - username of the user making the request
          *              - 'id_block' - ID of the workblock
          *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
          *   REQUIRED ACTION(S): 'canManageWorkBlocks'
          **/
        public static function removeBlock($request, $response, $args){
            try{
                $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
                $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
                $id_block = Input::validate($request->getParam('id_block'), Input::$INT);

                $id_user = UserModel::getUserIdByName($authusername);
                
                /* 1. autenticação - validação do token */
                try{
                    $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
                }catch(Exception $e){ $mobile = false; }
                
                if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

                /* 2. autorização - validação de permissões */

                if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageWorkBlocks'))
                    throw new RBACDeniedException();


                $db = new EnsoDB(true); 
                $db->getDB()->beginTransaction();

                WorkBlockModel::removeWorkBlockFromUserJoin($id_block, true);
                WorkBlockModel::removeWorkBlockFromRoleJoin($id_block, true);
                WorkBlockModel::removeWorkBlockFromGroupJoin($id_block, true);
                WorkBlockModel::delete(['id_block' => $id_block], true);

                $db->getDB()->commit();


                EnsoLogsModel::addEnsoLog($authusername, "WorkBlock #$id_block removed.", EnsoLogsModel::$NOTICE, "WorkBlocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "WorkBlock removed successfully.");
            }catch(RBACDeniedException $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to delete a Work Block, authorization failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
            }catch(Exception $e){
                EnsoLogsModel::addEnsoLog($authusername, "Tried to delete a Work Block, operation failed.", EnsoLogsModel::$ERROR, "Work Blocks");
                return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
            }
            
        }
    }

    $app->get('/blocks/all/', 'WorkBlocks::getAllBlocks'); // Get all work_blocks 
    $app->get('/blocks/', 'WorkBlocks::getSpecificBlocks'); // // Get all work_blocks for a specific user (for specific week day and interval of time)
    $app->post('/blocks/', 'WorkBlocks::addBlock');// Add a WorkBlock
    $app->put('/blocks/', 'WorkBlocks::editBlock');// Edit a WorkBlock
    $app->delete('/blocks/', 'WorkBlocks::removeBlock'); // Remove a WorkBlock
    $app->post('/blocks/mass/', 'WorkBlocks::addBlockToMultipleUsers'); // Add a WorkBlock to multiple users/roles/groups simultaneously