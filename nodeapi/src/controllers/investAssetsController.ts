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

const updateCurrentAssetValueSchema = joi.object({
  new_value: joi.number().required(),
});

const updateCurrentAssetValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await updateCurrentAssetValueSchema.validateAsync(req.body);
    const assetId = req.params.id;
    await InvestAssetService.updateCurrentAssetValue(
      sessionData.userId,
      BigInt(assetId),
      input.new_value
    );
    res.json(`Asset value successfully updated!  - ${assetId} - ${input.new_value}`);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const getAssetStatsForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const data = await InvestAssetService.getAssetStatsForUser(sessionData.userId);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const getAllAssetsSummaryForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const data = await InvestAssetService.getAllAssetsSummaryForUser(sessionData.userId);
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const deleteAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const assetId = req.params.id;

    await InvestAssetService.deleteAsset(sessionData.userId, BigInt(assetId));
    res.json('Asset successfully deleted!');
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const getAssetDetailsForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const assetId = req.params.id;

    const data = await InvestAssetService.getAssetDetailsForUser(
      sessionData.userId,
      BigInt(assetId)
    );
    res.json(data);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default {
  getAllAssetsForUser,
  createAsset,
  updateAsset,
  updateCurrentAssetValue,
  getAssetStatsForUser,
  getAllAssetsSummaryForUser,
  deleteAsset,
  getAssetDetailsForUser,
};
