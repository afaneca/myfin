const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const joi = require('joi')
const encryptUtils = require("../utils/CryptoUtils.js");
const APIError = require("../errorHandling/apiError");
const SessionManager = require("../utils/sessionManager")
const CommonsController = require("./commonsController")

// GET ALL
exports.findAll = async (req, res, next) => {
    /* const title = req.query.title;
    var condition = title ? { title: { [Op.like]: `%${title}%` } } : null; */
    await SessionManager.checkIfSessionKeyIsValid("", "tony", true, false)
    User.findAll()
        .then(data => {
            if (data)
                res.send(data);
            else next(APIError.notFound("No user found"))
        })
        .catch(err => {
            next(APIError.internalServerError())
        });
};


// GET ONE
exports.findOne = (req, res, next) => {
    const id = req.params.id

    User.findByPk(id)
        .then(data => {
            if (data)
                res.send(data)
            else next(APIError.notFound("User not found"))
        }).catch(err => {
        next(APIError.internalServerError())
    })
}

// CREATE
const createUserSchema = joi.object({
    username: joi.string().trim().required(),
    password: joi.string().trim().required(),
    email: joi.string().email().required(),

})
exports.createOne = async (req, res, next) => {
    try {
        await CommonsController.checkAuthSessionValidity(req)
        const user = await createUserSchema.validateAsync(req.body)
        user.password = encryptUtils.hashPassword(user.password)
        User.create(user)
            .then(data => {
                res.send(data) // TODO - check what response body to send
            }).catch(err => {
            next(APIError.internalServerError())
        })

    } catch (err) {
        next(err || APIError.internalServerError())
    }
}


// AUTH
const attemptLoginSchema = joi.object({
    username: joi.string().trim().required(),
    password: joi.string().trim().required()
})
exports.attemptLogin = async (req, res, next) => {
    try {
        const mobile = req.get("mobile") === "true"
        const userData = await attemptLoginSchema.validateAsync(req.body)
        const condition = {username: {[Op.like]: `${userData.username}`}}
        User.findOne({where: condition})
            .then(data => {
                if (data) {
                    const isValid = encryptUtils.verifyPassword(userData.password, data.password)
                    if (isValid) {
                        const newSessionData = SessionManager.generateNewSessionKeyForUser(userData.username, mobile)
                        if (mobile) {
                            data.sessionkey_mobile = newSessionData.sessionkey
                            data.trustlimit_mobile = newSessionData.trustlimit
                        } else {
                            data.sessionkey = newSessionData.sessionkey
                            data.trustlimit = newSessionData.trustlimit
                        }

                        res.send(data)
                    } else {
                        next(APIError.notAuthorized("Wrong Credentials"))
                    }
                } else {
                    next(APIError.notAuthorized("User Not Found"))
                }

            }).catch(err => {
            next(APIError.internalServerError())
        })
    } catch (err) {
        next(APIError.internalServerError())
    }
}

exports.checkSessionValidity = async (req, res, next) => {
    try {
        await CommonsController.checkAuthSessionValidity(req)
        res.send("OK")
    } catch (err) {
        next(err || APIError.internalServerError())
    }
}

