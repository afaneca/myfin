import prisma from '../config/prisma.js'

const Entity = prisma.entities

const getAllEntitiesForUser = async (userId) => {
    return await Entity.findMany({
        where: { users_user_id: userId },
    })
}

const createEntity = async (userId, entity) => {
    entity.users_user_id = userId
    return await Entity.create({ data: entity })
}

const deleteEntity = async (userId, entityId) => {
    return await Entity.delete({ where: { users_user_id: userId, entity_id: entityId } })
}

const updateEntity = async (userId, entity) => {
    return await Entity.update({
        where: { users_user_id: userId, entity_id: entity.entity_id },
        data: { name: entity.new_name },
    })
}

export default { getAllEntitiesForUser, createEntity, deleteEntity, updateEntity }
