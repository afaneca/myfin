<?php

class RoleModel extends Entity
{
    protected static $table = "roles";
    // protected static $view = 'UserInfo';
    protected static $joinRoleActionTable = "role_has_actions";
    protected static $joinRoleUserTable = "user_has_roles";
    protected static $joinRoleTaskTable = "role_has_tasks";
    protected static $joinRoleWorkBlockTable = "role_has_workblocks";
    protected static $columns = [
        "id_role",
        "name",
    ];

    public static function insertActionWhere($id_role, $action_name, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "INSERT INTO \"" . static::$joinRoleActionTable . "\" ("
            . "\"id_role\", \"action_name\", \"inserted_timestamp\")"
            . " VALUES (:role, '" . $action_name . "', :inserted_timestamp)";

        $values = array();
        $values[':role'] = $id_role;
        $values['inserted_timestamp'] = time();

        try {
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function removeActionFromJoinWhere($id_role, $action_name, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinRoleActionTable . "\" "
            . "WHERE \"id_role\" = :role AND \"action_name\" = '" . $action_name . "'";

        $values = array();
        $values[':role'] = $id_role;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function removeActionFromJoin($action_name, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinRoleActionTable . "\" "
            . "WHERE \"action_name\" = '" . $action_name . "'";

        try {
            $db->prepare($sql);
            $db->execute();
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function removeRoleFromUserJoin($id_role, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinRoleUserTable . "\" "
            . "WHERE \"id_role\" = :role";

        $values = array();
        $values[':role'] = $id_role;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function removeRoleFromActionJoin($id_role, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinRoleActionTable . "\" "
            . "WHERE \"id_role\" = :role";

        $values = array();
        $values[':role'] = $id_role;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function removeRoleFromTaskJoin($id_role, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinRoleTaskTable . "\" "
            . "WHERE \"id_role\" = :role";

        $values = array();
        $values[':role'] = $id_role;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function removeRoleFromWorkBlockJoin($id_role, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinRoleWorkBlockTable . "\" "
            . "WHERE \"id_role\" = :role";

        $values = array();
        $values[':role'] = $id_role;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

    /* SAMPLE:
    INSERT INTO vac_days (days, id_user, year)
    SELECT 101, users.id_user, 2016
    FROM users, user_has_roles, roles
    WHERE user_has_roles.id_role = roles.id_role
    AND roles.name = 'Admin'
    AND users.id_user = user_has_roles.id_user
    ON CONFLICT ON CONSTRAINT id_user_year_uq
    DO UPDATE SET days = 99
     */
    public static function changeRoleVacs($role, $vac_days, $year, $transactional = false)
    {
        $sql = 'INSERT INTO vac_days (days, id_user, year)' .
        ' SELECT :vacDays, users.id_user, :year' .
        ' FROM users, user_has_roles, ' . self::$table .
        ' WHERE users.id_user = user_has_roles.id_user' .
        ' AND user_has_roles.id_role =' . self::$table . '.id_role ' .
        ' AND ' . self::$table . '.name = :role' .
            ' ON CONFLICT ON CONSTRAINT id_user_year_uq' .
            ' DO UPDATE SET days = :vacDays ';

        $values = array();
        $values[':vacDays'] = $vac_days;
        $values[':role'] = $role;
        $values[':year'] = $year;

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }

    }
    /* SAMPLE:
    SELECT *
    FROM vac_days, user_has_roles, roles
    WHERE vac_days.id_user = user_has_roles.id_user
    AND user_has_roles.id_role = roles.id_role
    AND roles.name = 'Admin'
    AND vac_days.year = 2018
     */
    public static function getVacDays($idRole, $year, $transactional = false)
    {
        $sql = 'SELECT *  ' .
        ' FROM ' . self::$vacDaysTable . ', ' . self::$joinRoleUserTable . ', ' . self::$table .
        ' WHERE ' . self::$vacDaysTable . '.id_user =  ' . self::$joinRoleUserTable . '.id_user' .
        ' AND ' . self::$joinRoleUserTable . '.id_role =  ' . self::$table . '.id_role' .
        ' AND ' . self::$table . '.id_role = :idRole' .
        ' AND ' . self::$table . '.year = :year';
        $values = array();
        $values[':idRole'] = $idRole;
        $values[':year'] = $year;

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);
            return intval($db->fetch());
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getAllUserRoles($idUser, $transactional = false)
    {
        $sql = 'SELECT ' . RoleModel::$table . '.name' .
        ' FROM ' . RoleModel::$joinRoleUserTable .
        ' FULL OUTER JOIN ' . RoleModel::$table . ' on ' . RoleModel::$table . '.id_role = ' . RoleModel::$joinRoleUserTable . '.id_role' .
            ' WHERE id_user = :idUser';

        try {
            $values = array();
            $values[':idUser'] = $idUser;

            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);
            return $db->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getRoleIdByName($roleName, $transactional = false)
    {
        $sql = 'SELECT id_role' .
        ' FROM ' . self::$table .
            ' WHERE name = :name ';

        $values = array($transactional);
        $values[':name'] = $roleName;

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return intval($db->fetchAll()[0]['id_role']); // O resultado tem que ser convertido em int antes de retornar (por default, é String)
        } catch (PDOException $e) {
            return false;
        }
    }
}
