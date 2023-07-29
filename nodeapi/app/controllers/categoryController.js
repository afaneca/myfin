// CREATE
import joi from 'joi';
import { MYFIN } from '../consts.js';
import CommonsController from './commonsController.js';
import Logger from '../utils/Logger.js';
import APIError from '../errorHandling/apiError.js';
import CategoryService from '../services/categoryService.js';

// READ
const getAllCategoriesForUser = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const list = await CategoryService.getAllCategoriesForUser(sessionData.userId);
    res.json(list);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const createCategorySchema = joi.object({
  name: joi.string().trim().required(),
  description: joi.string().trim().required(),
  color_gradient: joi.string().trim().required(),
  status: joi.string().valid(MYFIN.CATEGORY_STATUS.ACTIVE, MYFIN.CATEGORY_STATUS.INACTIVE),
  exclude_from_budgets: joi.boolean().truthy(1, '1').falsy(0, '0').required(),
});

// eslint-disable-next-line consistent-return
const createCategory = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const category = await createCategorySchema.validateAsync(req.body);
    await CategoryService.createCategory(sessionData.userId, category);

    return res.json('Category successfully created!');
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// UPDATE
const updateCategorySchema = joi.object({
  category_id: joi.number().required(),
  new_name: joi.string().trim().required(),
  new_description: joi.string().trim().required(),
  new_color_gradient: joi.string().trim().required(),
  new_status: joi.string().valid(MYFIN.CATEGORY_STATUS.ACTIVE, MYFIN.CATEGORY_STATUS.INACTIVE),
  new_exclude_from_budgets: joi.boolean().truthy(1, '1').falsy(0, '0').required(),
});

// eslint-disable-next-line consistent-return
const updateCategory = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const category = await updateCategorySchema.validateAsync(req.body);
    await CategoryService.updateCategory(sessionData.userId, category);

    return res.json('Category successfully updated!');
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// DELETE
const deleteCategorySchema = joi.object({
  category_id: joi.number().required(),
});

// eslint-disable-next-line consistent-return
const deleteCategory = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const category = await deleteCategorySchema.validateAsync(req.body);
    await CategoryService.deleteCategory(sessionData.userId, category.category_id);

    return res.json('Category successfully deleted!');
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default {
  getAllCategoriesForUser,
  createCategory,
  updateCategory,
  deleteCategory,
};
