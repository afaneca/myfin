import joi from 'joi';
import * as cryptoUtils from '../utils/CryptoUtils.js';
import APIError from '../errorHandling/apiError.js';
import Logger from '../utils/Logger.js';
import SessionManager from '../utils/sessionManager.js';
import CommonsController from './commonsController.js';
import UserService from '../services/userServices.js';

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
    await UserService.createUser(user)
      .then((data) => {
        res.send(`User ${data.username} successfully created`);
      });
  } catch (err) {
    Logger.addLog(err);
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
    await UserService.attemptLogin(userData.username, userData.password,
      mobile)
      .then((sessionData) => {
        Logger.addLog('-----------------');
        Logger.addStringifiedLog(sessionData);
        res.send(sessionData);
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    next(err || APIError.internalServerError());
  }
};

const checkSessionValidity = async (req, res, next) => {
  try {
    await CommonsController.checkAuthSessionValidity(req);
    res.send('OK');
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export {
  createOne,
  attemptLogin,
  checkSessionValidity,
};
