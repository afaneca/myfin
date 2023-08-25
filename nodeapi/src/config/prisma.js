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

export const setupPrismaTransaction = async (transactionBody, transactionConfig = {}) =>
  prisma.$transaction(transactionBody, transactionConfig);

export default {
  prisma,
  setupPrismaTransaction,
};
