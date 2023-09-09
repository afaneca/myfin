import { NextFunction, Request, Response } from 'express';
import CommonsController from './commonsController.js';
import Logger from '../utils/Logger.js';
import APIError from '../errorHandling/apiError.js';
import joi from 'joi';
import StatsService from '../services/statsService.js';

const expensesIncomeDistributionforMonthSchema = joi
  .object({
    month: joi.number().required(),
    year: joi.number().required(),
  })
  .unknown(true);
const getExpensesIncomeDistributionForMonth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await expensesIncomeDistributionforMonthSchema.validateAsync(req.query);
    const data = await StatsService.getExpensesIncomeDistributionForMonth(
      sessionData.userId,
      input.month,
      input.year
    );
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const getUserCounterStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const data = await StatsService.getUserCounterStats(sessionData.userId);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const getMonthlyPatrimonyProjections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const data = await StatsService.getMonthlyPatrimonyProjections(sessionData.userId);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const getCategoryExpensesEvoSchema = joi
  .object({
    cat_id: joi.number(),
    ent_id: joi.number(),
  })
  .xor('cat_id', 'ent_id')
  .unknown(true);

const getCategoryEntityExpensesEvolution = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await getCategoryExpensesEvoSchema.validateAsync(req.query);
    let data = undefined;
    if (input.cat_id) {
      data = await StatsService.getCategoryExpensesEvolution(sessionData.userId, input.cat_id);
    } else {
      data = await StatsService.getEntityExpensesEvolution(sessionData.userId, input.ent_id);
    }
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default {
  getExpensesIncomeDistributionForMonth,
  getUserCounterStats,
  getMonthlyPatrimonyProjections,
  getCategoryEntityExpensesEvolution,
};