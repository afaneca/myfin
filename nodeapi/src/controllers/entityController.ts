import joi from "joi";
import APIError from "../errorHandling/apiError.js";
import CommonsController from "./commonsController.js";
import Logger from "../utils/Logger.js";
import EntityService from "../services/entityService.js";
import { NextFunction } from "express";
import { Request, Response } from "express";

// READ
const getAllEntitiesForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const list = await EntityService.getAllEntitiesForUser(sessionData.userId);
    res.json(list);
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// CREATE
const createEntitySchema = joi.object({
  name: joi.string().trim().required()
});

// eslint-disable-next-line consistent-return
const createEntity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await createEntitySchema.validateAsync(req.body);
    await EntityService.createEntity({
      users_user_id: sessionData.userId,
      name: input.name
    });

    return res.json("Entity successfully created!");
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// DELETE
const removeEntitySchema = joi.object({
  entity_id: joi.number().required()
});

// eslint-disable-next-line consistent-return
const deleteEntity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const entity = await removeEntitySchema.validateAsync(req.body);
    await EntityService.deleteEntity(sessionData.userId, entity.entity_id);

    return res.json("Entity successfully deleted!");
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// UPDATE
const updateEntitySchema = joi.object({
  entity_id: joi.number().required(),
  new_name: joi.string().trim().required()
});

// eslint-disable-next-line consistent-return
const updateEntity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionData = await CommonsController.checkAuthSessionValidity(req);
    const input = await updateEntitySchema.validateAsync(req.body);
    await EntityService.updateEntity(sessionData.userId, input.entity_id, { name: input.new_name });

    return res.json("Entity successfully updated!");
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default { getAllEntitiesForUser, createEntity, deleteEntity, updateEntity };
