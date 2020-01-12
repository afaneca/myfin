<?php

class UserModel extends Entity
{
    protected static $table = "users";
    // protected static $view = 'UserInfo';
    /* protected static $joinUserTaskTable = "user_has_tasks";
    protected static $joinUserWorkBlockTable = "user_has_workblocks";
    protected static $joinUserRoleTable = "user_has_roles";
    protected static $joinUserGroupTable = "user_has_groups";
    protected static $groupsTable = "groups";
    protected static $vacDaysTable = "vac_days"; */

    protected static $columns = [
        "user_id",
        "username",
        "password",
        "email",
        "sessionkey",
        "trustlimit",
        "trustlimit_mobile",
        "sessionkey_mobile"
    ];


    public static function getUserIdByName($name, $transactional = false)
    {
        $sql = "SELECT user_id" . " " .
            "FROM " . self::$table . " " .
            "WHERE username = :name";

        $values = array();
        $values[':name'] = $name;



        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $replyArr = $db->fetchAll(PDO::FETCH_ASSOC);


            if (count($replyArr) < 1)
                throw new AuthenticationException($name);
            else
                return intval($replyArr[0]['user_id']); // O resultado tem que ser convertido em int antes de retornar (por default, é String)
        } catch (PDOException $e) {

            return $e;
        }
    }

    public static function getUserNameById($id, $transactional = false)
    {
        $sql = "SELECT \"username\" " .
            "FROM \"" . self::$table . "\" " .
            "WHERE \"" . self::$table . "\".\"user_id\" = :id";

        $values = array();
        $values[':id'] = $id;



        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return $db->fetchAll(PDO::FETCH_ASSOC)[0]['username']; // O resultado tem que ser convertido em int antes de retornar (por default, é String)
        } catch (PDOException $e) {

            return false;
        }
    }
}
