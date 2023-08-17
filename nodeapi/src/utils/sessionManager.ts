import { prisma } from "../config/prisma.js";
import DateTimeUtils from "./DateTimeUtils.js";
import APIError from "../errorHandling/apiError.js";
import { generateUuid } from "./CryptoUtils.js";
import Logger from "./Logger.js";

const User = prisma.users;

const updateUserSessionKeyValue = async (username: string, newSessionKey: string, mobile = false) => {
  const sessionKeyAttr = mobile ? 'sessionkey_mobile' : 'sessionkey';
  if (!mobile) {
    await User.update({
      where: { username },
      data: { [sessionKeyAttr]: newSessionKey },
    });
  }
};

const updateUserTrustlimitValue = async (username: string, newTrustLimit: number, mobile = false) => {
  const trustLimitAttr = mobile ? 'trustlimit_mobile' : 'trustlimit';
  if (!mobile) {
    await User.update({
      where: { username },
      data: { [trustLimitAttr]: newTrustLimit },
    });
  }
};

/**
 * Increments the user's trustlimit value to allow for an extension of its valid session time
 * @param username
 * @param mobile
 */
const extendUserSession = (username: string, mobile = false) => {
  const renewTimeInSeconds = mobile ? 30 * 24 * 60 * 60 /* 30 days */ : 30 * 60; /* 30 minutes */
  const newTrustLimit = DateTimeUtils.getCurrentUnixTimestamp() + renewTimeInSeconds;
  updateUserTrustlimitValue(username, newTrustLimit, mobile);
  return newTrustLimit;
};

const checkIfUserExists = async (username: string, key: string) => {
  const whereCondition = {
    username: username,
    OR: [{ sessionkey: key }, { sessionkey_mobile: key }],
  };

  return User.findUnique({
    where: whereCondition,
  }).catch(() => null);
};

const checkIfTrustLimitHasExpired = (trustlimit: number) => {
  const currentUnixTime = DateTimeUtils.getCurrentUnixTimestamp();
  return currentUnixTime >= trustlimit;
};

const generateNewSessionKeyForUser = async (username: string, mobile = false) => {
  const newKey = generateUuid();
  await updateUserSessionKeyValue(username, newKey, mobile);
  const newTrustlimit = extendUserSession(username, mobile);
  return { sessionkey: newKey, trustlimit: newTrustlimit };
};

const checkIfSessionKeyIsValid = async (key: string, username: string, renewTrustLimit = true, mobile = false) => {
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
  throw APIError.notAuthorized();
};

export default { checkIfSessionKeyIsValid, generateNewSessionKeyForUser };
