import {PrismaClient} from '@prisma/client';

// Fix for BigInt not being serializable
// eslint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString(), 10);
  return int || this.toString();
};

export const prisma = new PrismaClient({
  /* log: ["query"] */
});

/**
 * Sets up a prisma transaction (if ***prismaClient*** is undefined) and returns the db client instance to be used
 * @param transactionConfig
 * @param prismaClient - if defined, this function will simply return it instead of creating a new db transaction
 * @returns the db instance to be used
 */
export const getPrismaTransactionInstance = async (prismaClient = undefined, transactionConfig = {}) => {
  if (!prismaClient) {
    await prisma.$transaction(async (prismaTx) => {
      return prismaTx
    }, transactionConfig);
  }
  return prismaClient;
}

export default {
  prisma,
  getPrismaTransactionInstance,
};
