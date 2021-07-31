import db from '../models/index.js';
import APIError from '../errorHandling/apiError.js';
import * as cryptoUtils from '../utils/CryptoUtils.js';
import SessionManager from '../utils/sessionManager.js';
import Logger from '../utils/Logger.js';

const User = db.users;
const { Op } = db.Sequelize;

const userService = {
  createUser: async (user) => {
    // eslint-disable-next-line no-param-reassign
    user.password = cryptoUtils.hashPassword(user.password);
    return User.create(user)
      .then((data) => data)
      .catch((err) => {
        throw err;
      });
  },
  attemptLogin: async (username, password, mobile) => {
    const condition = { username: { [Op.like]: `${username}` } };
    return User.findOne({ where: condition })
      .then((data) => {
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
        return data;
      })
      .catch((err) => {
        throw err;
      });
  },
  getUserIdFromUsername: async (username) => {
    const condition = { username: { [Op.like]: `${username}` } };
    return User.findOne({
      where: condition,
      attributes: ['user_id'],
    })
      .then((data) => data.user_id);
  },
};

export default userService;
