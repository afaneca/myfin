import { PrismaClient } from '@prisma/client';

// Fix for BigInt not being serializable
// eslint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString(), 10);
  return int || this.toString();
};

const prisma = new PrismaClient();

export default prisma;
