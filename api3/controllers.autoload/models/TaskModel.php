<?php
    class TaskModel extends Entity{
        protected static $table = "tasks";
        // protected static $view = 'UserInfo';
        protected static $joinUserTaskTable = "user_has_tasks";
        protected static $joinGroupTaskTable = "group_has_tasks";
        protected static $joinRoleTaskTable = "role_has_tasks";
        protected static $columns = [
            "id_task",
            "type",
            "title",
            "description",
            "location",
            "created_timestamp",
            "date_start",
            "date_end",
            "periodic",
            "periodicity",
            "cycle_start",
            "cycle_end",
            "presential",
            "req_by_id",
            "check_in_timestamp",
            "check_out_timestamp"
        ];


        public static function getUserTasks($id_user, $transactional = false){
            $sql = "SELECT \"id_task\" FROM \"" . static::$joinUserTaskTable . "\"  " 
                . "WHERE \"id_user\" = :id ";

            $values = array();
            $values[':id'] = $id_user;
            try{
                $db = new EnsoDB($transactional);
                $db->prepare($sql);
                $db->execute($values);
                
                $row = $db->fetchAll();
                
                //caso exista, construir o array com os valores a retornar;
                $ret = array();
                foreach ($row as $task){
                    array_push($ret, $task); //name
                }
                
                return $ret;
            }catch (PDOException $e){
                return false;
            }
            
        }

        public static function getGroupTasks($id_group, $transactional = false){
            $sql = "SELECT \"id_task\" FROM \"" . static::$joinGroupTaskTable . "\"  " 
                . "WHERE \"id_group\" = :id ";

            $values = array();
            $values[':id'] = $id_group;
            try{
                $db = new EnsoDB($transactional);
                $db->prepare($sql);
                $db->execute($values);
                
                $row = $db->fetchAll();
                
                //caso exista, construir o array com os valores a retornar;
                $ret = array();
                foreach ($row as $task){
                    array_push($ret, $task); //name
                }
                
                return $ret;
            }catch (PDOException $e){
                return false;
            }
            
        }

        public static function getRoleTasks($id_role, $transactional = false){
            $sql = "SELECT \"id_task\" FROM \"" . static::$joinRoleTaskTable . "\"  " 
                . "WHERE \"id_role\" = :id ";

            $values = array();
            $values[':id'] = $id_role;
            try{
                $db = new EnsoDB($transactional);
                $db->prepare($sql);
                $db->execute($values);
                
                $row = $db->fetchAll();
                
                //caso exista, construir o array com os valores a retornar;
                $ret = array();
                foreach ($row as $task){
                    array_push($ret, $task); //name
                }
                
                return $ret;
            }catch (PDOException $e){
                return false;
            }
            
        }

        public static function getUsersWithTask($id_task, $transactional = false){
           $sql = "SELECT users.id_user, users.username FROM " . static::$joinUserTaskTable . 
                    " INNER JOIN users on users.id_user = " . static::$joinUserTaskTable . ".id_user" .
                    " WHERE id_task = :id ";

            $values = array();
            $values[':id'] = $id_task;
            try{
                $db = new EnsoDB($transactional);
                $db->prepare($sql);
                $db->execute($values);
                
                //$row = $db->fetchAll();
                
                //caso exista, construir o array com os valores a retornar;
                /* $ret = array();
                foreach ($row as $task){
                    array_push($ret, $task); //name
                }
                
                return $ret; */
                return $db->fetchAll();
            }catch (PDOException $e){
                return false;
            }
        }

        public static function getGroupsWithTask($id_task, $transactional = false){
            $sql = "SELECT groups.id_group, groups.name FROM " . static::$joinGroupTaskTable . 
                    " INNER JOIN groups on groups.id_group = " . static::$joinGroupTaskTable . ".id_group" .
                    " WHERE id_task = :id ";

                    
            $values = array();
            $values[':id'] = $id_task;
            try{
                $db = new EnsoDB($transactional);
                $db->prepare($sql);
                $db->execute($values);
                
                //$row = $db->fetchAll();
                
                //caso exista, construir o array com os valores a retornar;
                /* $ret = array();
                foreach ($row as $task){
                    array_push($ret, $task); //name
                }
                 */
                return $db->fetchAll();
            }catch (PDOException $e){
                return false;
            }
        }

        public static function getRolesWithTask($id_task, $transactional = false){
            $sql = "SELECT roles.id_role, roles.name FROM " . static::$joinRoleTaskTable . 
                    " INNER JOIN roles on roles.id_role = " . static::$joinRoleTaskTable . ".id_role" .
                    " WHERE id_task = :id ";

            $values = array();
            $values[':id'] = $id_task;
            try{
                $db = new EnsoDB($transactional);
                $db->prepare($sql);
                $db->execute($values);
                
                return $db->fetchAll();
                
                //caso exista, construir o array com os valores a retornar;
                /* $ret = array();
                foreach ($row as $task){
                    array_push($ret, $task); //name
                }
                
                return $ret; */
            }catch (PDOException $e){
                return false;
            }
        }

        public static function addTaskToGroup($id_group, $id_task, $transactional = false){
            $sql = "INSERT INTO \"" . static::$joinGroupTaskTable . "\" (\"id_group\", \"id_task\") "
                . " VALUES(:id_group, :id_task) ";

                $values = array();
                $values['id_group'] = $id_group;
                $values['id_task'] = $id_task;
                try{
                    $db = new EnsoDB($transactional);
                    $db->prepare($sql);
                    $db->execute($values);   
                    
                    return true;
                }catch (PDOException $e){
                    return $e;
                }
        }

        public static function addTaskToRole($id_role, $id_task, $transactional = false){
            $sql = "INSERT INTO \"" . static::$joinRoleTaskTable . "\" (\"id_role\", \"id_task\") "
                . " VALUES(:id_role, :id_task) ";

                $values = array();
                $values['id_role'] = $id_role;
                $values['id_task'] = $id_task;
                try{
                    $db = new EnsoDB($transactional);
                    $db->prepare($sql);
                    $db->execute($values);   
                    
                    return true;
                }catch (PDOException $e){
                    return $e;
                }
        }

        public static function addTaskToUser($id_user, $id_task, $transactional = false){
            $sql = "INSERT INTO \"" . static::$joinUserTaskTable . "\" (\"id_user\", \"id_task\") "
                . " VALUES(:id_user, :id_task) ";

                $values = array();
                $values['id_user'] = $id_user;
                $values['id_task'] = $id_task;
                try{
                    $db = new EnsoDB($transactional);
                    $db->prepare($sql);
                    $db->execute($values);   
                    
                    return true;
                }catch (PDOException $e){
                    return $e;
                }
        }

        public static function removeTaskFromUser($id_user, $id_task, $transactional = false){
            $sql = "DELETE FROM \"" . static::$joinUserTaskTable . "\" "
                . " WHERE \"id_user\" = :id_user "
                . " AND \"id_task\" = :id_task ";

                $values = array();
                $values['id_user'] = $id_user;
                $values['id_task'] = $id_task;
                try{
                    $db = new EnsoDB($transactional);
                    $db->prepare($sql);
                    $db->execute($values);   
                    
                    return true;
                }catch (PDOException $e){
                    return $e;
                }
        }

        // Removes all references of a task from the join table
        public static function removeTaskFromUserJoin($id_task, $transactional = false){
            $db = new EnsoDB($transactional);

            $sql = "DELETE FROM \"" . static::$joinUserTaskTable . "\" "
                . "WHERE \"id_task\" = :task";
        
            $values = array();
            $values[':task'] = $id_task;

            try{
                $db->prepare($sql);
                $db->execute($values);
                return true;
            }catch(Exception $e){
                return $e;
            }
        }

        public static function removeTaskFromGroupJoin($id_task, $transactional = false){
            $db = new EnsoDB($transactional);

            $sql = "DELETE FROM \"" . static::$joinGroupTaskTable . "\" "
                . "WHERE \"id_task\" = :task";
        
            $values = array();
            $values[':task'] = $id_task;

            try{
                $db->prepare($sql);
                $db->execute($values);
                return true;
            }catch(Exception $e){
                return $e;
            }
        }
        
        public static function removeTaskFromRoleJoin($id_task, $transactional = false){
            $db = new EnsoDB($transactional);

            $sql = "DELETE FROM \"" . static::$joinRoleTaskTable . "\" "
                . "WHERE \"id_task\" = :task";
        
            $values = array();
            $values[':task'] = $id_task;

            try{
                $db->prepare($sql);
                $db->execute($values);
                return true;
            }catch(Exception $e){
                return $e;
            }
        }

         public static function formulateWhere($filters, &$values)
        {
            $sql = "";

            if (!empty($filters)) {
                $sql .= " WHERE ";
                
                foreach ($filters as $dbName => $value) {
                        $operator = '';

                        if (is_array($value)) {
                            if (count($value) > 1) {
                                $operator = $value[0];
                                $value = $value[1];
                            } else {
                                $value = $value[0];
                                if ($value === null)
                                    $operator = "IS";
                                else
                                    $operator = "=";
                            }
                        } else {
                            if ($value === null)
                                $operator = "IS";
                            else
                                $operator = "=";
                        }

                        $sql .= " \"$dbName\" $operator :WHERE$dbName AND ";
                        $values[':WHERE' . $dbName] = $value;
                    
                }

                $sql = substr($sql, 0, -4);
            }
            
            return $sql;
        }

        public static function getFilteredSchedules($tasks, $date_range_start = null, $date_range_end = null, $transactional = false){
            $doSqlQuery = true;
            $sql = "";
            $values = array();
            $list = array();

            if($tasks && $date_range_start && $date_range_end){ // Filter by users & dates range
                $sql = "SELECT id_task, type, title, description, location, date_start, date_end, periodic, periodicity, cycle_start, cycle_end, presential, check_in_timestamp, check_out_timestamp" .
                    " FROM tasks" .
                    " WHERE ((date_start >= :date_range_start" .
                    " AND date_start <= :date_range_end)" .
                    " OR (date_end >= :date_range_start" .
                    " AND date_end <= :date_range_end))";


                for($i = 0; $i < count($tasks); $i++){
                    if($i == 0) $sql .= " AND (";
                    $sql .= " id_task = $tasks[$i] ";
                    if($i == count($tasks) - 1) $sql .= ")";
                    else $sql .= " OR ";
                }

                $values[':date_range_start'] = $date_range_start;
                $values[':date_range_end'] = $date_range_end;

            }else if(!$tasks && $date_range_start && $date_range_end){ // Filter by dates range, but not by users
                "SELECT id_task, type, title, description, location, date_start, date_end, periodic, periodicity, cycle_start, cycle_end, presential, check_in_timestamp, check_out_timestamp" .
                    " FROM tasks" .
                    " WHERE ((date_start >= :date_range_start" .
                    " AND date_start <= :date_range_end)" .
                    " OR (date_end >= :date_range_start" .
                    " AND date_end <= :date_range_end))";

                $values[':date_range_start'] = $date_range_start;
                $values[':date_range_end'] = $date_range_end;
            }else if($tasks !== null && (!$date_range_start || !$date_range_end)){ // Filter by users, but not by dates range
                if(!empty($tasks)){
                    $sql = "SELECT id_task, type, title, description, location, date_start, date_end, periodic, periodicity, cycle_start, cycle_end, presential, check_in_timestamp, check_out_timestamp" .
                        " FROM tasks" .
                        " WHERE id_task = $tasks[0]";
                    

                    for($i = 1; $i < count($tasks); $i++){
                        $sql .= " OR id_task = $tasks[$i]";
                    }

                    $values = array();
                }else{
                    $doSqlQuery = false;
                }
            }else{
                $sql = "SELECT id_task, type, title, description, location, date_start, date_end, periodic, periodicity, cycle_start, cycle_end, presential, check_in_timestamp, check_out_timestamp" .
                    " FROM tasks";

                $values = array();
            }
            
            try{
                if($doSqlQuery){
                    $db = new EnsoDB($transactional);
                    $db->prepare($sql);
                    $db->execute($values);   
                    
                    $list = $db->fetchAll();
                }
                    


                    foreach($list as $i => $item){
                        $list[$i]['users'] = static::getUsersWithTask($list[$i]['id_task'], $transactional);
                        $list[$i]['groups'] = static::getGroupsWithTask($list[$i]['id_task'], $transactional);
                        $list[$i]['roles'] = static::getRolesWithTask($list[$i]['id_task'], $transactional);
                    }

                    return $list;
                }catch (PDOException $e){
                    return $e;
                }
        }

        public static function setTaskCheckIn($id_task, $timestamp, $transactional = false){
            $sql = "UPDATE " . static::$table . 
                    " SET check_in_timestamp = :timestamp" .
                    " WHERE id_task = :idTask";

            $values = array();
            $values[':timestamp'] = $timestamp;
            $values[':idTask'] = $id_task;

            try{
                    $db = new EnsoDB($transactional);
                    $db->prepare($sql);
                    $db->execute($values);   
                    
                    return true;
                }catch (PDOException $e){
                    return $e;
                }
        }

        public static function setTaskCheckOut($id_task, $timestamp, $transactional = false){
            $sql = "UPDATE " . static::$table . 
                    " SET check_out_timestamp = :timestamp" .
                    " WHERE id_task = :idTask";

            $values = array();
            $values[':timestamp'] = $timestamp;
            $values[':idTask'] = $id_task;

            try{
                    $db = new EnsoDB($transactional);
                    $db->prepare($sql);
                    $db->execute($values);   
                    
                    return true;
                }catch (PDOException $e){
                    return $e;
                }
        }

        public static function getTaskCheckIn($id_task, $transactional = false){
            $sql = "SELECT (check_in_timestamp) FROM " . static::$table . 
                    " WHERE id_task = :idTask";

            $values = array();
            $values[':idTask'] = $id_task;

            try{
                    $db = new EnsoDB($transactional);
                    $db->prepare($sql);
                    $db->execute($values);   
                    
                    return $db->fetchAll()[0]['check_in_timestamp'];
                }catch (PDOException $e){
                    return $e;
                }
        }

        public static function getTaskCheckOut($id_task, $transactional = false){
            $sql = "SELECT (check_out_timestamp) FROM " . static::$table . 
                    " WHERE id_task = :idTask";

            $values = array();
            $values[':idTask'] = $id_task;

            try{
                    $db = new EnsoDB($transactional);
                    $db->prepare($sql);
                    $db->execute($values);   
                    
                    return $db->fetchAll()[0]['check_out_timestamp'];
                }catch (PDOException $e){
                    return $e;
                }
        }
    }