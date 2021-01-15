const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

const checkIfSessionKeyIsValid = async (key, username, renewTrustLimit = true, mobile = false) => {
    let renewTime = '+30 minutes';
    if (mobile) renewTime = '+1 month';

    const userExists = await _checkIfUserExists(username)
    if (userExists) {
        console.log("USER EXISTS");
    } else {
        console.log("USER DOES NOT EXIST");
    }

    /* _checkIfUserExists(username).then((exists) => {
        console.log("USER EXISTS?? " + exists);
    }).catch(err => {
        console.log("ERROR: " + err);
    }) */
}

const _checkIfUserExists = (username) => {
    return new Promise((resolve, reject) => {
        const condition = { username: { [Op.like]: `${username}` } }

        User.findOne({ where: condition })
            .then(data => {
                resolve(data !== null);
            }).catch(err => { resolve(false) })
    })

}

module.exports = { checkIfSessionKeyIsValid };