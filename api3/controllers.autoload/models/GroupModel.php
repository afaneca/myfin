<?php

class GroupModel extends Entity
{
    protected static $table = "groups";
   // protected static $view = 'UserInfo';
    protected static $joinGroupUserTable = "user_has_groups";
    protected static $joinGroupTaskTable = "group_has_tasks";
    protected static $joinGroupWorkBlockTable = "group_has_workblocks";

    protected static $columns = [
        "id_group",
        "name",
    ];

    

    public static function removeGroupFromUserJoin($id_group, $transactional = false){
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinGroupUserTable . "\" "
                . "WHERE \"id_group\" = :group";
        
            $values = array();
            $values[':group'] = $id_group;

            try{
                $db->prepare($sql);
                $db->execute($values);
                return true;
            }catch(Exception $e){
                return $e;
            }
    }

    public static function removeGroupFromTaskJoin($id_group, $transactional = false){
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinGroupTaskTable . "\" "
                . "WHERE \"id_group\" = :group";
        
            $values = array();
            $values[':group'] = $id_group;

            try{
                $db->prepare($sql);
                $db->execute($values);
                return true;
            }catch(Exception $e){
                return $e;
            }
    }

    public static function removeGroupFromWorkBlockJoin($id_group, $transactional = false){
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinGroupWorkBlockTable . "\" "
                . "WHERE \"id_group\" = :group";
        
            $values = array();
            $values[':group'] = $id_group;

            try{
                $db->prepare($sql);
                $db->execute($values);
                return true;
            }catch(Exception $e){
                return $e;
            }
    }

    public static function getGroupIdByName($groupName, $transactional = false){
        $sql = 'SELECT id_group' .
                ' FROM ' . self::$table . 
                ' WHERE name = :name ';

        $values = array($transactional);
        $values[':name'] = $groupName;

        try{
			$db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute($values);
			
			return intval($db->fetchAll()[0]['id_group']); // O resultado tem que ser convertido em int antes de retornar (por default, é String)
		}catch (PDOException $e){
			return false;
		}
    }

    public static function clearUsersinGroup($groupId, $transactional = false){
        $sql = 'DELETE FROM ' . self::$joinGroupUserTable . 
        ' WHERE ' . self::$joinGroupUserTable . '.id_group = :idGroup ';

        $values = array();
        $values[':idGroup'] = $groupId;
        
        try {
			$db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute($values);

			return true;
		} catch (PDOException $e) {
			return false;
		}
    }

    public static function addGroupToUser($userId, $groupId, $transactional = false){
        $sql = 'INSERT INTO ' . self::$joinGroupUserTable . ' (id_user, id_group)' .
                ' VALUES(:idUser, :idGroup)';

        $values = array();
        $values[':idUser'] = $userId;
        $values[':idGroup'] = $groupId;

        try {
			$db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute($values);

			return true;
		} catch (PDOException $e) {
			return false;
		}
    }

    public static function removeGroupFromUser($userId, $groupId, $transactional = false){
        $sql = 'DELETE FROM ' . self::$joinGroupUserTable . 
                ' WHERE id_user = :idUser AND id_group = :idGroup';

        $values = array();
        $values[':idUser'] = $userId;
        $values[':idGroup'] = $groupId;

        try {
			$db = new EnsoDB($transactional);
			$db->prepare($sql);
			$db->execute($values);

			return true;
		} catch (PDOException $e) {
			return false;
		}
    }

    /* SAMPLE:         
        INSERT INTO vac_days (days, id_user, year)
        SELECT 101, users.id_user, 2016
        FROM users, user_has_groups, groups
        WHERE user_has_groups.id_group = groups.id_group
        AND groups.name = 'DEV'
        AND users.id_user = user_has_groups.id_user
        ON CONFLICT ON CONSTRAINT id_user_year_uq
        DO UPDATE SET days = 101
        */
    public static function changeGroupVacs($group, $vac_days, $year, $transactional = false){
        $sql =  'INSERT INTO vac_days (days, id_user, year)' .
                ' SELECT :vacDays, users.id_user, :year' .
                ' FROM users, ' . self::$joinGroupUserTable . ', ' . self::$table .
                ' WHERE users.id_user = ' . self::$joinGroupUserTable . '.id_user' . 
                ' AND ' . self::$joinGroupUserTable . '.id_group =' . self::$table . '.id_group ' .
                ' AND ' . self::$table . '.name = :group' .
                ' ON CONFLICT ON CONSTRAINT id_user_year_uq' .
                ' DO UPDATE SET days = :vacDays ';
        


            $values = array();
            $values[':vacDays'] = $vac_days;
            $values[':group'] = $group;
            $values[':year'] = $year;

            try{
                $db = new EnsoDB($transactional);
                $db->prepare($sql);
                $db->execute($values);
                return true;
            }catch(Exception $e){
                return $e;
            }

    }
    

    public static function getAllUserGroups($idUser, $transactional = false){
    $sql = 'SELECT ' . GroupModel::$table . '.name' .
      ' FROM ' . GroupModel::$joinGroupUserTable . 
      ' FULL OUTER JOIN ' . GroupModel::$table . ' on ' . GroupModel::$table . '.id_group = ' . GroupModel::$joinGroupUserTable . '.id_group' .
      ' WHERE id_user = :idUser';


    try{
        $values = array();
        $values[':idUser'] = $idUser;

        $db = new EnsoDB($transactional);
                $db->prepare($sql);
                $db->execute($values);
                return $db->fetchAll(PDO::FETCH_COLUMN);
    }catch(Exception $e){
            return $e;
    }
  }
}

