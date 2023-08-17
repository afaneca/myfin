import APIError from '../errorHandling/apiError.js';
import SessionManager from '../utils/sessionManager.js';
import Logger from '../utils/Logger.js';
import userService from '../services/userService.js';
import { Request } from "express";

/**
 *
 * @param req
 * @param renewTrustLimit
 * @returns {Promise<{mobile: boolean, userId: number, key, username}>}
 */

const checkAuthSessionValidity = async (req: Request, renewTrustLimit = true) => {
  const bypassSessionChecking = process.env.BYPASS_SESSION_CHECK === 'true';
  Logger.addLog(`bypass: ${process.env.BYPASS_SESSION_CHECK}`);

  const sessionkey: string = req.get('sessionkey');
  const username: string = req.get('authusername');
  const mobile: boolean = req.get('mobile') === 'true';
  const userId : bigint  = await userService.getUserIdFromUsername(username);

  if (
    !(!bypassSessionChecking && await SessionManager.checkIfSessionKeyIsValid(sessionkey, username, renewTrustLimit, mobile))
  ) {
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
