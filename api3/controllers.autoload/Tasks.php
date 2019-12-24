<?php 

class Tasks
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

    
    /** 
      *   EXPECTED BEHAVIOUR: Returns a list with all the tasks in the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewTasks'
      **/
    public static function getAllTasks($request, $response, $args){
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

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewTasks'))
               throw new RBACDeniedException();


            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK,TaskModel::getWhere([]));
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Tasks, authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get all Tasks, operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Returns a specific task from the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'id' - id of the task
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewTasks'
      **/
    public static function getTask($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $id_task = (int)Input::validate($request->getParam('id'), Input::$INT);
            //$id_task = $request->getParam('id');
            
            $idAuthUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            $vacRequest = TaskModel::getWhere(['id_task' => $id_task])[0]; // get the request
            //$id_user1 = $vacRequest['req_for_id']; // get the id of the user that received the request
            //$id_user2 = $vacRequest['req_by_id']; // get the id of the user that made the request

            // Only the user that made the request, the user that received it and someone with proper permissions can access this data
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canViewTasks') /*|| ($idAuthUser !== $id_user1) && ($idAuthUser !== $id_user2) */)
                throw new RBACDeniedException();

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, TaskModel::getWhere(['id_task' => $id_task]));
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get a Task (#$id_task), authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get a Task (#$id_task), operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Adds a new task to the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'title, description, type, location, dateStart, dateEnd, periodic, presential, req_for_id' - task data
      *              - 'periodicity, cycle_start, cycle_end' (OPTIONAL) - task data
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageTasks'
      **/
    public static function addTask($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $title = Input::validate($request->getParam('title'), Input::$STRING);
            $description = Input::validate($request->getParam('description'), Input::$STRING);
            $type = Input::validate($request->getParam('type'), Input::$STRING);
            $location = Input::validate($request->getParam('location'), Input::$STRING);
            $created_timestamp = EnsoShared::now();
            $date_start = Input::validate($request->getParam('dateStart'), Input::$INT); 
            $date_end = Input::validate($request->getParam('dateEnd'), Input::$INT); 
            $periodic = (int) Input::validate($request->getParam('periodic'), Input::$BOOLEAN);
            $presential = (int) Input::validate($request->getParam('presential'), Input::$BOOLEAN);
            //$req_by_id = Input::validate($request->getParam('req_by_id'), Input::$INT); // this will automatically be assumed by the authusername
            $username = Input::validate($request->getParam('username'), Input::$STRING);

            $periodicity = null;
            $cycle_start = null;
            $cycle_end = null;
            
            try {
                $periodicity = Input::validate($request->getParam('periodicity'), Input::$INT);
            } catch(Exception $e) { }
            try {
                $cycle_start = Input::validate($request->getParam('cycle_start'), Input::$INT);
            } catch(Exception $e) { }
            try {
                $cycle_end = Input::validate($request->getParam('cycle_end'), Input::$INT);
            } catch(Exception $e) { }
           
            $id_user = UserModel::getUserIdByName($authusername);
            $req_by_id = $id_user;
            $req_for_id = UserModel::getUserIdByName($username);
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageTasks') && !EnsoRBACModel::checkUserHasAction($id_user, 'canAddTasks'))
                throw new RBACDeniedException();


            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();

            TaskModel::insert(
                [
                    'title' => $title,
                    'type' => $type,
                    'description' => $description,
                    'location' => $location,
                    'created_timestamp' => $created_timestamp,
                    'date_start' => $date_start, 
                    'date_end' => $date_end,    
                    'periodic' => $periodic,
                    'presential' => $presential,
                    'req_by_id' => $req_by_id,
                    'periodicity' => $periodicity,
                    'cycle_start' => $cycle_start,
                    'cycle_end' => $cycle_end
                ],
                true
            );
            // All optional fields are added now, if they're defined
            TaskModel::addTaskToUser($req_for_id, $idTask, true);

            $db->getDB()->commit();
           /*  print_r(Taskmodel::getWhere(['title' => $title, 'created_timestamp' => $created_timestamp]));
            die(); */

            EnsoLogsModel::addEnsoLog($authusername, "Task \"$title\" added.", EnsoLogsModel::$NOTICE, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Task added with success.");

        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Task, authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Task, operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Adds a new task to the DB, cloned in association with each of the users
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'title, description, type, location, dateStart, dateEnd, periodic, presential' - task data
      *              - 'periodicity, cycle_start, cycle_end' (OPTIONAL) - task data
      *              - 'users' (OPTIONAL) - users JSON arr
      *              - 'groups' (OPTIONAL) - groups JSON arr
      *              - 'roles' (OPTIONAL) - roles JSON arr
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageTasks'
      **/
    public static function addTaskToMultipleUsers($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $title = Input::validate($request->getParam('title'), Input::$STRING);
            $description = Input::validate($request->getParam('description'), Input::$STRING);
            $type = Input::validate($request->getParam('type'), Input::$STRING);
            $location = Input::validate($request->getParam('location'), Input::$STRING);
            $created_timestamp = EnsoShared::now();
            $date_start = Input::validate($request->getParam('dateStart'), Input::$INT); 
            $date_end = Input::validate($request->getParam('dateEnd'), Input::$INT); 
            $periodic = (int) Input::validate($request->getParam('periodic'), Input::$BOOLEAN);
            $presential = (int) Input::validate($request->getParam('presential'), Input::$BOOLEAN);


            $periodicity = null;
            $cycle_start = null;
            $cycle_end = null;
            
            try {
                $periodicity = Input::validate($request->getParam('periodicity'), Input::$INT);
            } catch(Exception $e) { }
            try {
                $cycle_start = Input::validate($request->getParam('cycle_start'), Input::$INT);
            } catch(Exception $e) { }
            try {
                $cycle_end = Input::validate($request->getParam('cycle_end'), Input::$INT);
            } catch(Exception $e) { }
           
            $id_user = UserModel::getUserIdByName($authusername);
            $req_by_id = $id_user;

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

            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canManageTasks'))
                throw new RBACDeniedException();

            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();

            /* Add the new Task */
            TaskModel::insert(
                [
                    'title' => $title,
                    'type' => $type,
                    'description' => $description,
                    'location' => $location,
                    'created_timestamp' => $created_timestamp,
                    'date_start' => $date_start, 
                    'date_end' => $date_end,    
                    'periodic' => $periodic,
                    'presential' => $presential,
                    'req_by_id' => $req_by_id,
                    'periodicity' => $periodicity,
                    'cycle_start' => $cycle_start,
                    'cycle_end' => $cycle_end
                ], true
            );
            $sendTo = array(); // array with the ID's of all users to whom we want to send a notification

            /* Get its ID */
            $idTask = TaskModel::getWhere(
                [
                    'title' => $title,
                    'created_timestamp' => $created_timestamp,
                ],
                ['id_task']
            )[0]['id_task'];

            /* Associate it with all users in the array */
            if($users){
              for($i = 0; $i < count($users); $i++){
                $req_for_id = UserModel::getUserIdByName($users[$i], true);
                array_push($sendTo, $req_for_id);
                if(!$req_for_id) break;
                TaskModel::addTaskToUser($req_for_id, $idTask, true);
              }
            }
            
            
            /* Associate it with all groups in the array */
            if($groups){
              for($i = 0; $i < count($groups); $i++){
                $idGroup = GroupModel::getGroupIdByName($groups[$i], true);
                if(!$idGroup) break;
                /* $allUsersInGroup = UserModel::getAllUsersWithGroups([$groups[$i]], true);
                foreach($allUsersInGroup as $i => $user){
                    array_push($sendTo, $allUsersInGroup[$i]['id_user']);
                } */
                TaskModel::addTaskToGroup($idGroup, $idTask, true);
              }
            }
            


            /* Associate it with all roles in the array */
            if($roles){
              for($i = 0; $i < count($roles); $i++){
                $idRole = RoleModel::getRoleIdByName($roles[$i], true);
                if(!$idRole) break;
/*                 $allUsersInRole = UserModel::getAllUsersWithRoles([$roles[$i]], true);
                foreach($allUsersInRole as $i => $user){
                    array_push($sendTo, $allUsersInRole[$i]['id_user']);
                } */
                TaskModel::addTaskToRole($idRole, $idTask, true);
              }
            }

            /* SEND NOTIFICATIONS TO ALL USERS INVOLVED */
            $allUsersInRoleOrGroup = UserModel::getAllUsersWithGroupsOrRoles($groups, $roles, true);
            foreach($allUsersInRoleOrGroup as $i => $user){
                    array_push($sendTo, $allUsersInRoleOrGroup[$i]['id_user']);
            }

            foreach ($sendTo as $i => $user){
                    NotificationModel::addNewNotification($user, 
                        NOTIF_NEW_TASK_ADDED, ['task_added_by_name' => $authusername, 'task_description' => $description, 'id_task' => $idTask]);
            }
                
            $db->getDB()->commit();
            
            EnsoLogsModel::addEnsoLog($authusername, "Task \"$title\" added to multiple users.", EnsoLogsModel::$NOTICE, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Task added with success.");

        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Task to multiple users, authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to add a Task to multiple users, operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }



  
    /** 
      *   EXPECTED BEHAVIOUR: Updates/Edits task in the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'id_task' - id of the task
      *              - 'title, description, type, location, dateStart, dateEnd, periodic, presential' - task data
      *              - 'periodicity, cycle_start, cycle_end, users, groups, roles' (OPTIONAL) - task data
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageTasks'
      **/
    public static function editTask($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $id_task = (int)Input::validate($request->getParam('id_task'), Input::$INT);
            $title = Input::validate($request->getParam('title'), Input::$STRING);
            $type = Input::validate($request->getParam('type'), Input::$STRING);
            $description = Input::validate($request->getParam('description'), Input::$STRING);
            $location = Input::validate($request->getParam('location'), Input::$STRING);
            $date_start =Input::validate($request->getParam('dateStart'), Input::$INT);
            $date_end = Input::validate($request->getParam('dateEnd'), Input::$INT);
            $periodic = (int) Input::validate($request->getParam('periodic'), Input::$BOOLEAN);
            $presential = (int) Input::validate($request->getParam('presential'), Input::$BOOLEAN);

            $periodicity = null;
            $cycle_start = null;
            $cycle_end = null;

            try {
                $periodicity = Input::validate($request->getParam('periodicity'), Input::$INT);
            } catch(Exception $e) { }
            try {
                $cycle_start = Input::validate($request->getParam('cycle_start'), Input::$INT);
            } catch(Exception $e) { }
            try {
                $cycle_end = Input::validate($request->getParam('cycle_end'), Input::$INT);
            } catch(Exception $e) { }

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

            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);
            
            /* 2. autorização - validação de permissões */
            $vacRequest = TaskModel::getWhere(['id_task' => $id_task])[0]; // get the request
            $id_user1 = $vacRequest['req_by_id']; // get the id of the user that made the request

            // Only the person who created the request and someone with proper permissions can edit this task
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageTasks') && ($idAuthUser !== $id_user1))
                throw new RBACDeniedException();

            TaskModel::editWhere(
                [
                    'id_task' => $id_task
                ],
                [
                    'title' => $title,
                    'type' => $type,
                    'description' => $description,
                    'location' => $location,
                    'date_start' => $date_start, 
                    'date_end' => $date_end,    
                    'periodic' => $periodic,
                    'presential' => $presential
                ]
                
            );
            // All optional fields are edited now, if they're defined
            if($periodicity != null){
                TaskModel::editWhere(
                    [
                        'id_task' => $id_task
                    ], [
                        'periodicity' => $periodicity,
                        'cycle_start' => $cycle_start,
                        'cycle_end' => $cycle_end
                    ]
                );
            }
            if($users || $groups || $roles){
                /* 1 - Remove all refs to this task in user_has_tasks */
                TaskModel::removeTaskFromUserJoin($id_task, true);
                /* 2 - Remove all refs to this task in group_has_tasks */
                TaskModel::removeTaskFromGroupJoin($id_task, true);
                /* 3 - Remove all refs to this task in role_has_tasks */
                TaskModel::removeTaskFromRoleJoin($id_task, true);

                if($users){
                /* 4 - Add the new list */
                    for($i = 0; $i < count($users); $i++){
                        $req_for_id = UserModel::getUserIdByName($users[$i], true);
                        if(!$req_for_id) break;
                        TaskModel::addTaskToUser($req_for_id, $id_task, true);
                    }
                }

                if($groups){
                    /* 4 - Add the new list */
                    for($i = 0; $i < count($groups); $i++){
                        $idGroup = GroupModel::getGroupIdByName($groups[$i], true);
                        if(!$idGroup) break;
                        TaskModel::addTaskToGroup($idGroup, $id_task, true);
                    }
                }

                if($roles){
                    /* 4 - Add the new list */
                    for($i = 0; $i < count($roles); $i++){
                        $idRole = RoleModel::getRoleIdByName($roles[$i], true);
                        if(!$idRole) break;
                        TaskModel::addTaskToRole($idRole, $id_task, true);
                    }
                }
            }
            

            



            EnsoLogsModel::addEnsoLog($authusername, "Task #$id_task updated.", EnsoLogsModel::$NOTICE, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Task updated with success.");

        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit a Task, authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to edit a Task, operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "Error: " . $e);
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Removes a task from the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'id_task' - id of the task
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageTasks'
      **/
    public static function removeTask($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $id_task = (int)Input::validate($request->getParam('id_task'), Input::$INT);
            //$id_task = $request->getParam('id');
            
            $idAuthUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */

            $vacRequest = TaskModel::getWhere(['id_task' => $id_task])[0]; // get the request
            $id_user1 = $vacRequest['req_by_id']; // get the id of the user that made the request

            // Only the person who created the request and someone with proper permissions can remove this task
            if (!EnsoRBACModel::checkUserHasAction($idAuthUser, 'canManageTasks') && ($idAuthUser !== $id_user1))
                throw new RBACDeniedException();
            
            /* Before deleting the task, every reference to it in user_has_tasks must be eliminated */
            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();

            TaskModel::removeTaskFromUserJoin($id_task, true);
            TaskModel::removeTaskFromRoleJoin($id_task, true);
            TaskModel::removeTaskFromGroupJoin($id_task, true);
            TaskModel::delete(['id_task' => $id_task], true);

            $db->getDB()->commit();

            EnsoLogsModel::addEnsoLog($authusername, "Task #$id_task removed.", EnsoLogsModel::$NOTICE, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Task removed successfully.");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to remove a Task, authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to remove a Task, operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns an integer representing the number of tasks recorder in the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewTasks'
      **/
    public static function getTasksCounter($request, $response, $args){
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
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canViewTasks'))
                throw new RBACDeniedException();

           
            $cnt = TaskModel::getCounter();
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $cnt);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Tasks counter, authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get Tasks counter, operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: Returns a filtered list with the schedules for selected users/groups/roles in the DB
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'users', 'groups', 'roles' - array of usernames/names associated with the filtered tasks
      *              - 'date_range_start' (OPTIONAL) - start of the date range
      *              - 'date_range_end' (OPTIONAL) - limit of the date range
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewTasks'
      **/
    public static function getFilteredSchedules($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            
            try{
              $users = json_decode(Input::validate($request->getParam('users'), Input::$STRING), true);
            }catch(Exception $e){$users = null;}

            try{
              $groups = json_decode(Input::validate($request->getParam('groups'), Input::$STRING), true);
            }catch(Exception $e){$groups = null;}
            
            try{
              $roles = json_decode(Input::validate($request->getParam('roles'), Input::$STRING), true);
            }catch(Exception $e){$roles = null;}
            
            $id_authUser = UserModel::getUserIdByName($authusername);
            

            try{
                $date_range_start = Input::validate($request->getParam('date_range_start'), Input::$INT);
                $date_range_end = Input::validate($request->getParam('date_range_end'), Input::$INT);
            }catch(Exception $e){ $date_range_start = null; $date_range_end = null; }


            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($id_authUser, 'canViewTasks') && !UserModel::isOnlyTryingToAccessItsOwn($users, $groups, $roles, $id_authUser))
               throw new RBACDeniedException();
            
            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();

            /* GET AN ARRAY WITH THE IDs of ALL TASKS WE WANT TO RECOVER */
            $tasksList = array();

            if($users){
                foreach($users as $i => $user){
                    $idUser = UserModel::getUserIdByName($users[$i]);
                    
                    /* Get tasks associated with the user */
                    $tasksList = array_merge($tasksList, TaskModel::getUserTasks($idUser, true));
                    
                    /* Get tasks associated with the user's groups */
                    $userGroups = GroupModel::getAllUserGroups($idUser, true);

                    if($userGroups){
                        if(!$groups){ // if its empty or null
                                $groups = array();
                        }
                        foreach($userGroups as $n => $group)
                                if(!in_array($group, $groups)) array_push($groups, $userGroups[$n]);
                    }

                    /* Get tasks associated with the user's roles */
                    $userRoles = RoleModel::getAllUserRoles($idUser, true);

                    if($userRoles){
                        if(!$roles){ // if its empty or null
                                $roles = array();
                        }
                        foreach($userRoles as $n => $role)
                                if(!in_array($role, $roles)) array_push($roles, $userRoles[$n]);
                    }
                }
            }

            if($groups){
                foreach($groups as $i => $group){
                    $idGroup = GroupModel::getGroupIdByName($group);
                    $groupTasks = TaskModel::getGroupTasks($idGroup, true);
                    if($groupTasks){
                        $tasksList = array_merge($tasksList, $groupTasks);
                    }
                    
                }
            }

            if($roles){
                foreach($roles as $i => $role){
                    $idRole = RoleModel::getRoleIdByName($role);
                    $roleTasks = TaskModel::getRoleTasks($idRole, true);
                    if($roleTasks){
                        $tasksList = array_merge($tasksList, $roleTasks);
                    }
                }
            }
            

            if(!$roles && !$groups && !$users){
                $tasksList = TaskModel::getAll(['id_task']);
            }
            $finalTasksList = array();

            forEach($tasksList as $i => $task){
                array_push($finalTasksList, $tasksList[$i]['id_task']);
            }
            /* GET THE TASKS, EACH ONE WITH THE INDICATION OF TO WHICH GROUPS, ROLES OR USERS IT IS ASSOCIATED WITH  */
            if($date_range_start && $date_range_end && $finalTasksList){
                $list = TaskModel::getFilteredSchedules($finalTasksList, $date_range_start, $date_range_end);
            }else if($date_range_start && $date_range_end && !$finalTasksList){
               $list = TaskModel::getFilteredSchedules(null, $date_range_start, $date_range_end);

            }else{
                $list = TaskModel::getFilteredSchedules($finalTasksList);
            }

            /* GET THE WORKBLOCKS FOR THOSE USERS/ROLES/GROUPS*/
            $workBlocksList = WorkBlockModel::getBlocksList($users, $groups, $roles);
            $list2 = WorkBlockModel::getFilteredWorkBlocks($workBlocksList);
            $list = array_merge((array)$list, (array)$list2);

            $db->getDB()->commit();

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get filtered Tasks, authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get filtered Tasks, operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }


    /** 
      *   EXPECTED BEHAVIOUR: Returns a filtered list with the schedules for selected users/groups/roles in the DB (INC/ APPROVED VAC  *                                                                                                                          REQS)
      *   ARGUMENTS: - 'sessionkey' 
      *              - 'authusername' - username of the user making the request
      *              - 'users', 'groups', 'roles' - array of usernames/names associated with the filtered tasks
      *              - 'date_range_start' (OPTIONAL) - start of the date range
      *              - 'date_range_end' (OPTIONAL) - limit of the date range
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canViewSchedules'
      **/
    public static function getFilteredSchedulesAndVacs($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            
            try{
              $users = json_decode(Input::validate($request->getParam('users'), Input::$STRING), true);
            }catch(Exception $e){$users = null;}

            try{
              $groups = json_decode(Input::validate($request->getParam('groups'), Input::$STRING), true);
            }catch(Exception $e){$groups = null;}
            
            try{
              $roles = json_decode(Input::validate($request->getParam('roles'), Input::$STRING), true);
            }catch(Exception $e){$roles = null;}
            
            $id_authUser = UserModel::getUserIdByName($authusername);
            

            try{
                $date_range_start = Input::validate($request->getParam('date_range_start'), Input::$INT);
                $date_range_end = Input::validate($request->getParam('date_range_end'), Input::$INT);
            }catch(Exception $e){ $date_range_start = null; $date_range_end = null; }


            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            /* A user can only access all schedules with permission to do so. Without it, he can only access its own schedule */
            if (!EnsoRBACModel::checkUserHasAction($id_authUser, 'canViewSchedules') && !UserModel::isOnlyTryingToAccessItsOwn($users, $groups, $roles, $id_authUser))
               throw new RBACDeniedException();
            
            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();

            /* GET AN ARRAY WITH THE IDs of ALL TASKS WE WANT TO RECOVER */
            $tasksList = array();

            if($users){
                foreach($users as $i => $user){
                    $idUser = UserModel::getUserIdByName($users[$i]);
                    
                    /* Get tasks associated with the user */
                    $tasksList = array_merge($tasksList, TaskModel::getUserTasks($idUser, true));
                    
                    /* Get tasks associated with the user's groups */
                    $userGroups = GroupModel::getAllUserGroups($idUser, true);

                    if($userGroups){
                        if(!$groups){ // if its empty or null
                                $groups = array();
                        }
                        foreach($userGroups as $n => $group)
                                if(!in_array($group, $groups)) array_push($groups, $userGroups[$n]);
                    }

                    /* Get tasks associated with the user's roles */
                    $userRoles = RoleModel::getAllUserRoles($idUser, true);

                    if($userRoles){
                        if(!$roles){ // if its empty or null
                                $roles = array();
                        }
                        foreach($userRoles as $n => $role)
                                if(!in_array($role, $roles)) array_push($roles, $userRoles[$n]);
                    }
                }
            }

            if($groups){
                foreach($groups as $i => $group){
                    $idGroup = GroupModel::getGroupIdByName($group);
                    $groupTasks = TaskModel::getGroupTasks($idGroup, true);
                    if($groupTasks){
                        $tasksList = array_merge($tasksList, $groupTasks);
                    }
                    
                }
            }

            if($roles){
                foreach($roles as $i => $role){
                    $idRole = RoleModel::getRoleIdByName($role);
                    $roleTasks = TaskModel::getRoleTasks($idRole, true);
                    if($roleTasks){
                        $tasksList = array_merge($tasksList, $roleTasks);
                    }
                }
            }
            

            if(!$roles && !$groups && !$users){
                $tasksList = TaskModel::getAll(['id_task']);
            }
            $finalTasksList = array();

            forEach($tasksList as $i => $task){
                array_push($finalTasksList, $tasksList[$i]['id_task']);
            }
            /* GET THE TASKS, EACH ONE WITH THE INDICATION OF TO WHICH GROUPS, ROLES OR USERS IT IS ASSOCIATED WITH  */
            if($date_range_start && $date_range_end && $finalTasksList){

                $list = TaskModel::getFilteredSchedules($finalTasksList, $date_range_start, $date_range_end);
            }else if($date_range_start && $date_range_end && !$finalTasksList){
               $list = TaskModel::getFilteredSchedules(null, $date_range_start, $date_range_end);

            }else{
               $list = TaskModel::getFilteredSchedules($finalTasksList);
            }

            /* GET THE WORKBLOCKS FOR THOSE USERS/ROLES/GROUPS*/
            $workBlocksList = WorkBlockModel::getBlocksList($users, $groups, $roles);
            $list = array_merge($list, WorkBlockModel::getFilteredWorkBlocks($workBlocksList));

            /* Add to the list the user's approved vacs */
            if($users){
                foreach($users as $i => $user){
                    $idUser = UserModel::getUserIdByName($users[$i]);

                    $list = array_merge($list, VacationModel::getAllApprovedVacationsForUser($idUser, true));
                }
            }

            $db->getDB()->commit();

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get filtered Tasks, authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to get filtered Tasks, operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: sets the check-in time of a task
      *              - 'authusername' - username of the user making the request
      *              - 'id_task' - id of the task
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageTasks'
      **/
    public static function setTaskCheckIn($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $idTask = Input::validate($request->getParam('id_task'), Input::$STRING);
            
            $id_authUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            $idUser = TaskModel::getUsersWithTask($idTask)[0]['id_user'];
 
            /* Making sure only the rightful user can check-in and check-out */
            if (!EnsoRBACModel::checkUserHasAction($id_authUser, 'canManageTasks') && $id_authUser != $idUser)
               throw new RBACDeniedException();

            TaskModel::setTaskCheckIn($idTask, EnsoShared::now());

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Check-in completed with success!");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to check-in in task #$idTask, authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to check-in in task #$idTask, operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /** 
      *   EXPECTED BEHAVIOUR: sets the check-out time of a task
      *              - 'authusername' - username of the user making the request
      *              - 'id_task' - id of the task
      *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
      *   REQUIRED ACTION(S): 'canManageTasks'
      **/
    public static function setTaskCheckOut($request, $response, $args){
        try{
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $idTask = Input::validate($request->getParam('id_task'), Input::$STRING);
            
            $id_authUser = UserModel::getUserIdByName($authusername);
            
            /* 1. autenticação - validação do token */
            try{
                $mobile = (int) Input::validate($request->getParam('mobile'), Input::$BOOLEAN);
            }catch(Exception $e){ $mobile = false; }
            
            if(!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* 2. autorização - validação de permissões */
            $idUser = TaskModel::getUsersWithTask($idTask)[0]['id_user'];
 
            /* Making sure only the rightful user can check-in and check-out */
            if (!EnsoRBACModel::checkUserHasAction($id_authUser, 'canManageTasks') && $id_authUser != $idUser)
               throw new RBACDeniedException();

            $db = new EnsoDB(true); 
            $db->getDB()->beginTransaction();

            /* Verify if the task is checked-in */
            if(TaskModel::getTaskCheckIn($idTask, true)){
                /* If so */
                TaskModel::setTaskCheckOut($idTask, EnsoShared::now(), true);
            } else{
                /* If not */
                throw new RBACDeniedException();
            }
                
            $db->getDB()->commit();

            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Check-out completed with success!");
        }catch(RBACDeniedException $e){
            EnsoLogsModel::addEnsoLog($authusername, "Tried to check-in in task #$idTask, authorization failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        }catch (Exception $e) {
            EnsoLogsModel::addEnsoLog($authusername, "Tried to check-in in task #$idTask, operation failed.", EnsoLogsModel::$ERROR, "Tasks");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "");
        }
    }

}

$app->get('/tasks/all/', 'Tasks::getAllTasks');
$app->get('/tasks/', 'Tasks::getTask');
$app->post('/tasks/', 'Tasks::addTask');
$app->post('/tasks/mass/', 'Tasks::addTaskToMultipleUsers');
$app->put('/tasks/', 'Tasks::editTask');
$app->delete('/tasks/', 'Tasks::removeTask');
$app->get('/tasks/counter/', 'Tasks::getTasksCounter');
$app->get('/schedules/filtered/', 'Tasks::getFilteredSchedules');
$app->get('/schedulesAndVacs/filtered/', 'Tasks::getFilteredSchedulesAndVacs');
$app->post('/tasks/checkIn/', 'Tasks::setTaskCheckIn');
$app->post('/tasks/checkOut/', 'Tasks::setTaskCheckOut');