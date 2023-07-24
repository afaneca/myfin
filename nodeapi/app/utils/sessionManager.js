import prisma from '../config/prisma.js'
import DateTimeUtils from './DateTimeUtils.js'
import APIError from '../errorHandling/apiError.js'
import { generateUuid } from './CryptoUtils.js'
import Logger from './Logger.js'

const User = prisma.users

const updateUserSessionKeyValue = async (username, newSessionKey, mobile = false) => {
    const sessionKeyAttr = mobile ? 'sessionkey_mobile' : 'sessionkey'
    if (!mobile) {
        await User.update({
            where: { username },
            data: { [sessionKeyAttr]: newSessionKey },
        })
    }
}

const updateUserTrustlimitValue = async (username, newTrustLimit, mobile = false) => {
    const trustLimitAttr = mobile ? 'trustlimit_mobile' : 'trustlimit'
    if (!mobile) {
        await User.update({
            where: { username },
            data: { [trustLimitAttr]: newTrustLimit },
        })
    }
}

/**
 * Increments the user's trustlimit value to allow for an extension of its valid session time
 * @param username
 * @param mobile
 */
const _extendUserSession = (username, mobile = false) => {
    const renewTimeInSeconds = mobile ? 30 * 24 * 60 * 60 /* 30 days */ : 30 * 60 /* 30 minutes */
    const newTrustLimit = DateTimeUtils.getCurrentUnixTimestamp() + renewTimeInSeconds
    updateUserTrustlimitValue(username, newTrustLimit, mobile)
    return newTrustLimit
}

const _checkIfUserExists = async (username, key) => {
    const whereCondition = {
        username: username,
        OR: [{ sessionkey: key }, { sessionkey_mobile: key }],
    }

    const result = await User.findUnique({
        where: whereCondition,
    }).catch((_) => null)

    return result
}

const _checkIfTrustLimitHasExpired = (trustlimit) => {
    const currentUnixTime = DateTimeUtils.getCurrentUnixTimestamp()
    return currentUnixTime >= trustlimit
}

const generateNewSessionKeyForUser = (username, mobile = false) => {
    const newKey = generateUuid()
    updateUserSessionKeyValue(username, newKey, mobile)
    const newTrustlimit = _extendUserSession(username, mobile)
    return { sessionkey: newKey, trustlimit: newTrustlimit }
}

const checkIfSessionKeyIsValid = async (key, username, renewTrustLimit = true, mobile = false) => {
    const userData = await _checkIfUserExists(username, key)
    if (userData) {
        // User exists, check if trustlimit has expired
        if (
            _checkIfTrustLimitHasExpired(mobile ? userData.trustlimit_mobile : userData.trustlimit)
        ) {
            throw APIError.notAuthorized('Session is not valid.')
        }
        if (renewTrustLimit) _extendUserSession(username, mobile)
        return true
    }
    Logger.addLog('USER AND/OR SESSION NOT FOUND')
    throw APIError.notAuthorized()
}

export default { checkIfSessionKeyIsValid, generateNewSessionKeyForUser }
