import { NextFunction, Request, Response } from "express";
import Logger from "../utils/Logger.js";
import APIError from "../errorHandling/apiError.js";
import CommonsController from "./commonsController.js";
import InvestTransactionsService from "../services/investTransactionsService.js";
import joi from "joi";
import { MYFIN } from "../consts.js";

// CREATE

// READ


const getAllTransactionsForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const data = await InvestTransactionsService.getAllTransactionsForUser(sessionData.userId);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// UPDATE
const updateTransactionSchema = joi.object({
  date_timestamp: joi.number().required(),
  note: joi.string().required(),
  total_price: joi.number().required(),
  units: joi.number().required(),
  fees: joi.number().required(),
  asset_id: joi.number().required(),
  type: joi.string().allow(MYFIN.INVEST.TRX_TYPE.BUY, MYFIN.INVEST.TRX_TYPE.SELL).required(),
});
const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await updateTransactionSchema.validateAsync(req.body);
    const trxId = req.params.id;
    await InvestTransactionsService.updateTransaction(
      sessionData.userId,
      BigInt(trxId),
      input.asset_id,
      input.date_timestamp,
      input.note,
      input.total_price,
      input.units,
      input.fees,
      input.type
    );
    res.json(`Transaction successfully updated!`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// DELETE

export default {
  getAllTransactionsForUser,
  updateTransaction,
};
