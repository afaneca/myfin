import joi from "joi";
import APIError from "../errorHandling/apiError.js";
import Logger from "../utils/Logger.js";
import CommonsController from "./commonsController.js";
import RuleService from "../services/ruleService.js";

// READ
const getAllRulesForUser = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const data = await RuleService.getAllRulesForUser(sessionData.userId);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// CREATE
const createRuleSchema = joi.object({
  matcher_description_operator: joi.string().trim().empty("").optional(),
  matcher_description_value: joi.string().trim().empty("").optional(),
  matcher_amount_operator: joi.string().trim().empty("").optional(),
  matcher_amount_value: joi.string().trim().empty("").optional(),
  matcher_type_operator: joi.string().trim().empty("").optional(),
  matcher_type_value: joi.string().trim().empty("").optional(),
  matcher_account_to_id_operator: joi.string().trim().empty("").optional(),
  matcher_account_to_id_value: joi.number().empty("").optional(),
  matcher_account_from_id_operator: joi.string().trim().empty("").optional(),
  matcher_account_from_id_value: joi.number().empty("").optional(),
  assign_category_id: joi.number().empty("").optional(),
  assign_entity_id: joi.number().empty("").optional(),
  assign_account_to_id: joi.number().empty("").optional(),
  assign_account_from_id: joi.number().empty("").optional(),
  assign_type: joi.string().trim().empty("").empty("").optional(),
  assign_essential: joi.boolean().truthy(1, "1").falsy(0, "0").optional()
});

const createRule = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const rule = await createRuleSchema.validateAsync(req.body);
    await RuleService.createRule(sessionData.userId, { ...rule, assign_is_essential: rule.assign_essential });
    res.json(`Rule ${rule.rule_id} successsfully created`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// DELETE
const deleteRuleSchema = joi.object({
  rule_id: joi.number().required()
});

const deleteRule = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const rule = await deleteRuleSchema.validateAsync(req.body);
    await RuleService.deleteRule(sessionData.userId, rule.rule_id);
    res.json(`Rule ${rule.rule_id} successsfully deleted`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// UPDATE
const updateRuleSchema = joi.object({
  matcher_description_operator: joi.string().trim().empty("").optional(),
  matcher_description_value: joi.string().trim().empty("").optional(),
  matcher_amount_operator: joi.string().trim().empty("").optional(),
  matcher_amount_value: joi.string().trim().empty("").optional(),
  matcher_type_operator: joi.string().trim().empty("").optional(),
  matcher_type_value: joi.string().trim().empty("").optional(),
  matcher_account_to_id_operator: joi.string().trim().empty("").optional(),
  matcher_account_to_id_value: joi.number().empty("").optional(),
  matcher_account_from_id_operator: joi.string().trim().empty("").optional(),
  matcher_account_from_id_value: joi.number().empty("").optional(),
  assign_category_id: joi.number().empty("").optional(),
  assign_entity_id: joi.number().empty("").optional(),
  assign_account_to_id: joi.number().empty("").optional(),
  assign_account_from_id: joi.number().empty("").optional(),
  assign_type: joi.string().trim().empty("").empty("").optional(),
  assign_essential: joi.boolean().empty("").truthy(1, "1").falsy(0, "0").optional(),
  rule_id: joi.number().required()
});

const updateRule = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const rule = await updateRuleSchema.validateAsync(req.body);
    await RuleService.updatedRule({ ...rule, assign_is_essential: rule.assign_essential, users_user_id: sessionData.userId });
    res.json(`Rule ${rule.rule_id} successsfully updated`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default {
  getAllRulesForUser,
  createRule,
  deleteRule,
  updateRule
};
