import APIError from '../errorHandling/apiError.js';
import SessionManager from '../utils/sessionManager.js';
import Logger from '../utils/Logger.js';
import userService from '../services/userService.js';

/**
 *
 * @param req
 * @param renewTrustLimit
 * @returns {Promise<{mobile: boolean, userId: number, key, username}>}
 */

const checkAuthSessionValidity = async (req, renewTrustLimit = true) => {
  const bypassSessionChecking = process.env.BYPASS_SESSION_CHECK === 'true';
  Logger.addLog(`bypass: ${process.env.BYPASS_SESSION_CHECK}`);
  if (bypassSessionChecking) return true;

  const sessionkey = req.get('sessionkey');
  const username = req.get('authusername');
  const mobile = req.get('mobile') === 'true';
  const userId = await userService.getUserIdFromUsername(username);

  if (!await SessionManager.checkIfSessionKeyIsValid(sessionkey, username,
    renewTrustLimit, mobile)) {
    throw APIError.notAuthorized();
  }
  return {
    sessionkey,
    username,
    mobile,
    userId,
  };
};

export default { checkAuthSessionValidity };
