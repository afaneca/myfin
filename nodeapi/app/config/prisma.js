import {PrismaClient} from '@prisma/client';

// Fix for BigInt not being serializable
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  const prisma = new PrismaClient();

export default prisma;