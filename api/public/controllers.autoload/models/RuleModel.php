<?php


class RuleModel extends Entity
{
    protected static $table = "rules";

    protected static $columns = [
        "rule_id",
        "matcher_description_operator", // EQ (equal) or NEQ (not equal)
        "matcher_description_value",
        "matcher_amount_operator",
        "matcher_amount_value",
        "matcher_type_operator",
        "matcher_type_value",
        "matcher_account_to_id_operator",
        "matcher_account_to_id_value",
        "matcher_account_from_id_operator",
        "matcher_account_from_id_value",
        "assign_category_id",
        "assign_entity_id",
        "assign_account_to_id",
        "assign_account_from_id",
        "assign_type",
        "users_user_id"
    ];
}