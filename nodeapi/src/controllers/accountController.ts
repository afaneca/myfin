import joi from 'joi';
import APIError from '../errorHandling/apiError.js';
import Logger from '../utils/Logger.js';
import CommonsController from './commonsController.js';
import AccountService from '../services/accountService.js';

// CREATE
const createAccountSchema = joi.object({
  name: joi.string().trim().required(),
  type: joi
    .string()
    .valid('CHEAC', 'SAVAC', 'INVAC', 'CREAC', 'OTHAC', 'WALLET', 'MEALAC')
    .trim()
    .required(),
  description: joi.string().allow('').default(''),
  status: joi.string().valid('Ativa', 'Inativa').trim().required(),
  exclude_from_budgets: joi.boolean().required(),
  current_balance: joi.number().required(),
  color_gradient: joi.string().trim().optional(),
});

const createAccount = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const account = await createAccountSchema.validateAsync(req.body);
    await AccountService.createAccount(account, sessionData.userId).then(() => {
      res.json(`Account successfully created`);
    });
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// READ
const getAllAccountsForUser = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const accsList = await AccountService.getAccountsForUserWithAmounts(sessionData.userId, false);
    res.send(accsList);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// DELETE
const deleteAccountSchema = joi.object({
  account_id: joi.number().required(),
});

const deleteAccount = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const account = await deleteAccountSchema.validateAsync(req.body);
    const doesAccountBelongToUser = await AccountService.doesAccountBelongToUser(
      sessionData.userId,
      account.account_id
    );
    if (!doesAccountBelongToUser) {
      throw APIError.notAuthorized();
    }

    await AccountService.deleteAccount(account.account_id);
    res.json('Account successfully deleted!');
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// UPDATE
const updateAccountSchema = joi.object({
  account_id: joi.number().required(),
  new_name: joi.string().trim().required(),
  new_type: joi
    .string()
    .valid('CHEAC', 'SAVAC', 'INVAC', 'CREAC', 'OTHAC', 'WALLET', 'MEALAC')
    .trim()
    .required(),
  new_description: joi.string().allow('').default(''),
  new_status: joi.string().valid('Ativa', 'Inativa').trim().required(),
  exclude_from_budgets: joi.boolean().required(),
  current_balance: joi.number().required(),
  color_gradient: joi.string().trim().optional(),
});

const updateAccount = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const account = await updateAccountSchema.validateAsync(req.body);

    if (!(await AccountService.doesAccountBelongToUser(sessionData.userId, account.account_id))) {
      throw APIError.notAuthorized();
    }

    await AccountService.updateAccount(account, sessionData.userId).then(() => {
      res.json(`Account successfully updated`);
    });
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default {
  createAccount,
  getAllAccountsForUser,
  deleteAccount,
  updateAccount,
};
