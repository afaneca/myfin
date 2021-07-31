const APIError = require("../errorHandling/apiError");
const SessionManager = require("../utils/sessionManager")
const Logger = require("../utils/Logger")
/**
 *
 * @param req
 * @param renewTrustLimit
 * @returns {Promise<boolean>}
 */
exports.checkAuthSessionValidity = async (req, renewTrustLimit = true) => {
    try {
        const bypassSessionChecking = process.env.BYPASS_SESSION_CHECK === "true"
        Logger.addLog("bypass: " + process.env.BYPASS_SESSION_CHECK)
        if (bypassSessionChecking) return true

        const key = req.get("sessionkey")
        const username = req.get("authusername")
        const mobile = req.get("mobile") === "true"
        if (!await SessionManager.checkIfSessionKeyIsValid(key, username, renewTrustLimit, mobile)) throw APIError.notAuthorized()
    } catch (err) {
        throw APIError.notAuthorized()
    }

}