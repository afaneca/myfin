import joi from 'joi';
import db from '../models/index.js';
import * as cryptoUtils from '../utils/CryptoUtils.js';
import APIError from '../errorHandling/apiError.js';
import Logger from '../utils/Logger.js';
import SessionManager from '../utils/sessionManager.js';
import CommonsController from './commonsController.js';
import dbConfig from '../config/db.config.js';

const User = db.users;
const { Op } = db.Sequelize;

// GET ALL
/* const findAll = async (req, res, next) => {
  /!* const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null; *!/
  await SessionManager.checkIfSessionKeyIsValid('', 'tony', true, false);
  User.findAll()
    .then((data) => {
      if (data) res.send(data);
      else next(APIError.notFound('No user found'));
    })
    .catch((/!* err *!/) => {
      next(APIError.internalServerError());
    });
}; */

// GET ONE
/* const findOne = (req, res, next) => {
  const { id } = req.params;

  User.findByPk(id)
    .then((data) => {
      if (data) res.send(data);
      else next(APIError.notFound('User not found'));
    }).catch((/!* err *!/) => {
      next(APIError.internalServerError());
    });
}; */

// CREATE
const createUserSchema = joi.object({
  username: joi.string()
    .trim()
    .required(),
  password: joi.string()
    .trim()
    .required(),
  email: joi.string()
    .email()
    .required(),

});
const createOne = async (req, res, next) => {
  try {
    await CommonsController.checkAuthSessionValidity(req);
    const user = await createUserSchema.validateAsync(req.body);
    user.password = cryptoUtils.hashPassword(user.password);
    User.create(user)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        Logger.addLog(err);
        next(APIError.internalServerError());
      });
  } catch (err) {
    next(err || APIError.internalServerError());
  }
};

// AUTH
const attemptLoginSchema = joi.object({
  username: joi.string()
    .trim()
    .required(),
  password: joi.string()
    .trim()
    .required(),
});
const attemptLogin = async (req, res, next) => {
  try {
    const mobile = req.get('mobile') === 'true';
    const userData = await attemptLoginSchema.validateAsync(req.body);
    const condition = { username: { [Op.like]: `${userData.username}` } };
    User.findOne({ where: condition })
      .then((data) => {
        if (data) {
          const isValid = cryptoUtils.verifyPassword(userData.password, data.password);
          if (isValid) {
            const newSessionData = SessionManager.generateNewSessionKeyForUser(userData.username,
              mobile);
            if (mobile) {
              // eslint-disable-next-line no-param-reassign
              data.sessionkey_mobile = newSessionData.sessionkey;
              // eslint-disable-next-line no-param-reassign
              data.trustlimit_mobile = newSessionData.trustlimit;
            } else {
              // eslint-disable-next-line no-param-reassign
              data.sessionkey = newSessionData.sessionkey;
              // eslint-disable-next-line no-param-reassign
              data.trustlimit = newSessionData.trustlimit;
            }
            res.send(data);
          } else {
            next(APIError.notAuthorized('Wrong Credentials'));
          }
        } else {
          next(APIError.notAuthorized('User Not Found'));
        }
      })
      .catch((err) => {
        Logger.addLog(err);
        next(APIError.internalServerError());
      });
  } catch (err) {
    next(APIError.internalServerError());
  }
};

const checkSessionValidity = async (req, res, next) => {
  try {
    await CommonsController.checkAuthSessionValidity(req);
    res.send('OK');
  } catch (err) {
    next(err || APIError.internalServerError());
  }
};

export {
  createOne,
  attemptLogin,
  checkSessionValidity,
};
