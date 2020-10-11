<?php

abstract class Entity implements iEntity
{
    protected static $table = null;
    protected static $columns = null;
    protected static $view = null;

    public static function exists($filters) //TODO: pks are filters
    {
        $db = new EnsoDB();

        $sql = "SELECT COUNT(*) AS n
                    FROM " . static::$table . " ";

        $values = array();
        $sql .= static::formulateWhere($filters, $values);

        $db->prepare($sql);
        $db->execute($values);

        return ($db->fetch()['n'] > 0 ? true : false);
    }

    public static function insert($attributes, bool $transactional = false, $returnField = null)
    {
        $db = new EnsoDB($transactional);

        $sql = "INSERT INTO " . static::$table . "(";
        $values = array();
        foreach ($attributes as $dbName => $value) {
            if (!in_array($dbName, static::$columns))
                throw new InexistentAttributeProvidedException();
            else {
                $sql .= "$dbName, ";
            }
        }
        $sql = substr($sql, 0, -2) . ") VALUES (";
        foreach ($attributes as $dbName => $value) {
            if (!in_array($dbName, static::$columns))
                throw new InexistentAttributeProvidedException();
            else {
                $sql .= ":$dbName, ";
                $values[':' . $dbName] = $value;
            }
        }
        $sql = substr($sql, 0, -2) . ")";

        $db->prepare($sql);
        $db->execute($values);

        return $db->getDB()->lastInsertId();
    }

    public static function editWhere($filters, $newAttributes, bool $transactional = false)
    {
        $db = new EnsoDB($transactional);

        $sql = "UPDATE " . static::$table . " SET ";
        $values = array();
        foreach ($newAttributes as $dbName => $value) {
            if (!in_array($dbName, static::$columns))
                throw new InexistentAttributeProvidedException();
            else {
                $sql .= "$dbName = :$dbName, ";
                $values[':' . $dbName] = $value;
            }
        }
        $sql = substr($sql, 0, -2);
        $sql .= static::formulateWhere($filters, $values);

        $db->prepare($sql);
        $db->execute($values);
    }

    public static function delete($primaryKeys, bool $transactional = false)
    {
        $db = new EnsoDB($transactional);
        $values = array();

        $sql = "DELETE FROM " . static::$table . " ";
        $sql .= static::formulateWhere($primaryKeys, $values);

        $db->prepare($sql);
        $db->execute($values);
    }

    public static function getWhere($filters, $attributes = null, $range = null)
    {
        $db = new EnsoDB();
        $values = array();
        $sql = "SELECT ";
        if ($attributes === null)
            $sql .= "* ";
        else {
            foreach ($attributes as $dbName) {
                if (!in_array($dbName, static::$columns))
                    throw new InexistentAttributeProvidedException();
                else {
                    $sql .= $dbName . ", ";
                }
            }
            $sql = substr($sql, 0, -2);
        }
        if (static::$view === null)
            $sql .= " FROM " . static::$table . " ";
        else
            $sql .= " FROM " . static::$view . " ";
        $sql .= static::formulateWhere($filters, $values);
        if (!empty($range)) {
            $sql .= " LIMIT " . $range[0] . ", " . $range[1];
        }

        $db->prepare($sql);
        $db->execute($values);
        return $db->fetchAll();
    }


    /* GET WHERE EXPLICITLY FROM THE TABLE (IGNORES THE VIEW) */
    public static function getWhereFromTable($filters, $attributes = null, $range = null)
    {
        $db = new EnsoDB();
        $values = array();

        $sql = "SELECT ";

        if ($attributes === null)
            $sql .= "* ";
        else {
            foreach ($attributes as $dbName) {
                if (!in_array($dbName, static::$columns))
                    throw new InexistentAttributeProvidedException();
                else {
                    $sql .= $dbName . ", ";
                }
            }

            $sql = substr($sql, 0, -2);
        }

        $sql .= " FROM \"" . static::$table . "\" ";

        $sql .= self::formulateWhere($filters, $values);

        if (!empty($range)) {
            $sql .= " LIMIT " . $range[0] . ", " . $range[1];
        }

        $db->prepare($sql);

        $db->execute($values);

        return $db->fetchAll();
    }

    public static function getAll($attributes = null, $range = null)
    {
        return static::getWhere(null, $attributes, $range);
    }

    private static function formulateWhere($filters, &$values)
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
                    $sql .= " $dbName $operator :WHERE$dbName AND ";
                    $values[':WHERE' . $dbName] = $value;
                }
            }
            $sql = substr($sql, 0, -4);
        }
        return $sql;
    }

    public static function getCounter()
    {
        $sql = "SELECT count(*) " .
            "FROM " . static::$table;

        try {
            $db = new EnsoDB();
            $db->prepare($sql);
            $db->execute();

            return $db->fetch(PDO::FETCH_COLUMN);
        } catch (PDOException $e) {
            return $e;
        }
    }

    public static function getCounterWhere($filters = null)
    {
        $values = array();
        $sql = "SELECT count(*) " .
            "FROM " . static::$table . " ";

        if ($filters != null)
            $sql .= static::formulateWhere($filters, $values);



        try {
            $db = new EnsoDB();
            $db->prepare($sql);
            $db->execute($values);

            return $db->fetch(PDO::FETCH_COLUMN);
        } catch (PDOException $e) {
            return $e;
        }
    }

    public static function clearUsersinRole($table, $roleId)
    {
        $sql = 'DELETE FROM ' . $table .
            ' WHERE ' . $table . '.id_role = :idRole ';

        $values = array();
        $values[':idRole'] = $roleId;

        try {
            $db = new EnsoDB();
            $db->prepare($sql);
            $db->execute($values);

            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
}
