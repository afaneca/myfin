<?php
class EntityModel extends Entity
{
    protected static $table = "entities";

    protected static $columns = [
        "entity_id",
        "name",
        "users_user_id"
    ];
}
