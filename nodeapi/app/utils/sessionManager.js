const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const DateTimeUtils = require("./DateTimeUtils")
const APIError = require("../errorHandling/apiError");
const {where} = require("sequelize");
const {generateUuid} = require("./CryptoUtils");

const checkIfSessionKeyIsValid = async (key, username, renewTrustLimit = true, mobile = false) => {
    let renewTime = '+30 minutes';
    if (mobile) renewTime = '+1 month';

    const userData = await _checkIfUserExists(username, key)
    if (userData) {
        // User exists, check if trustimit has expired
        if (_checkIfTrustLimitHasExpired(mobile ? userData.trustlimit_mobile : userData.trustlimit))
            throw APIError.notAuthorized("Session is not valid.")
        return true
        /*console.log("USER EXISTS.");
        console.log("Current trustlimit: " + userData.trustlimit)
        console.log("New trustlimit: " + userData.trustlimit + renewTime)*/
    } else {
        console.log("USER AND/OR SESSION NOT FOUND");
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
    return newKey
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

module.exports = {checkIfSessionKeyIsValid, generateNewSessionKeyForUser};