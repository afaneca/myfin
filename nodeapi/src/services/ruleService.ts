import { prisma } from "../config/prisma.js";
import Logger from "../utils/Logger.js";
import ConvertUtils from "../utils/convertUtils.js";
import AccountService from "./accountService.js";
import EntityService from "./entityService.js";
import CategoryService from "./categoryService.js";
import { Prisma } from "@prisma/client";
import { MYFIN } from "../consts.js";

const Rule = prisma.rules;

const getAllRulesForUser = async (userId: bigint) => {
  const rules = await Rule.findMany({
    where: { users_user_id: userId }
  });

  rules.forEach((rule) => {
    (rule.matcher_amount_value as any) = rule.matcher_amount_value
      ? ConvertUtils.convertBigIntegerToFloat(rule.matcher_amount_value)
      : undefined;

    (rule.assign_is_essential as any) = +rule.assign_is_essential;
  });

  const categories = await CategoryService.getAllCategoriesForUser(userId);
  const accounts = await AccountService.getAccountsForUser(userId);
  const entities = await EntityService.getAllEntitiesForUser(userId);

  return {
    rules,
    categories,
    entities,
    accounts
  };
};

const createRule = async (userId: bigint, rule: Prisma.rulesCreateInput) =>
  Rule.create({
    data: {
      users_user_id: userId,
      matcher_description_operator: rule.matcher_description_operator ?? "",
      matcher_description_value: rule.matcher_description_value ?? "",
      matcher_amount_operator: rule.matcher_amount_operator ?? "",
      matcher_amount_value: rule.matcher_amount_value ? ConvertUtils.convertFloatToBigInteger(
        rule.matcher_amount_value) : null,
      matcher_type_operator: rule.matcher_type_operator ?? "",
      matcher_type_value: rule.matcher_type_value ?? "",
      matcher_account_to_id_operator: rule.matcher_account_to_id_operator ?? "",
      matcher_account_to_id_value: rule.matcher_account_to_id_value ?? null,
      matcher_account_from_id_operator: rule.matcher_account_from_id_operator ?? "",
      matcher_account_from_id_value: rule.matcher_account_from_id_value ?? null,
      assign_category_id: rule.assign_category_id ?? null,
      assign_entity_id: rule.assign_entity_id ?? null,
      assign_account_to_id: rule.assign_account_to_id ?? null,
      assign_account_from_id: rule.assign_account_from_id ?? null,
      assign_type: rule.assign_type ?? "",
      assign_is_essential: rule.assign_is_essential ?? false
    }
  });

const updatedRule = async (rule: Prisma.rulesUpdateInput, dbClient = prisma) => {
  Logger.addStringifiedLog(rule);
  return dbClient.rules.update({
    where: {
      rule_id_users_user_id: {
        rule_id: Number(rule.rule_id),
        users_user_id: Number(rule.users_user_id)
      }
    },
    data: {
      matcher_description_operator: rule.matcher_description_operator ?? "",
      matcher_description_value: rule.matcher_description_value ?? "",
      matcher_amount_operator: rule.matcher_amount_operator,
      matcher_amount_value: rule.matcher_amount_value ? ConvertUtils.convertFloatToBigInteger(
        rule.matcher_amount_value) : null,
      matcher_type_operator: rule.matcher_type_operator ?? "",
      matcher_type_value: rule.matcher_type_value ?? "",
      matcher_account_to_id_operator: rule.matcher_account_to_id_operator ?? "",
      matcher_account_to_id_value: rule.matcher_account_to_id_value ?? null,
      matcher_account_from_id_operator: rule.matcher_account_from_id_operator ?? "",
      matcher_account_from_id_value: rule.matcher_account_from_id_value ?? null,
      assign_category_id: rule.assign_category_id ?? null,
      assign_entity_id: rule.assign_entity_id ?? null,
      assign_account_to_id: rule.assign_account_to_id ?? null,
      assign_account_from_id: rule.assign_account_from_id ?? null,
      assign_type: rule.assign_type ?? "",
      assign_is_essential: rule.assign_is_essential ?? false
    }
  });
};

const deleteRule = async (userId: bigint, ruleId: bigint) =>
  Rule.delete({
    where: {
      rule_id_users_user_id: {
        rule_id: ruleId,
        users_user_id: userId
      }
    }
  });

const getCountOfUserRules = async (userId, dbClient = prisma) => dbClient.rules.count({
  where: { users_user_id: userId }
});

type Rule = Prisma.rulesUpdateInput

enum RuleMatcherResult {
  MATCHED = 0,
  FAILED = 1,
  IGNORE = 2,
}

const checkStringMatcher = (rule: Rule, attribute: string, ruleOperator: string, ruleValue): RuleMatcherResult => {
  if (!(ruleOperator && ruleValue && attribute !== MYFIN.RULES.MATCHING.IGNORE)) {
    return RuleMatcherResult.IGNORE;
  }
  switch (ruleOperator) {
    case MYFIN.RULES.OPERATOR.CONTAINS:
      if (ruleValue.toUpperCase().includes(attribute.toUpperCase())) {
        return RuleMatcherResult.MATCHED;
      } else {
        // Fails the validation -> try the next rule
        return RuleMatcherResult.FAILED;
      }
    case MYFIN.RULES.OPERATOR.NOT_CONTAINS:
      if (!ruleValue.toUpperCase().includes(attribute.toUpperCase())) {
        return RuleMatcherResult.MATCHED;
      } else {
        // Fails the validation -> try the next rule
        return RuleMatcherResult.FAILED;
      }
    case MYFIN.RULES.OPERATOR.EQUALS:
      if (ruleValue.toUpperCase() === attribute.toUpperCase()) {
        return RuleMatcherResult.MATCHED;
      } else {
        // Fails the validation -> try the next rule
        return RuleMatcherResult.FAILED;
      }
    case MYFIN.RULES.OPERATOR.NOT_EQUALS:
      if (ruleValue.toUpperCase() !== attribute.toUpperCase()) {
        return RuleMatcherResult.MATCHED;
      } else {
        // Fails the validation -> try the next rule
        return RuleMatcherResult.FAILED;
      }
    default:
      return RuleMatcherResult.IGNORE;
  }
};
const checkNumberMatcher = (rule: Rule, attribute: number | bigint, ruleOperator: string, ruleValue): RuleMatcherResult => {
  switch (ruleOperator) {
    case MYFIN.RULES.OPERATOR.CONTAINS:
    case MYFIN.RULES.OPERATOR.EQUALS:
      if (ruleValue == ConvertUtils.convertFloatToBigInteger(attribute)) {
        return RuleMatcherResult.MATCHED;
      } else {
        // Fails the validation -> try the next rule
        return RuleMatcherResult.FAILED;
      }
    case MYFIN.RULES.OPERATOR.NOT_CONTAINS:
    case MYFIN.RULES.OPERATOR.NOT_EQUALS:
      if (ruleValue != ConvertUtils.convertFloatToBigInteger(attribute)) {
        return RuleMatcherResult.MATCHED;
      } else {
        // Fails the validation -> try the next rule
        return RuleMatcherResult.FAILED;
      }
    default:
      return RuleMatcherResult.IGNORE;
  }
};
const getRuleForTransaction = async (userId: bigint, description: string, amount: number, type: string, accountsFromId: bigint, accountsToId: bigint, selectedCategoryId: bigint | string, selectedEntityId: bigint | string, dbClient = prisma): Promise<Rule | undefined> => {
  const userRules = await dbClient.rules.findMany({
    where: { users_user_id: userId }
  });

  for (const rule of userRules) {
    let hasMatched = false;
    Logger.addLog("--------- RULE ---------");
    Logger.addStringifiedLog(rule);
    Logger.addLog("--");
    Logger.addLog(`description: ${description} | amount: ${amount} | type: ${type} | accountFromId: ${accountsFromId} | accountToId: ${accountsToId} | selectedCategoryId: ${selectedCategoryId} | selectedEntityId: ${selectedEntityId}`);
    Logger.addLog("------------------------");
    /* description matcher */
    const descriptionMatcher = checkStringMatcher(rule, description, rule.matcher_description_operator, rule.matcher_description_value);
    Logger.addLog(`Description Matcher: ${descriptionMatcher}`);
    switch (descriptionMatcher) {
      case RuleMatcherResult.MATCHED:
        hasMatched = true;
        break;
      case RuleMatcherResult.FAILED:
        // Fails the validation -> try the next rule
        continue;
      case RuleMatcherResult.IGNORE:
        break;
    }

    /* amount matcher */
    const amountMatcher = checkNumberMatcher(rule, amount, rule.matcher_amount_operator, rule.matcher_amount_value);
    Logger.addLog(`Amount Matcher: ${amountMatcher}`);
    switch (amountMatcher) {
      case RuleMatcherResult.MATCHED:
        hasMatched = true;
        break;
      case RuleMatcherResult.FAILED:
        // Fails the validation -> try the next rule
        continue;
      case RuleMatcherResult.IGNORE:
        break;
    }

    /* type matcher */
    const typeMatcher = checkStringMatcher(rule, type, rule.matcher_type_operator, rule.matcher_type_value);
    Logger.addLog(`Type Matcher: ${typeMatcher}`);
    switch (typeMatcher) {
      case RuleMatcherResult.MATCHED:
        hasMatched = true;
        break;
      case RuleMatcherResult.FAILED:
        // Fails the validation -> try the next rule
        continue;
      case RuleMatcherResult.IGNORE:
        break;
    }

    /* account_to_id matcher */
    const accountToMatcher = checkNumberMatcher(rule, accountsToId, rule.matcher_account_to_id_operator, rule.matcher_account_to_id_value);
    Logger.addLog(`Account To Matcher: ${accountToMatcher}`);
    switch (accountToMatcher) {
      case RuleMatcherResult.MATCHED:
        hasMatched = true;
        break;
      case RuleMatcherResult.FAILED:
        // Fails the validation -> try the next rule
        continue;
      case RuleMatcherResult.IGNORE:
        break;
    }

    /* account_from_id matcher */
    const accountFromMatcher = checkNumberMatcher(rule, accountsFromId, rule.matcher_account_from_id_operator, rule.matcher_account_from_id_value);
    Logger.addLog(`Account From Matcher: ${accountFromMatcher}`);
    switch (accountFromMatcher) {
      case RuleMatcherResult.MATCHED:
        hasMatched = true;
        break;
      case RuleMatcherResult.FAILED:
        // Fails the validation -> try the next rule
        continue;
      case RuleMatcherResult.IGNORE:
        break;
    }

    if (hasMatched) return rule;
  }

  return undefined;
};

export default {
  getAllRulesForUser,
  createRule,
  deleteRule,
  updatedRule,
  getCountOfUserRules,
  getRuleForTransaction
};
