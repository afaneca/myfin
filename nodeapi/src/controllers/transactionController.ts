import { NextFunction, Request, Response } from "express";
import APIError from "../errorHandling/apiError.js";
import Logger from "../utils/Logger.js";
import CommonsController from "./commonsController.js";
import TransactionService from "../services/transactionService.js";
import { MYFIN } from "../consts.js";
import joi from "joi";

// READ
const getAllTrxForUserSchema = joi
  .object({
    trx_limit: joi.number().default(300).min(1).max(300)
  })
  .unknown(true);

const getTransactionsForUser = async (req: Request, res: Response, next: NextFunction) => {
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

const getFilteredTrxByPageSchema = joi
  .object({
    page_size: joi.number().default(MYFIN.DEFAULT_TRANSACTIONS_FETCH_LIMIT).min(1).max(300),
    query: joi.string().empty("").default("")
  })
  .unknown(true);

const getFilteredTrxByPage = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const trx = await getFilteredTrxByPageSchema.validateAsync(req.query);
    const trxList = await TransactionService.getFilteredTransactionsByForUser(
      sessionData.userId,
      req.params.page,
      trx.page_size,
      trx.query
    );
    res.send(trxList);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// CREATE
const createTransactionStep0 = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const data = await TransactionService.createTransactionStep0(sessionData.userId);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const createTransactionSchema = joi.object({
  amount: joi.number().required(),
  type: joi.string().trim().required(),
  description: joi.string().trim().allow("").default(""),
  entity_id: joi.number().empty(""),
  account_from_id: joi.number().empty(""),
  account_to_id: joi.number().empty(""),
  category_id: joi.number().empty(""),
  date_timestamp: joi.number().required(),
  is_essential: joi.boolean().required()
});

const createTransaction = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const trx = await createTransactionSchema.validateAsync(req.body);
    await TransactionService.createTransaction(sessionData.userId, trx);
    res.json(`Transaction successfully created`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// UPDATE
const updateTransactionSchema = joi.object({
  new_amount: joi.number().required(),
  new_type: joi.string().trim().required(),
  new_description: joi.string().trim().allow("").default(""),
  new_entity_id: joi.number().empty(""),
  new_account_from_id: joi.number().empty(""),
  new_account_to_id: joi.number().empty(""),
  new_category_id: joi.number().empty(""),
  new_date_timestamp: joi.number().required(),
  new_is_essential: joi.boolean().required(),
  transaction_id: joi.number().required(),
  /* SPLIT TRX */
  is_split: joi.boolean().default(false),
  split_amount: joi.number().empty("").optional(),
  split_category: joi.number().empty("").optional(),
  split_entity: joi.number().empty("").optional(),
  split_type: joi.string().trim().empty("").optional(),
  split_account_from: joi.number().empty("").optional(),
  split_account_to: joi.number().empty("").optional(),
  split_description: joi.string().empty("").trim().optional(),
  split_is_essential: joi.boolean().empty("").default(false).optional()
});

const updateTransaction = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const trx = await updateTransactionSchema.validateAsync(req.body);
    await TransactionService.updateTransaction(sessionData.userId, trx);
    res.json(`Transaction successfully updated`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// DELETE
const deleteTransactionSchema = joi.object({
  transaction_id: joi.number().required()
});

const deleteTransaction = async (req, res, next) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const trx = await deleteTransactionSchema.validateAsync(req.body);
    await TransactionService.deleteTransaction(sessionData.userId, trx.transaction_id);
    res.json(`Transaction successfully deleted`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};
export default {
  getTransactionsForUser,
  getFilteredTrxByPage,
  createTransactionStep0,
  createTransaction,
  deleteTransaction,
  updateTransaction
};