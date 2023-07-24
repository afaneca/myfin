import joi from 'joi';
import APIError from '../errorHandling/apiError.js';
import Logger from '../utils/Logger.js';
import CommonsController from './commonsController.js';
import TransactionService from '../services/transactionService.js';

const getTransactionsForUser = async (req, res, next) => {
  /* try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const trxLimit = req.query.trx_limit;
    const trxList = await TransactionService.getTransactionsForUser(sessionData.userId, trxLimit);
    res.send(trxList);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  } */
};

export {
  getTransactionsForUser,
};
