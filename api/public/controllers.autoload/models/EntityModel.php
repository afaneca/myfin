<?php

class EntityModel extends Entity
{
    protected static $table = "entities";

    protected static $columns = [
        "entity_id",
        "name",
        "users_user_id"
    ];

    public static function createMockEntities($userId, $quantity = 5, $transactional = false)
    {
        for ($i = 1; $i <= $quantity; $i++) {
            $entityName = "Entity $i";

            if (!EntityModel::exists([
                "name" => $entityName,
            ])) {
                EntityModel::insert([
                    "name" => $entityName,
                    "users_user_id" => $userId,
                ], $transactional);
            }
        }
    }
}
