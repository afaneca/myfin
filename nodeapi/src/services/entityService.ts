import { prisma } from "../config/prisma.js";
import { Prisma } from "@prisma/client";

const Entity = prisma.entities;

const getAllEntitiesForUser = async (userId: bigint) =>
  Entity.findMany({
    where: { users_user_id: userId }
  });

const createEntity = async (entity: Prisma.entitiesCreateInput) => {
  return Entity.create({ data: entity });
};

const deleteEntity = async (userId: bigint, entityId: number) =>
  Entity.delete({
    where: {
      users_user_id: userId,
      entity_id: entityId
    }
  });

const updateEntity = async (userId: bigint, entityId: number, entity: Prisma.entitiesUpdateInput) =>
  Entity.update({
    where: {
      users_user_id: userId,
      entity_id: entityId
    },
    data: { name: entity.name }
  });

const getCountOfUserEntities = async (userId, dbClient = prisma) => dbClient.entities.count({
  where: { users_user_id: userId }
});

export default {
  getAllEntitiesForUser,
  createEntity,
  deleteEntity,
  updateEntity,
  getCountOfUserEntities
};
