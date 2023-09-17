import { NextFunction, Request, Response } from 'express';
import Logger from '../utils/Logger.js';
import APIError from '../errorHandling/apiError.js';
import CommonsController from './commonsController.js';
import InvestAssetService from '../services/investAssetService.js';
import joi from 'joi';
import { MYFIN } from '../consts.js';

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

const createAssetSchema = joi.object({
  name: joi.string().required(),
  type: joi
    .string()
    .allow(MYFIN.TRX_TYPES.EXPENSE, MYFIN.TRX_TYPES.INCOME, MYFIN.TRX_TYPES.TRANSFER)
    .required(),
  ticker: joi.string().required(),
  broker: joi.string().required(),
});

const createAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await createAssetSchema.validateAsync(req.body);
    await InvestAssetService.createAsset(sessionData.userId, input);
    res.json(`New account added!`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const updateAssetSchema = joi.object({
  name: joi.string().required(),
  type: joi
    .string()
    .allow(MYFIN.TRX_TYPES.EXPENSE, MYFIN.TRX_TYPES.INCOME, MYFIN.TRX_TYPES.TRANSFER)
    .required(),
  ticker: joi.string().optional().default(''),
  broker: joi.string().optional().default(''),
});

const updateAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await updateAssetSchema.validateAsync(req.body);
    const assetId = req.params.id;
    await InvestAssetService.updateAsset(sessionData.userId, {
      assetId: assetId,
      ...input,
    });
    res.json(`Account updated!`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default {
  getAllAssetsForUser,
  createAsset,
  updateAsset,
};
