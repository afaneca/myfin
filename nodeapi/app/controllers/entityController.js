import joi from 'joi'
import APIError from '../errorHandling/apiError.js'
import CommonsController from './commonsController.js'
import Logger from '../utils/Logger.js'
import EntityService from '../services/entityService.js'

// READ
const getAllEntitiesForUser = async (req, res, next) => {
    try {
        const sessionData = await CommonsController.checkAuthSessionValidity(req)
        const list = await EntityService.getAllEntitiesForUser(sessionData.userId)
        res.json(list)
    } catch (err) {
        Logger.addLog(err)
        next(err || APIError.internalServerError())
    }
}

// CREATE
const createEntitySchema = joi.object({
    name: joi.string().trim().required(),
})

const createEntity = async (req, res, next) => {
    try {
        const sessionData = await CommonsController.checkAuthSessionValidity(req)
        const entity = await createEntitySchema.validateAsync(req.body)
        await EntityService.createEntity(sessionData.userId, entity)

        return res.json('Entity successfully created!')
    } catch (err) {
        Logger.addLog(err)
        next(err || APIError.internalServerError())
    }
}

// DELETE
const removeEntitySchema = joi.object({
    entity_id: joi.number().required(),
})

const deleteEntity = async (req, res, next) => {
    try {
        const sessionData = await CommonsController.checkAuthSessionValidity(req)
        const entity = await removeEntitySchema.validateAsync(req.body)
        await EntityService.deleteEntity(sessionData.userId, entity.entity_id)

        return res.json('Entity successfully deleted!')
    } catch (err) {
        Logger.addLog(err)
        next(err || APIError.internalServerError())
    }
}

// UPDATE
const updateEntitySchema = joi.object({
    entity_id: joi.number().required(),
    new_name: joi.string().trim().required(),
})

const updateEntity = async (req, res, next) => {
    try {
        const sessionData = await CommonsController.checkAuthSessionValidity(req)
        const entity = await updateEntitySchema.validateAsync(req.body)
        await EntityService.updateEntity(sessionData.userId, entity)

        return res.json('Entity successfully updated!')
    } catch (err) {
        Logger.addLog(err)
        next(err || APIError.internalServerError())
    }
}

export { getAllEntitiesForUser, createEntity, deleteEntity, updateEntity }
