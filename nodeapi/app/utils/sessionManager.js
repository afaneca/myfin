import db from '../models/index.js';
import DateTimeUtils from './DateTimeUtils.js';
import APIError from '../errorHandling/apiError.js';
import { generateUuid } from './CryptoUtils.js';
import Logger from './Logger.js';

const User = db.users;
const { Op } = db.Sequelize;

const updateUserSessionKeyValue = (username, newSessionKey, mobile = false) => {
  const sessionKeyAttr = mobile ? 'sessionkey_mobile' : 'sessionkey';
  if (!mobile) {
    User.update({ [sessionKeyAttr]: newSessionKey },
      {
        where: { username },
      });
  }
};

const updateUserTrustlimitValue = (username, newTrustLimit, mobile = false) => {
  const trustLimitAttr = mobile ? 'trustlimit_mobile' : 'trustlimit';
  if (!mobile) {
    User.update({ [trustLimitAttr]: newTrustLimit },
      {
        where: { username },
      });
  }
};

/**
 * Increments the user's trustlimit value to allow for an extension of its valid session time
 * @param username
 * @param mobile
 */
const extendUserSession = (username, mobile = false) => {
  const renewTimeInSeconds = mobile ? (30 * 24 * 60 * 60 /* 30 days */)
    : (30 * 60 /* 30 minutes */);
  const newTrustLimit = DateTimeUtils.getCurrentUnixTimestamp() + renewTimeInSeconds;
  updateUserTrustlimitValue(username, newTrustLimit, mobile);
  return newTrustLimit;
};

const checkIfUserExists = (username, key) => new Promise((resolve /* ,reject */) => {
  const condition = {
    username: {
      [Op.like]: `${username}`,
    },
    [Op.or]: {
      sessionkey: key,
      sessionkey_mobile: key,
    },
  };

  User.findOne({ where: condition })
    .then((data) => {
      resolve(data/* data !== null */);
    }).catch((/* err */) => {
      resolve(false);
    });
});

const checkIfTrustLimitHasExpired = (trustlimit) => {
  const currentUnixTime = DateTimeUtils.getCurrentUnixTimestamp();
  return currentUnixTime >= trustlimit;
};

const generateNewSessionKeyForUser = (username, mobile = false) => {
  const newKey = generateUuid();
  updateUserSessionKeyValue(username, newKey, mobile);
  const newTrustlimit = extendUserSession(username, mobile);
  return { sessionkey: newKey, trustlimit: newTrustlimit };
};

const checkIfSessionKeyIsValid = async (key, username, renewTrustLimit = true, mobile = false) => {
  const userData = await checkIfUserExists(username, key);
  if (userData) {
    // User exists, check if trustlimit has expired
    if (checkIfTrustLimitHasExpired(mobile ? userData.trustlimit_mobile : userData.trustlimit)) {
      throw APIError.notAuthorized('Session is not valid.');
    }
    if (renewTrustLimit) extendUserSession(username, mobile);
    return true;
  }
  Logger.addLog('USER AND/OR SESSION NOT FOUND');
  throw APIError.notFound();

  /* _checkIfUserExists(username).then((exists) => {
        console.log("USER EXISTS?? " + exists);
    }).catch(err => {
        console.log("ERROR: " + err);
    }) */
};

export default { checkIfSessionKeyIsValid, generateNewSessionKeyForUser };
