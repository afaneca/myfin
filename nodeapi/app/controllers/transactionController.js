import joi from 'joi';
import APIError from '../errorHandling/apiError.js';
import Logger from '../utils/Logger.js';
import CommonsController from './commonsController.js';
import TransactionService from '../services/transactionService.js';

// READ
const getAllTrxForUserSchema = joi.object({
  trx_limit: joi.number().default(300).min(1).max(300),
});

const getTransactionsForUser = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const trx = await getAllTrxForUserSchema.validateAsync(req.query);

    const trxList = await TransactionService.getTransactionsForUser(
      sessionData.userId,
      trx.trx_limit
    );
    res.send(trxList);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export { getTransactionsForUser };
