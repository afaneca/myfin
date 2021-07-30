const bcrypt = require("bcrypt")
var crypto = require('crypto')

const hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
}
/**
 * Compares the given password with an hash to see if check represent the same value
 * @param password the plain-text password
 * @param hashed the hashed password
 * @returns {bool} true if hashed data matches hash
 */
const verifyPassword = (password, hashed) => {
    return bcrypt.compareSync(password, hashed)
}

/**
 * Generates a new Uuid4 for user session identification
 * Source: https://github.com/tracker1/node-uuid4/blob/master/index.js
 * @returns {String} the uuid4 string
 */
const generateUuid = () => {
    var rnd = crypto.randomBytes(16);
    rnd[6] = (rnd[6] & 0x0f) | 0x40;
    rnd[8] = (rnd[8] & 0x3f) | 0x80;
    rnd = rnd.toString("hex").match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    rnd.shift();
    return rnd.join("-");
}


module.exports = {hashPassword, verifyPassword, generateUuid}