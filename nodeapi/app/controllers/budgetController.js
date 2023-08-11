import joi from 'joi';
import Logger from '../utils/Logger.js';
import APIError from '../errorHandling/apiError.js';
import CommonsController from './commonsController.js';
import BudgetService from '../services/budgetService.js';
import { MYFIN } from '../consts.js';

// READ
const getAllBudgetsForUserSchema = joi.object({
  status: joi.string().allow('C', 'O').empty('').optional(),
});

const getAllBudgetsForUser = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = getAllBudgetsForUserSchema.validateAsync(req.query);
    const data = await BudgetService.getAllBudgetsForUser(sessionData.userId, input.status);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const getFilteredBudgetsForUserByPageSchema = joi
  .object({
    page_size: joi
      .number()
      .default(MYFIN.DEFAULT_TRANSACTIONS_FETCH_LIMIT)
      .min(1)
      .max(MYFIN.DEFAULT_TRANSACTIONS_FETCH_LIMIT)
      .optional(),
    query: joi.string().empty('').default('').optional(),
    status: joi.string().allow('C', 'O').empty('').optional(),
  })
  .unknown(true);

const getFilteredBudgetsForUserByPage = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await getFilteredBudgetsForUserByPageSchema.validateAsync(req.query);
    const data = await BudgetService.getFilteredBudgetsForUserByPage(
      sessionData.userId,
      req.params.page || 0,
      input.page_size,
      input.query,
      input.status
    );
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const getBudgetSchema = joi.object({
  id: joi.number().required(),
});
const getBudget = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await getBudgetSchema.validateAsync(req.params);
    const data = await BudgetService.getBudget(sessionData.userId, input.id);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// CREATE
/**
 * Preliminary step for the add budget flow
 * Gives frontend the data it needs to display in the UI
 * (categories list)
 */
const addBudgetStep0 = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const data = await BudgetService.getCategoryDataForNewBudget(sessionData.userId);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const createBudgetSchema = joi
  .object({
    month: joi.number().min(1).max(12).required(),
    year: joi.number().min(1970).required(),
    observations: joi.string().required(),
    cat_values_arr: joi.any().required(),
  })
  .unknown(true);

const createBudget = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await createBudgetSchema.validateAsync(req.body);
    const budgetId = await BudgetService.createBudget(
      sessionData.userId,
      input.month,
      input.year,
      JSON.parse(req.body.cat_values_arr),
      input.observations
    );
    res.json({
      budget_id: budgetId,
    });
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// UPDATE
const updateBudgetSchema = joi
  .object({
    budget_id: joi.number().min(1).required(),
    month: joi.number().min(1).max(12).required(),
    year: joi.number().min(1970).required(),
    observations: joi.string().required(),
    cat_values_arr: joi.any().required(),
  })
  .unknown(true);

const updateBudget = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await updateBudgetSchema.validateAsync(req.body);
    await BudgetService.updateBudget(
      sessionData.userId,
      input.budget_id,
      input.month,
      input.year,
      JSON.parse(req.body.cat_values_arr),
      input.observations
    );
    res.json(`Budget was successfully updated.`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const changeBudgetStatusSchema = joi.object({
  budget_id: joi.number().min(1).required(),
  is_open: joi.boolean().required(),
});
const changeBudgetStatus = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await changeBudgetStatusSchema.validateAsync(req.body);
    await BudgetService.changeBudgetStatus(sessionData.userId, input.budget_id, input.is_open);
    res.json(`Budget was successfully updated.`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// REMOVE
const removeBudgetSchema = joi.object({
  budget_id: joi.number().min(1).required(),
});
const removeBudget = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await removeBudgetSchema.validateAsync(req.body);
    await BudgetService.removeBudget(sessionData.userId, input.budget_id);
    res.json(`Budget was successfully removed.`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default {
  getAllBudgetsForUser,
  getFilteredBudgetsForUserByPage,
  addBudgetStep0,
  createBudget,
  getBudget,
  updateBudget,
  changeBudgetStatus,
  removeBudget,
};
