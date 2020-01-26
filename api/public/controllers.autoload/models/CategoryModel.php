<?php
class CategoryModel extends Entity
{
    protected static $table = "categories";

    protected static $columns = [
        "category_id",
        "name",
        "type",
        "description",
        "users_user_id"
    ];
}
