const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const DateTimeUtils = require("./DateTimeUtils")
const APIError = require("../errorHandling/apiError");
const {where} = require("sequelize");
const {generateUuid} = require("./CryptoUtils");
const Logger = require("../utils/Logger")

const checkIfSessionKeyIsValid = async (key, username, renewTrustLimit = true, mobile = false) => {
    const userData = await _checkIfUserExists(username, key)
    if (userData) {
        // User exists, check if trustlimit has expired
        if (_checkIfTrustLimitHasExpired(mobile ? userData.trustlimit_mobile : userData.trustlimit))
            throw APIError.notAuthorized("Session is not valid.")
        if (renewTrustLimit) extendUserSession(username, mobile)
        return true
    } else {
        Logger.addLog("USER AND/OR SESSION NOT FOUND");
        throw APIError.notFound()
    }

    /* _checkIfUserExists(username).then((exists) => {
        console.log("USER EXISTS?? " + exists);
    }).catch(err => {
        console.log("ERROR: " + err);
    }) */
}

const _checkIfUserExists = (username, key) => {
    return new Promise((resolve, reject) => {
            const condition = {
                username: {
                    [Op.like]: `${username}`,
                }, [Op.or]: {
                    sessionkey: key,
                    sessionkey_mobile: key
                }
            }

            User.findOne({where: condition})
                .then(data => {
                    resolve(data/*data !== null*/);
                }).catch(err => {
                resolve(false)
            })
        }
    )
}

const _checkIfTrustLimitHasExpired = (trustlimit) => {
    const currentUnixTime = DateTimeUtils.getCurrentUnixTimestamp();
    return currentUnixTime >= trustlimit
}

const generateNewSessionKeyForUser = (username, mobile = false) => {
    const newKey = generateUuid();
    _updateUserSessionKeyValue(username, newKey, mobile)
    const newTrustlimit = extendUserSession(username, mobile)
    return {sessionkey: newKey, trustlimit: newTrustlimit}
}


/**
 * Increments the user's trustlimit value to allow for an extension of its valid session time
 * @param username
 * @param mobile
 */
const extendUserSession = (username, mobile = false) => {
    const renewTimeInSeconds = mobile ? (30 * 24 * 60 * 60 /* 30 days */) : (30 * 60 /* 30 minutes */)
    const newTrustLimit = DateTimeUtils.getCurrentUnixTimestamp() + renewTimeInSeconds
    _updateUserTrustlimitValue(username, newTrustLimit, mobile)
    return newTrustLimit
}

const _updateUserSessionKeyValue = (username, newSessionKey, mobile = false) => {
    const sessionKeyAttr = mobile ? "sessionkey_mobile" : "sessionkey"
    if (!mobile) {
        User.update({[sessionKeyAttr]: newSessionKey},
            {
                where: {username}
            })
    }
}

const _updateUserTrustlimitValue = (username, newTrustLimit, mobile = false) => {
    const trustLimitAttr = mobile ? "trustlimit_mobile" : "trustlimit"
    if (!mobile) {
        User.update({[trustLimitAttr]: newTrustLimit},
            {
                where: {username}
            })
    }
}

module.exports = {checkIfSessionKeyIsValid, generateNewSessionKeyForUser};