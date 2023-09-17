import { NextFunction, Request, Response } from 'express';
import Logger from '../utils/Logger.js';
import APIError from '../errorHandling/apiError.js';
import CommonsController from './commonsController.js';
import InvestAssetService from '../services/investAssetService.js';

const getAllAssetsForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const data = await InvestAssetService.getAllAssetsForUser(sessionData.userId);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default {
  getAllAssetsForUser,
};
