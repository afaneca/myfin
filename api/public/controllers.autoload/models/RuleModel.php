<?php

require_once 'consts.php';

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

    public static function getRuleForTransaction($userID, $trx, $transactional = false)
    {

        $rules = RuleModel::getWhere(
            ["users_user_id" => $userID]
        );

        /*print_r($rules);
        die();*/

        foreach ($rules as $rule) {
            $hasMatched = false;

            /* description matcher */
            if ($rule["matcher_description_operator"] && $rule["matcher_description_value"]) {
                // If it is defined, check if it matches
                $ruleOperator = $rule["matcher_description_operator"];
                $ruleValue = $rule["matcher_description_value"];

                if ($ruleOperator == DEFAULT_RULES_OPERATOR_CONTAINS) {
                    if (RuleModel::contains($ruleValue, $trx["description"])) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_NOT_CONTAINS) {
                    if (!RuleModel::contains($ruleValue, $trx["description"])) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_EQUALS) {
                    if ($ruleValue == $trx["description"]) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_NOT_EQUALS) {
                    if ($ruleValue != $trx["description"]) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                }
            }

            /* amount matcher */
            if ($rule["matcher_amount_operator"] && $rule["matcher_amount_value"]) {
                // If it is defined, check if it matches
                $ruleOperator = $rule["matcher_amount_operator"];
                $ruleValue = $rule["matcher_amount_value"];

                if ($ruleOperator == DEFAULT_RULES_OPERATOR_CONTAINS) {
                    if (RuleModel::contains($ruleValue, Input::convertFloatToIntegerAmount($trx["amount"]))) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_NOT_CONTAINS) {
                    if (!RuleModel::contains($ruleValue, Input::convertFloatToIntegerAmount($trx["amount"]))) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_EQUALS) {
                    if ($ruleValue == Input::convertFloatToIntegerAmount($trx["amount"])) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_NOT_EQUALS) {
                    if ($ruleValue != Input::convertFloatToIntegerAmount($trx["amount"])) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                }
            }

            /* type matcher */
            if ($rule["matcher_type_operator"] && $rule["matcher_type_value"]) {
                // If it is defined, check if it matches
                $ruleOperator = $rule["matcher_type_operator"];
                $ruleValue = $rule["matcher_type_value"];

                if ($ruleOperator == DEFAULT_RULES_OPERATOR_CONTAINS) {
                    if (RuleModel::contains($ruleValue, $trx["type"])) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_NOT_CONTAINS) {
                    if (!RuleModel::contains($ruleValue, $trx["type"])) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_EQUALS) {
                    if ($ruleValue == $trx["type"]) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_NOT_EQUALS) {
                    if ($ruleValue != $trx["type"]) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                }
            }

            /* account_to_id matcher */
            if ($rule["matcher_account_to_id_operator"] && $rule["matcher_account_to_id_value"]) {
                // If it is defined, check if it matches
                $ruleOperator = $rule["matcher_account_to_id_operator"];
                $ruleValue = $rule["matcher_account_to_id_value"];

                if ($ruleOperator == DEFAULT_RULES_OPERATOR_CONTAINS) {
                    if (RuleModel::contains($ruleValue, $trx["accounts_account_to_id"])) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_NOT_CONTAINS) {
                    if (!RuleModel::contains($ruleValue, $trx["accounts_account_to_id"])) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_EQUALS) {
                    if ($ruleValue == $trx["accounts_account_to_id"]) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_NOT_EQUALS) {
                    if ($ruleValue != $trx["accounts_account_to_id"]) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                }
            }

            /* account_from_id matcher */
            if ($rule["matcher_account_from_id_operator"] && $rule["matcher_account_from_id_value"]) {
                // If it is defined, check if it matches
                $ruleOperator = $rule["matcher_account_from_id_operator"];
                $ruleValue = $rule["matcher_account_from_id_value"];

                if ($ruleOperator == DEFAULT_RULES_OPERATOR_CONTAINS) {
                    if (RuleModel::contains($ruleValue, $trx["accounts_account_from_id"])) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_NOT_CONTAINS) {
                    if (!RuleModel::contains($ruleValue, $trx["accounts_account_from_id"])) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_EQUALS) {
                    if ($ruleValue == $trx["accounts_account_from_id"]) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                } else if ($ruleOperator == DEFAULT_RULES_OPERATOR_NOT_EQUALS) {
                    if ($ruleValue != $trx["accounts_account_from_id"]) {
                        $hasMatched = true;
                    } else {
                        // Fails the validation -> try to next rule
                        continue;
                    }
                }
            }

            if ($hasMatched) return $rule;
        }

        return null;
    }

    // returns true if $needle is a substring of $haystack
    private static function contains($needle, $haystack)
    {
        return strpos($haystack, $needle) !== false;
    }
}