import { prisma } from "../config/prisma.js";
import APIError from "../errorHandling/apiError.js";
import * as cryptoUtils from "../utils/CryptoUtils.js";
import SessionManager from "../utils/sessionManager.js";
import { Prisma } from "@prisma/client";

const User = prisma.users;

const userService = {
  createUser: async (user: Prisma.usersCreateInput) => {
    // eslint-disable-next-line no-param-reassign
    user.password = cryptoUtils.hashPassword(user.password);
    return User.create({ data: user });
  },
  attemptLogin: async (username: string, password: string, mobile: boolean) => {
    const whereCondition = { username };
    const data = await User.findUniqueOrThrow({
      where: whereCondition
    }).catch(() => {
      throw APIError.notAuthorized("User Not Found");
    });

    if (data) {
      const isValid = cryptoUtils.verifyPassword(password, data.password);
      if (isValid) {
        const newSessionData = await SessionManager.generateNewSessionKeyForUser(username, mobile);
        if (mobile) {
          // eslint-disable-next-line no-param-reassign
          data.sessionkey_mobile = newSessionData.sessionkey;
          // eslint-disable-next-line no-param-reassign
          data.trustlimit_mobile = newSessionData.trustlimit;
        } else {
          // eslint-disable-next-line no-param-reassign
          data.sessionkey = newSessionData.sessionkey;
          // eslint-disable-next-line no-param-reassign
          data.trustlimit = newSessionData.trustlimit;
        }
      } else {
        throw APIError.notAuthorized("Wrong Credentials");
      }
    } else {
      throw APIError.notAuthorized("User Not Found");
    }

    return {
      user_id: data.user_id,
      username: data.username,
      email: data.email,
      sessionkey: data.sessionkey,
      sessionkey_mobile: data.sessionkey_mobile,
      last_update_timestamp: data.last_update_timestamp
    };
  },
  getUserIdFromUsername: async (username: string): Promise<bigint> => {
    const whereCondition = { username };
    const selectCondition: Prisma.usersSelect = {
      user_id: true
    } satisfies Prisma.usersSelect;

    /* type UserPayload = Prisma.usersGetPayload<{select: typeof selectCondition}> */

    const user = await User.findUnique({
      where: whereCondition,
      select: selectCondition
    });
    return (user as { user_id: bigint }).user_id;
  },
  setupLastUpdateTimestamp: async (userId, timestamp, prismaClient = prisma) =>
    prismaClient.users.update({
      where: { user_id: userId },
      data: { last_update_timestamp: timestamp }
    }),
  changeUserPassword: async (userId: bigint, currentPassword: string, newPassword: string, mobile: boolean, dbClient = prisma) => {
    /* Check if current password is valid */
    const whereCondition = { user_id: userId };
    const data: Prisma.usersUpdateInput = await User.findUniqueOrThrow({
      where: whereCondition
    }).catch(() => {
      throw APIError.notAuthorized("User Not Found");
    });

    const isValid = cryptoUtils.verifyPassword(currentPassword, data.password);
    if (!isValid) {
      throw APIError.notAuthorized("Wrong credentials");
    }

    /* Change the password */
    const hashedPassword = cryptoUtils.hashPassword(newPassword);
    await dbClient.users.update({
      where: { user_id: userId },
      data: { password: hashedPassword }
    });

    await SessionManager.generateNewSessionKeyForUser(data.username as string, mobile);
  }
};

export default userService;
