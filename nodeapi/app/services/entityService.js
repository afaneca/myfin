import prisma from '../config/prisma.js';

const Entity = prisma.entities;

const getAllEntitiesForUser = async (userId) =>
  Entity.findMany({
    where: { users_user_id: userId },
  });

const createEntity = async (userId, entity) => {
  const entityDbObject = {
    ...entity,
    ...{ users_user_id: 1 },
  };
  return Entity.create({ data: entityDbObject });
};

const deleteEntity = async (userId, entityId) =>
  Entity.delete({
    where: {
      users_user_id: userId,
      entity_id: entityId,
    },
  });

const updateEntity = async (userId, entity) =>
  Entity.update({
    where: {
      users_user_id: userId,
      entity_id: entity.entity_id,
    },
    data: { name: entity.new_name },
  });

export default {
  getAllEntitiesForUser,
  createEntity,
  deleteEntity,
  updateEntity,
};
