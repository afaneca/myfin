<?php

class UserModel extends Entity
{
    protected static $table = "users";
    // protected static $view = 'UserInfo';

    protected static $columns = [
        "user_id",
        "username",
        "password",
        "email",
        "sessionkey",
        "trustlimit",
        "trustlimit_mobile",
        "sessionkey_mobile",
        "last_update_timestamp"
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

    public static function setLastUpdateTimestamp($userId, $timestamp, $transactional = false)
    {
        UserModel::editWhere(
            [
                "user_id" => $userID
            ],
            [
                "last_update_timestamp" => $timestamp
            ], $transactional
        );
    }
}
