import joi from 'joi';
import APIError from '../errorHandling/apiError.js';
import Logger from '../utils/Logger.js';
import CommonsController from './commonsController.js';
import AccountService from '../services/accountService.js';

// CREATE
const createAccountSchema = joi.object({
  name: joi.string()
    .trim()
    .required(),
  type: joi.string()
    .valid('CHEAC', 'SAVAC', 'INVAC', 'CREAC', 'OTHAC', 'WALLET', 'MEALAC')
    .trim()
    .required(),
  description: joi.string()
    .trim()
    .required(),
  status: joi.string()
    .valid('Ativa', 'Inativa')
    .trim()
    .required(),
  exclude_from_budgets: joi.boolean()
    .required(),
  current_balance: joi.number()
    .required(),
  color_gradient: joi.string()
    .trim()
    .optional(),
});

const createAccount = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    Logger.addStringifiedLog(sessionData);
    const account = await createAccountSchema.validateAsync(req.body);
    await AccountService.createAccount(account, sessionData.userId)
      .then((data) => {
        res.send(`Account ${data.account_id} successfully created`);
      });
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export {
  createAccount,
};
