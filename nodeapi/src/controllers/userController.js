import joi from 'joi';
import APIError from '../errorHandling/apiError.js';
import Logger from '../utils/Logger.js';
import CommonsController from './commonsController.js';
import UserService from '../services/userService.js';

// CREATE
const createUserSchema = joi.object({
  username: joi.string().trim().required(),
  password: joi.string().trim().required(),
  email: joi.string().email().required(),
});
const createOne = async (req, res, next) => {
  try {
    if (process.env.ENABLE_USER_SIGNUP !== 'true') {
      throw APIError.notAuthorized('Sign ups are disabled!');
    }
    const user = await createUserSchema.validateAsync(req.body);
    await UserService.createUser(user).then((data) => {
      res.json(`User ${data.username} successfully created`);
    });
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

// AUTH
const attemptLoginSchema = joi.object({
  username: joi.string().trim().required(),
  password: joi.string().trim().required(),
});
const attemptLogin = async (req, res, next) => {
  try {
    const mobile = req.get('mobile') === 'true';
    const userData = await attemptLoginSchema.validateAsync(req.body);
    await UserService.attemptLogin(userData.username, userData.password, mobile)
      .then((sessionData) => {
        Logger.addLog('-----------------');
        Logger.addStringifiedLog(sessionData);
        res.send(sessionData);
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

const checkSessionValidity = async (req, res, next) => {
  try {
    await CommonsController.checkAuthSessionValidity(req);
    res.send('1');
  } catch (err) {
    Logger.addLog(err);
    next(err || APIError.internalServerError());
  }
};

export default {
  createOne,
  attemptLogin,
  checkSessionValidity,
};
