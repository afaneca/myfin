<?php
class WorkBlockModel extends Entity
{
    protected static $table = "work_blocks";
    protected static $joinGroupWorkBlockTable = "group_has_workblocks";
    protected static $joinUserWorkBlockTable = "user_has_workblocks";
    protected static $joinRoleWorkBlockTable = "role_has_workblocks";

    protected static $columns = [
        "id_block",
        "week_day", // [0] - Domingo ... [6] - Sábado
        "time_start",
        "time_end",
        "location",
        "presential",
        "description",
        "check_in_timestamp",
        "check_out_timestamp",
    ];
    
    public static function addWorkBlockToGroup($id_group, $id_block, $transactional = false)
    {
        $sql = "INSERT INTO \"" . static::$joinGroupWorkBlockTable . "\" (\"id_group\", \"id_block\") "
            . " VALUES(:id_group, :id_block) ";

        $values = array();
        $values['id_block'] = $id_block;
        $values['id_group'] = $id_group;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return true;
        } catch (PDOException $e) {
            return $e;
        }
    }

    public static function addWorkBlockToRole($id_role, $id_block, $transactional = false)
    {
        $sql = "INSERT INTO \"" . static::$joinRoleWorkBlockTable . "\" (\"id_role\", \"id_block\") "
            . " VALUES(:id_role, :id_block) ";

        $values = array();
        $values['id_block'] = $id_block;
        $values['id_role'] = $id_role;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return true;
        } catch (PDOException $e) {
            return $e;
        }
    }

    public static function addWorkBlockToUser($id_user, $id_block, $transactional = false)
    {
        $sql = "INSERT INTO \"" . static::$joinUserWorkBlockTable . "\" (\"id_user\", \"id_block\") "
            . " VALUES(:id_user, :id_block) ";

        $values = array();
        $values['id_block'] = $id_block;
        $values['id_user'] = $id_user;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return true;
        } catch (PDOException $e) {
            return $e;
        }
    }

    public static function removeWorkBlockFromUser($id_user, $id_block, $transactional = false)
    {
        $sql = "DELETE FROM \"" . static::$joinUserWorkBlockTable . "\" "
            . " WHERE \"id_user\" = :id_user "
            . " AND \"id_block\" = :id_block ";

        $values = array();
        $values['id_user'] = $id_user;
        $values['id_block'] = $id_block;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return true;
        } catch (PDOException $e) {
            return $e;
        }
    }

    public static function removeWorkBlockFromRole($id_role, $id_block, $transactional = false)
    {
        $sql = "DELETE FROM \"" . static::$joinRoleWorkBlockTable . "\" "
            . " WHERE \"id_role\" = :id_role "
            . " AND \"id_block\" = :id_block ";

        $values = array();
        $values['id_role'] = $id_role;
        $values['id_block'] = $id_block;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return true;
        } catch (PDOException $e) {
            return $e;
        }
    }

    public static function removeWorkBlockFromGroup($id_group, $id_block, $transactional = false)
    {
        $sql = "DELETE FROM \"" . static::$joinGroupWorkBlockTable . "\" "
            . " WHERE \"id_group\" = :id_group "
            . " AND \"id_block\" = :id_block ";

        $values = array();
        $values['id_group'] = $id_group;
        $values['id_block'] = $id_block;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return true;
        } catch (PDOException $e) {
            return $e;
        }
    }

    public static function getUserWorkBlocks($id_user, $transactional = false)
    {
        $sql = "SELECT \"id_block\" FROM \"" . static::$joinUserWorkBlockTable . "\"  "
            . "WHERE \"id_user\" = :id ";

        $values = array();
        $values[':id'] = $id_user;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $row = $db->fetchAll();

            //caso exista, construir o array com os valores a retornar;
            $ret = array();
            foreach ($row as $task) {
                array_push($ret, $task); //name
            }

            return $ret;
        } catch (PDOException $e) {
            return false;
        }

    }

    public static function getGroupWorkBlocks($id_group, $transactional = false)
    {
        $sql = "SELECT \"id_block\" FROM \"" . static::$joinGroupWorkBlockTable . "\"  "
            . "WHERE \"id_group\" = :id ";

        $values = array();
        $values[':id'] = $id_group;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $row = $db->fetchAll();

            //caso exista, construir o array com os valores a retornar;
            $ret = array();
            foreach ($row as $task) {
                array_push($ret, $task); //name
            }

            return $ret;
        } catch (PDOException $e) {
            return false;
        }

    }

    public static function getRoleWorkBlocks($id_role, $transactional = false)
    {
        $sql = "SELECT \"id_block\" FROM \"" . static::$joinRoleWorkBlockTable . "\"  "
            . "WHERE \"id_role\" = :id ";

        $values = array();
        $values[':id'] = $id_role;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $row = $db->fetchAll();

            //caso exista, construir o array com os valores a retornar;
            $ret = array();
            foreach ($row as $task) {
                array_push($ret, $task); //name
            }

            return $ret;
        } catch (PDOException $e) {
            return false;
        }

    }

    public static function getUsersWithWorkBlock($id_block, $transactional = false)
    {
        $sql = "SELECT users.id_user, users.username FROM " . static::$joinUserWorkBlockTable .
        " INNER JOIN users on users.id_user = " . static::$joinUserWorkBlockTable . ".id_user" .
            " WHERE id_block = :id ";

        $values = array();
        $values[':id'] = $id_block;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return $db->fetchAll();
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function getGroupsWithWorkBlock($id_block, $transactional = false)
    {
        $sql = "SELECT groups.id_group, groups.name FROM " . static::$joinGroupWorkBlockTable .
        " INNER JOIN groups on groups.id_group = " . static::$joinGroupWorkBlockTable . ".id_group" .
            " WHERE id_block = :id ";

        $values = array();
        $values[':id'] = $id_block;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return $db->fetchAll();
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function getRolesWithWorkBlock($id_block, $transactional = false)
    {
        $sql = "SELECT roles.id_role, roles.name FROM " . static::$joinRoleWorkBlockTable .
        " INNER JOIN roles on roles.id_role = " . static::$joinRoleWorkBlockTable . ".id_role" .
            " WHERE id_block = :id ";

        $values = array();
        $values[':id'] = $id_block;
        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return $db->fetchAll();

        } catch (PDOException $e) {
            return false;
        }
    }

    public static function getFilteredWorkBlocks($blocksList, $transactional = false)
    {

        if (empty($blocksList)) {
            return array();
        }

        $sql = "SELECT id_block, week_day, time_start, time_end, location, presential, description" .
        " FROM " . static::$table .
            " WHERE id_block = $blocksList[0]";

        for ($i = 1; $i < count($blocksList); $i++) {
            $sql .= " OR id_block = $blocksList[$i]";
        }

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute();

            $list = $db->fetchAll();

            foreach ($list as $i => $item) {
                $list[$i]['users'] = static::getUsersWithWorkBlock($list[$i]['id_block'], $transactional);
                $list[$i]['groups'] = static::getGroupsWithWorkBlock($list[$i]['id_block'], $transactional);
                $list[$i]['roles'] = static::getRolesWithWorkBlock($list[$i]['id_block'], $transactional);
            }

            return $list;
        } catch (PDOException $e) {
            return $e;
        }
    }

    // Removes all references of a task from the join table
    public static function removeWorkBlockFromUserJoin($id_block, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinUserWorkBlockTable . "\" "
            . "WHERE \"id_block\" = :block";

        $values = array();
        $values[':block'] = $id_block;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function removeWorkBlockFromGroupJoin($id_block, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinGroupWorkBlockTable . "\" "
            . "WHERE \"id_block\" = :block";

        $values = array();
        $values[':block'] = $id_block;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function removeWorkBlockFromRoleJoin($id_block, $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "DELETE FROM \"" . static::$joinRoleWorkBlockTable . "\" "
            . "WHERE \"id_block\" = :block";

        $values = array();
        $values[':block'] = $id_block;

        try {
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

    public static function getWhereWithInterval($filters, $attributes = null, $date1 = null, $date2 = null)
    {
        $db = new EnsoDB();
        $values = array();

        $sql = "SELECT ";

        if ($attributes === null) {
            $sql .= "* ";
        } else {
            foreach ($attributes as $dbName) {
                if (!in_array($dbName, static::$columns)) {
                    throw new InexistentAttributeProvidedException();
                } else {
                    $sql .= $dbName . ", ";
                }
            }

            $sql = substr($sql, 0, -2);
        }

        if (static::$view === null) {
            $sql .= " FROM \"" . static::$table . "\" ";
        } else {
            $sql .= " FROM \"" . static::$view . "\" ";
        }

        $sql .= static::formulateWhere($filters, $values);

        if ($date1 && $date2) {
            $sql .= " AND \"time_end\" >= '" . $date1 . "' AND  \"time_end\" <= '" . $date2 . "'";
        }

        $db->prepare($sql);
        $db->execute($values);

        return $db->fetchAll();
    }

    public static function formulateWhere($filters, &$values)
    {
        $sql = "";

        if (!empty($filters)) {
            $sql .= " WHERE ";

            foreach ($filters as $dbName => $value) {
                if (!in_array($dbName, static::$columns)) {
                    throw new InexistentAttributeProvidedException();
                } else {

                    $operator = '';

                    if (is_array($value)) {
                        if (count($value) > 1) {
                            $operator = $value[0];
                            $value = $value[1];
                        } else {
                            $value = $value[0];
                            if ($value === null) {
                                $operator = "IS";
                            } else {
                                $operator = "=";
                            }

                        }
                    } else {
                        if ($value === null) {
                            $operator = "IS";
                        } else {
                            $operator = "=";
                        }

                    }

                    $sql .= " \"$dbName\" $operator :WHERE$dbName AND ";
                    $values[':WHERE' . $dbName] = $value;
                }
            }

            $sql = substr($sql, 0, -4);
        }
        return $sql;
    }

    public static function getBlocksList($users, $groups, $roles)
    {
        $blocksList = array();

        if ($users) {
            foreach ($users as $i => $user) {
                $idUser = UserModel::getUserIdByName($users[$i]);
                /* Get work blocks associated with the user */
                $blocksList = array_merge($blocksList, WorkBlockModel::getUserWorkBlocks($idUser, true));

                /* Get work blocks associated with the user's groups */
                $userGroups = GroupModel::getAllUserGroups($idUser, true);

                if ($userGroups) {
                    if (!$groups) { // if its empty or null
                        $groups = array();
                    }
                    foreach ($userGroups as $n => $group) {
                        if (!in_array($group, $groups)) {
                            array_push($groups, $userGroups[$n]);
                        }
                    }

                }

                /* Get tasks associated with the user's roles */
                $userRoles = RoleModel::getAllUserRoles($idUser, true);

                if ($userRoles) {
                    if (!$roles) { // if its empty or null
                        $roles = array();
                    }
                    foreach ($userRoles as $n => $role) {
                        if (!in_array($role, $roles)) {
                            array_push($roles, $userRoles[$n]);
                        }
                    }

                }
            }
        }

        if ($groups) {
            foreach ($groups as $i => $group) {
                $idGroup = GroupModel::getGroupIdByName($group);
                $groupWorkBlocks = WorkBlockModel::getGroupWorkBlocks($idGroup, true);
                if ($groupWorkBlocks) {
                    $blocksList = array_merge($blocksList, $groupWorkBlocks);
                }
            }
        }

        if ($roles) {
            foreach ($roles as $i => $role) {
                $idRole = RoleModel::getRoleIdByName($role);
                $roleWorkBlocks = WorkBlockModel::getRoleWorkBlocks($idRole, true);
                if ($roleWorkBlocks) {
                    $blocksList = array_merge($blocksList, $roleWorkBlocks);
                }
            }
        }

        if (!$roles && !$groups && !$users) {
            $blocksList = WorkBlockModel::getAll(['id_block']);
        }

        $finalBlocksList = array();

        foreach ($blocksList as $i => $block) {
            array_push($finalBlocksList, $blocksList[$i]['id_block']);
        }

        return $finalBlocksList;
    }
}
