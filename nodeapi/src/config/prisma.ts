import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library.js";

// Fix for BigInt not being serializable
// eslint-disable-next-line no-extend-native
// @ts-expect-error expected
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString(), 10);
  return int || this.toString();
};

export const prisma = new PrismaClient({
  /* log: ["query"] */
});

export const performDatabaseRequest = async (
  transactionBody: (prismaTx: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) => any,
  prismaClient = undefined,
  transactionConfig = {}
) => {
  if (!prismaClient) {
    return prisma.$transaction(
      async (prismaTx: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) => {
        return transactionBody(prismaTx);
      },
      transactionConfig
    );
  }
  return transactionBody(prisma);
};

export default {
  prisma,
  setupPrismaTransaction: performDatabaseRequest,
};
