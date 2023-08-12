import { prisma } from '../config/prisma.js';
import Logger from '../utils/Logger.js';
import ConvertUtils from '../utils/convertUtils.js';
import AccountService from './accountService.js';
import EntityService from './entityService.js';
import CategoryService from './categoryService.js';

const Rule = prisma.rules;

const getAllRulesForUser = async (userId) => {
  const rules = await Rule.findMany({
    where: { users_user_id: userId },
  });

  rules.forEach((rule) => {
    rule.matcher_amount_value = rule.matcher_amount_value
      ? ConvertUtils.convertBigIntegerToFloat(rule.matcher_amount_value)
      : undefined;

    rule.assign_is_essential = rule.assign_is_essential ? 1 : 0;
  });

  const categories = await CategoryService.getAllCategoriesForUser(userId);
  const accounts = await AccountService.getAccountsForUser(userId);
  const entities = await EntityService.getAllEntitiesForUser(userId);

  return {
    rules,
    categories,
    entities,
    accounts,
  };
};

const createRule = async (userId, rule) =>
  Rule.create({
    data: {
      users_user_id: userId,
      matcher_description_operator: rule.matcher_description_operator,
      matcher_description_value: rule.matcher_description_value,
      matcher_amount_operator: rule.matcher_amount_operator,
      matcher_amount_value: ConvertUtils.convertFloatToBigInteger(
        rule.matcher_amount_value),
      matcher_type_operator: rule.matcher_type_operator,
      matcher_type_value: rule.matcher_type_value,
      matcher_account_to_id_operator: rule.matcher_account_to_id_operator,
      matcher_account_to_id_value: rule.matcher_account_to_id_value,
      matcher_account_from_id_operator: rule.matcher_account_from_id_operator,
      matcher_account_from_id_value: rule.matcher_account_from_id_value,
      assign_category_id: rule.assign_category_id,
      assign_entity_id: rule.assign_entity_id,
      assign_account_to_id: rule.assign_account_to_id,
      assign_account_from_id: rule.assign_account_from_id,
      assign_type: rule.type,
      assign_is_essential: rule.assign_essential,
    },
  });

const updatedRule = async (userId, rule) => {
  Logger.addStringifiedLog(rule);
  return Rule.update({
    where: {
      rule_id_users_user_id: {
        rule_id: rule.rule_id,
        users_user_id: userId,
      },
    },
    data: {
      matcher_description_operator: rule.matcher_description_operator,
      matcher_description_value: rule.matcher_description_value,
      matcher_amount_operator: rule.matcher_amount_operator,
      matcher_amount_value: ConvertUtils.convertFloatToBigInteger(
        rule.matcher_amount_value),
      matcher_type_operator: rule.matcher_type_operator,
      matcher_type_value: rule.matcher_type_value,
      matcher_account_to_id_operator: rule.matcher_account_to_id_operator,
      matcher_account_to_id_value: rule.matcher_account_to_id_value,
      matcher_account_from_id_operator: rule.matcher_account_from_id_operator,
      matcher_account_from_id_value: rule.matcher_account_from_id_value,
      assign_category_id: rule.assign_category_id,
      assign_entity_id: rule.assign_entity_id,
      assign_account_to_id: rule.assign_account_to_id,
      assign_account_from_id: rule.assign_account_from_id,
      assign_type: rule.type,
      assign_is_essential: rule.assign_essential,
    },
  });
};

const deleteRule = async (userId, ruleId) =>
  Rule.delete({
    where: {
      rule_id_users_user_id: {
        rule_id: ruleId,
        users_user_id: userId,
      },
    },
  });

export default {
  getAllRulesForUser,
  createRule,
  deleteRule,
  updatedRule,
};
