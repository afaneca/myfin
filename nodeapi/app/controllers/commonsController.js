const APIError = require("../errorHandling/apiError");
const SessionManager = require("../utils/sessionManager")

exports.checkAuthSessionValidity = async (req, renewTrustLimit = true) => {
    try {
        const key = req.get("sessionkey")
        const username = req.get("authusername")
        const mobile = req.get("mobile") === "true"
        if (!await SessionManager.checkIfSessionKeyIsValid(key, username, renewTrustLimit, mobile)) throw APIError.notAuthorized()
    } catch (err){
        throw APIError.notAuthorized()
    }

}