<?php
class ActionModel extends Entity
{
    protected static $table = "actions";
    // protected static $view = 'UserInfo';
    
    protected static $columns = [
        "action_name",
        "created_timestamp",
    ];

}
