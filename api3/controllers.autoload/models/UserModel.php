<?php

class UserModel extends Entity
{
    protected static $table = "users";
   // protected static $view = 'UserInfo';
	protected static $joinUserTaskTable = "user_has_tasks";
	protected static $joinUserWorkBlockTable = "user_has_workblocks";
	protected static $joinUserRoleTable = "user_has_roles";
	protected static $joinUserGroupTable = "user_has_groups";
	protected static $groupsTable = "groups";
	protected static $vacDaysTable = "vac_days";

    protected static $columns = [
        "id_user",
        "username",
        "password",
        "email",
        "ldap",
        "sessionkey",
        "trustlimit",
        "notifications",
        "trustlimit_mobile",
        "sessionkey_mobile"
    ];



	public static function checkUserHasRole($username, $roleName, $transactional = false){
		$idUser = self::getUserIdByName($username, $transactional);
		$idRole = EnsoRBACModel::getRoleIdByName($roleName);

		$sql = " SELECT EXISTS(" . 
			   " SELECT 1 from " . self::$joinUserRoleTable . 
			   " WHERE id_user = :idUser" .
			   " AND id_role = :idRole)" . 
			   " LIMIT 1";

		$values = array();
		$values[':idUser'] = $idUser;
		$values[':idRole'] = $idRole;  

		try{
  			$db = new EnsoDB($transactional);
  			$db->prepare($sql);
  			$db->execute($values);

  			return $db->fetchAll()[0]['exists']; // O resultado tem que ser convertido em int antes de retornar (por default, é String)
		}catch (PDOException $e){
			return false;
		}
	}

	public static function checkUserHasGroup($username, $groupName, $transactional = false){
		$idUser = self::getUserIdByName($username, $transactional);
		$idGroup = GroupModel::getGroupIdByName($groupName, $transactional);

		$sql = " SELECT EXISTS(" . 
			   " SELECT 1 from " . self::$joinUserGroupTable . 
			   " WHERE id_user = :idUser" .
			   " AND id_group = :idGroup)" . 
			   " LIMIT 1";

		$values = array();
		$values[':idUser'] = $idUser;
		$values[':idGroup'] = $idGroup;  

		try{
  			$db = new EnsoDB($transactional);
  			$db->prepare($sql);
  			$db->execute($values);

  			return $db->fetchAll()[0]['exists']; // O resultado tem que ser convertido em int antes de retornar (por default, é String)
		}catch (PDOException $e){
			return false;
		}
	}

    public static function getUserIdByName($name, $transactional = false){
		$sql = "SELECT \"id_user\" " .
				"FROM \"" . self::$table . "\" " .
				"WHERE \"" . self::$table . "\".\"username\" = :name";

		$values = array();
		$values[':name'] = $name;



		try{
			$db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute($values);

			return intval($db->fetchAll(PDO::FETCH_ASSOC)[0]['id_user']); // O resultado tem que ser convertido em int antes de retornar (por default, é String)
		}catch (PDOException $e){
			
			return $e;
		}
    }

    public static function getUserNameById($id, $transactional = false){
  		$sql = "SELECT \"username\" " .
  				"FROM \"" . self::$table . "\" " .
  				"WHERE \"" . self::$table . "\".\"id_user\" = :id";

  		$values = array();
  		$values[':id'] = $id;



  		try{
  			$db = new EnsoDB($transactional);
  			$db->prepare($sql);
  			$db->execute($values);

  			return $db->fetchAll(PDO::FETCH_ASSOC)[0]['username']; // O resultado tem que ser convertido em int antes de retornar (por default, é String)
		}catch (PDOException $e){

			return false;
		}
	}

	public static function removeUserFromTaskJoin($id_user, $transactional = false){
		$db = new EnsoDB($transactional);

		$sql = "DELETE FROM \"" . static::$joinUserTaskTable . "\" "
				. "WHERE \"id_user\" = :user";

			$values = array();
			$values[':user'] = $id_user;

			try{
				$db->prepare($sql);
				$db->execute($values);
				return true;
			}catch(Exception $e){
				return $e;
			}

	}

	/*
	public static function removeUserFromTasks($id_user, $transactional = false){
		$db = new EnsoDB($transactional);

		$sql = "DELETE FROM \"tasks\" "
				. "WHERE \"req_by_id\" = :user "
				. "OR req_for_id = :user";

			$values = array();
			$values[':user'] = $id_user;

			try{
				$db->prepare($sql);
				$db->execute($values);
				return true;
			}catch(Exception $e){
				return $e;
			}

	}
	*/


	public static function removeUserFromRoleJoin($id_user, $transactional = false){
		$db = new EnsoDB($transactional);

		$sql = "DELETE FROM \"" . static::$joinUserRoleTable . "\" "
				. " WHERE \"id_user\" = :user";

			$values = array();
			$values[':user'] = $id_user;

			try{
				$db->prepare($sql);
				$db->execute($values);
				return true;
			}catch(Exception $e){
				return $e;
			}

	}

	public static function removeUserFromVac($id_user, $transactional = false){
		
		
		$vacs = VacationModel::getWhere(['req_by_id' => $id_user], ['id_vac']);

		if($vacs){
			foreach($vacs as $i => $vac){
				$idVac = $vacs[$i]['id_vac'];
				VacationModel::deleteAllVacDays($idVac, $transactional);
			}	
		}
		

		$sql = "DELETE FROM  \"vacations\" "
				. " WHERE \"req_by_id\" = :user";
		
		$sql1 = " UPDATE vacations"
		. " SET decided_by = null" 
		. " WHERE decided_by = :user";

		$values = array();
		$values[':user'] = $id_user;

			try{
				$db = new EnsoDB($transactional);
				$db->prepare($sql);
				$db->execute($values);
				$db->prepare($sql1);
				$db->execute($values);

				return true;
			}catch(Exception $e){
				return $e;
			}

	}

	public static function removeUserFromVacDays($id_user, $transactional = false){
		$db = new EnsoDB($transactional);

		$sql = "DELETE FROM  \"vac_days\" "
				. "WHERE \"id_user\" = :user";

			$values = array();
			$values[':user'] = $id_user;

			try{
				$db->prepare($sql);
				$db->execute($values);
				return true;
			}catch(Exception $e){
				return $e;
			}

	}

	public static function removeUserFromNotifications($id_user, $transactional = false){
		$db = new EnsoDB($transactional);

		$sql = "DELETE FROM  \"notifications\" "
				. "WHERE \"id_user\" = :user";

			$values = array();
			$values[':user'] = $id_user;

			try{
				$db->prepare($sql);
				$db->execute($values);
				return true;
			}catch(Exception $e){
				return $e;
			}
	}


	public static function removeUserFromGroupJoin($id_user, $transactional = false){
		$db = new EnsoDB($transactional);

		$sql = "DELETE FROM \"" . static::$joinUserGroupTable . "\" "
				. " WHERE \"id_user\" = :user";

			$values = array();
			$values[':user'] = $id_user;

			try{
				$db->prepare($sql);
				$db->execute($values);
				return true;
			}catch(Exception $e){
				return $e;
			}

	}


	public static function removeUserFromwork_blocksJoin($id_user, $transactional = false){
		$db = new EnsoDB($transactional);

		$sql = "DELETE FROM  \"" . static::$joinUserWorkBlockTable . "\" "
				. " WHERE \"id_user\" = :user";

			$values = array();
			$values[':user'] = $id_user;

			try{
				$db->prepare($sql);
				$db->execute($values);
				return true;
			}catch(Exception $e){
				return $e;
			}

	}
/* SAMPLE:
    SELECT users.username, roles.name
	FROM roles
	FULL OUTER JOIN user_has_roles on user_has_roles.id_role = roles.id_role
	FULL OUTER JOIN users on users.id_user = user_has_roles.id_user
*/
  public static function getUserRolesList($transactional = false){
    $sql = 'SELECT ' . self::$table . '.username, roles.name' .
      ' FROM roles ' .
      ' FULL OUTER JOIN ' . self::$joinUserRoleTable . ' on ' . self::$joinUserRoleTable . '.id_role = roles.id_role' .
      ' FULL OUTER JOIN ' . self::$table . ' on ' . self::$table . '.id_user =  ' . self::$joinUserRoleTable . '.id_user ';


	try{
      $db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute();
			return $db->fetchAll();
	}catch(Exception $e){
			return $e;
	}
  }

  public static function getUserGroupsList($transactional = false){
    $sql = 'SELECT ' . self::$table . '.username, groups.name' .
      ' FROM groups ' .
      ' FULL OUTER JOIN ' . self::$joinUserGroupTable . ' on ' . self::$joinUserGroupTable . '.id_group = groups.id_group' .
      ' FULL OUTER JOIN ' . self::$table . ' on ' . self::$table . '.id_user =  ' . self::$joinUserGroupTable . '.id_user ';


	try{
      $db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute();
			return $db->fetchAll();
	}catch(Exception $e){
			return $e;
	}
  }


  


  public static function editVacDays($id_user, $year, $vac_days, $transactional = false){
	$sql = 'UPDATE  ' . self::$vacDaysTable . 
			  ' SET days = :days, days_remaining = :days' .
			  ' WHERE id_user = :idUser' . 
			  ' AND year = :year';
	$values = array();
	$values[':idUser'] = $id_user;
	$values[':year'] = $year;
	$values[':days'] = $vac_days;

	try{
      $db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute($values);
			return $db->fetchAll();
	}catch(Exception $e){
			return $e;
	}
  } 

  public static function getVacDays($id_user, $year, $transactional = false){
	  $sql = 'SELECT days  ' . 
	  		 ' FROM ' . self::$vacDaysTable  . 
			  ' WHERE id_user = :idUser ' .
			  ' AND year = :year';
	$values = array();
	$values[':idUser'] = $id_user;
	$values[':year'] = $year;

	try{
      $db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute($values);
			//return intval($db->fetchAll(PDO::FETCH_ASSOC)[0]['days']);
			$result = $db->fetchAll(PDO::FETCH_ASSOC);
			if(array_key_exists(0, $result)){
				//error_log("111");
 				return intval($result[0]['days']);
 			}else{
				//error_log("sads");
 				return 0;
			}
	}catch(Exception $e){
			return $e;
	}
  } 

  public static function getRemainingVacDays($id_user, $year, $transactional = false){
	  $sql = 'SELECT days_remaining  ' . 
	  		 ' FROM ' . self::$vacDaysTable  . 
			  ' WHERE id_user = :idUser ' .
			  ' AND year = :year';
	$values = array();
	$values[':idUser'] = $id_user;
	$values[':year'] = $year;

	try{
      $db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute($values);
			//return intval($db->fetchAll(PDO::FETCH_ASSOC)[0]['days']);
			$result = $db->fetchAll(PDO::FETCH_ASSOC);
			if(array_key_exists(0, $result)){
				//error_log("111");
 				return intval($result[0]['days_remaining']);
 			}else{
				//error_log("sads");
 				return 0;
			}
	}catch(Exception $e){
			return $e;
	}
  } 
  
	/* SAMPLE:
		INSERT INTO vac_days(days, id_user, year)
		VALUES(97, 1, 2019)
		ON CONFLICT ON CONSTRAINT id_user_year_uq
		DO UPDATE SET days = 919
	*/
  public static function addVacDays($id_user, $year, $vac_days, $transactional = false){
	$sql = 'INSERT INTO ' . self::$vacDaysTable . ' (days, days_remaining, id_user, year) ' .
			  ' VALUES (:days, :days, :idUser, :year)' . 
			  ' ON CONFLICT ON CONSTRAINT id_user_year_uq' .
			  ' DO UPDATE SET days = :days, days_remaining = :days';

	$values = array();
	$values[':idUser'] = $id_user;
	$values[':year'] = $year;
	$values[':days'] = $vac_days;

	try{
	$db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute($values);
			return $db->fetchAll();
	}catch(Exception $e){
			return $e;
	}
  }
  /* Increments or Decrements the amount of Vac Days the user has for a specific year */
  public static function incDecVacDays($id_user, $year, $change, $transactional = false){
  	$sql = 'INSERT INTO ' . self::$vacDaysTable . ' (days, days_remaining, id_user, year) ' .
			  ' VALUES (:days, :days, :idUser, :year)' . 
			  ' ON CONFLICT ON CONSTRAINT id_user_year_uq' .
			  ' DO UPDATE SET days_remaining = ' . self::$vacDaysTable . '.days_remaining + :days';

	$values = array();
	$values[':idUser'] = $id_user;
	$values[':year'] = $year;
	$values[':days'] = $change;

	try{
		$db = new EnsoDB($transactional);
		$db->prepare($sql);
		$db->execute($values);
		return $db->fetchAll();
	}catch(Exception $e){
			return $e;
	}
  }


  public static function getAllUsersWithAction($action_name, $transactional = false){
        $sql = 'SELECT users.id_user, users.email, actions.action_name' . 
            ' FROM actions' .
            ' FULL OUTER JOIN role_has_actions on role_has_actions.action_name = actions.action_name' .
            ' FULL OUTER JOIN user_has_roles on user_has_roles.id_role = role_has_actions.id_role' .
            ' FULL OUTER JOIN users on users.id_user = user_has_roles.id_user' .
			' WHERE actions.action_name = :actionName' .
			' AND users.email > :nSpace';

        $values = array();
		$values[':actionName'] = $action_name;
		$values[':nSpace'] = '';
		
		try{
			$db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute($values);
			return $db->fetchAll();
		}catch(Exception $e){
			return $e;
	}
    }
  
	public static function getAllUsersWithRoles($roles, $transactional = false){
		 $sql = 'SELECT ' . self::$table . '.id_user, username, email' .
				 ' FROM ' . self::$table .
				 ' FULL OUTER JOIN ' . self::$joinUserRoleTable . ' on ' . self::$joinUserRoleTable . '.id_user = ' . self::$table .'.id_user' .
				 ' FULL OUTER JOIN roles on roles.id_role = ' . self::$joinUserRoleTable .'.id_role';

		
		if($roles){
			foreach($roles as $i => $role){
				if($i === 0)
					$sql .= " WHERE roles.name = " . "'$role'";
				else
					$sql .= " OR roles.name = " . "'$role'";
			}
		}
		
		try{
			$db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute();
			return $db->fetchAll();
		}catch(Exception $e){
			return $e;
	}
}

public static function getAllUsersWithGroups($groups, $transactional = false){
	$sql = 'SELECT ' . self::$table . '.id_user, username, email' .
				' FROM ' . self::$table .
				' FULL OUTER JOIN ' . self::$joinUserGroupTable . ' on ' . self::$joinUserGroupTable . '.id_user = ' . self::$table .'.id_user' .
				' FULL OUTER JOIN groups on groups.id_group = ' . self::$joinUserGroupTable .'.id_group';

	
	if($groups){
		foreach($groups as $i => $group){
			if($i === 0)
				$sql .= " WHERE groups.name = " . "'$group'";
			else
				$sql .= " OR groups.name = " . "'$group'";
		}
	}

	try{
		$db = new EnsoDB($transactional);
		$db->prepare($sql);
		$db->execute();
		return $db->fetchAll();
	}catch(Exception $e){
		return $e;
	}
}

public static function getAllUsersWithGroupsOrRoles($groups, $roles, $transactional = false){
	$sql = 'SELECT ' . self::$table . '.id_user, username, email' .
				' FROM ' . self::$table .
				' FULL OUTER JOIN ' . self::$joinUserGroupTable . ' on ' . self::$joinUserGroupTable . '.id_user = ' . self::$table .'.id_user' .
				' FULL OUTER JOIN groups on groups.id_group = ' . self::$joinUserGroupTable .'.id_group' . 
				' FULL OUTER JOIN ' . self::$joinUserRoleTable . ' on ' . self::$joinUserRoleTable . '.id_user = ' . self::$table .'.id_user' .
				' FULL OUTER JOIN roles on roles.id_role = ' . self::$joinUserRoleTable .'.id_role';

	if($groups){
		foreach($groups as $i => $group){
			if($i === 0)
				$sql .= " WHERE (groups.name = " . "'$group'";
			else
				$sql .= " OR groups.name = " . "'$group'";
		}
		$sql .= ') ';
	}else{
		$sql .= " WHERE (groups.name = 'somethingsomething')";
	}

	if($roles){
		foreach($roles as $i => $role){
			if($i === 0)
				$sql .= " OR (roles.name = " . "'$role'";
			else
				$sql .= " OR roles.name = " . "'$role'";
		}
		$sql .= ') ';
	}else{
		$sql .= " OR( roles.name = 'somethingsomething')";
	}

	try{
		$db = new EnsoDB($transactional);
		$db->prepare($sql);
		$db->execute();
		return $db->fetchAll();
	}catch(Exception $e){
		return $e;
	}
}


public static function getAllUsersWithGroupsAndRoles($groups, $roles, $transactional = false){
	$sql = 'SELECT ' . self::$table . '.id_user, username, email' .
				' FROM ' . self::$table .
				' FULL OUTER JOIN ' . self::$joinUserGroupTable . ' on ' . self::$joinUserGroupTable . '.id_user = ' . self::$table .'.id_user' .
				' FULL OUTER JOIN groups on groups.id_group = ' . self::$joinUserGroupTable .'.id_group' . 
				' FULL OUTER JOIN ' . self::$joinUserRoleTable . ' on ' . self::$joinUserRoleTable . '.id_user = ' . self::$table .'.id_user' .
				' FULL OUTER JOIN roles on roles.id_role = ' . self::$joinUserRoleTable .'.id_role';

	if($groups){
		foreach($groups as $i => $group){
			if($i === 0)
				$sql .= " WHERE (groups.name = " . "'$group'";
			else
				$sql .= " OR groups.name = " . "'$group'";
		}
		$sql .= ') ';
	}else{
		$sql .= " WHERE (groups.name = 'somethingsomething')";
	}

	if($roles){
		foreach($roles as $i => $role){
			if($i === 0)
				$sql .= " AND (roles.name = " . "'$role'";
			else
				$sql .= " OR roles.name = " . "'$role'";
		}
		$sql .= ') ';
	}else{
		$sql .= " AND( roles.name = 'somethingsomething')";
	}

	try{
		$db = new EnsoDB($transactional);
		$db->prepare($sql);
		$db->execute();
		return $db->fetchAll();
	}catch(Exception $e){
		return $e;
	}
}

public static function getAllUsersGroupsAndRolesNames(){
	$list['users'] = UserModel::getAll(['username']);
	$list['roles'] = RoleModel::getAll(['name']);
	$list['groups'] = GroupModel::getAll(['name']);

	return $list;
}

public static function isOnlyTryingToAccessItsOwn($users, $groups, $roles, $id_authUser){
	if($groups || $roles) return false;
	if(!$users || count($users) > 1) return false;

	/* At this point, we know there's only one user in the list */
	$id_user = UserModel::getUserIdByName($users[0]);
	if($id_user != $id_authUser) return false;

	return true;
}

}

