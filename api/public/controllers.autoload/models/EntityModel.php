<?php

class EntityModel extends Entity
{
    protected static $table = "entities";

    protected static $columns = [
        "entity_id",
        "name",
        "users_user_id"
    ];

    public static function createEntity($userId, $name, $transactional = false)
    {
        if (!EntityModel::exists([
            "name" => $name,
            "users_user_id" => $userId,
        ])) {
            return EntityModel::insert([
                "name" => $name,
                "users_user_id" => $userId,
            ], $transactional);
        } else return null;
    }
}
