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

export const performDatabaseRequest = async (
  transactionBody,
  prismaClient = undefined,
  transactionConfig = {}
) => {
  if (!prismaClient) {
    return prisma.$transaction(async (prismaTx) => {
      return transactionBody(prismaTx);
    }, transactionConfig);
  }
  return transactionBody(prisma);
};

export default {
  prisma,
  setupPrismaTransaction: performDatabaseRequest,
};
