// CREATE

// READ
import { NextFunction, Request, Response } from "express";
import Logger from "../utils/Logger.js";
import APIError from "../errorHandling/apiError.js";
import CommonsController from "./commonsController.js";
import InvestTransactionsService from "../services/investTransactionsService.js";

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

// DELETE

export default {
  getAllTransactionsForUser,
};
