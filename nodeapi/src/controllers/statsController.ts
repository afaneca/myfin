import { NextFunction, Request, Response } from "express";
import CommonsController from "./commonsController.js";
import Logger from "../utils/Logger.js";
import APIError from "../errorHandling/apiError.js";
import joi from "joi";
import StatsService from "../services/statsService.js";


const expensesIncomeDistributionforMonthSchema = joi.object({
  month: joi.number().required(),
  year: joi.number().required()
}).unknown(true);
const getExpensesIncomeDistributionForMonth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await expensesIncomeDistributionforMonthSchema.validateAsync(req.query);
    const data = await StatsService.getExpensesIncomeDistributionForMonth(sessionData.userId, input.month, input.year);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default {
  getExpensesIncomeDistributionForMonth
};