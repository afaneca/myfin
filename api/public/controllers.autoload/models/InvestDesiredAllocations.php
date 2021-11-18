<?php

class InvestDesiredAllocations extends Entity
{
    protected static $table = "invest_desired_allocations";

    protected static $columns = [
        "desired_allocations_id",
        "type",
        "alloc_percentage",
        "users_user_id"
    ];
}