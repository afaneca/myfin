import prisma from '../config/prisma.js';
import APIError from '../errorHandling/apiError.js';
import * as cryptoUtils from '../utils/CryptoUtils.js';
import SessionManager from '../utils/sessionManager.js';

const User = prisma.users;

const userService = {
  createUser: async (user) => {
    // eslint-disable-next-line no-param-reassign
    user.password = cryptoUtils.hashPassword(user.password);
    const addedUser = await User.create({ data: user })
    return addedUser
  },
  attemptLogin: async (username, password, mobile) => {
    const whereCondition = { username };
    const data = await User.findUniqueOrThrow({
      where: whereCondition
    }).catch(err => {
      throw APIError.notAuthorized('User Not Found');
    })

    if (data) {
      const isValid = cryptoUtils.verifyPassword(password, data.password);
      if (isValid) {
        const newSessionData = SessionManager.generateNewSessionKeyForUser(username,
          mobile);
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
        throw APIError.notAuthorized('Wrong Credentials');
      }
    } else {
      throw APIError.notAuthorized('User Not Found');
    }

    return { user_id: data.user_id, username: data.username, email: data.email, sessionkey: data.sessionkey, sessionkey_mobile: data.sessionkey_mobile, last_update_timestamp: data.last_update_timestamp };
  },
  getUserIdFromUsername: async (username) => {
    const whereCondition = { username };
    const user = await User.findUnique({
      where: whereCondition,
      select: {
        user_id: true
      }
    })
    return user.user_id
  },
};

export default userService;
