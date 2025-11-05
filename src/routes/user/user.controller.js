import Joi from 'joi';
import passport from 'passport';
import express from 'express';
import models from '../../models';
import { PAGE_SIZE, STATUS_CODES } from '../../utils/constants';
import { BadRequest } from '../../error';
import { getUserByIdQuery, listQuery, getLoggedUserQuery } from './query';
import {
  BadRequestError,
  generateHash,
  generateJWT,
  getByIdQuery,
  getErrorMessages,
  getPassportErrorMessage,
  SuccessResponse,
} from '../../utils/helper';
import { userLoginSchema, userSignUpSchema, userUpdateSchema } from './validationSchemas';
import { Request, RequestBodyValidator } from '../../utils/decorators';

const { User } = models;

class UserController {
  static router;

  static getRouter() {
    this.router = express.Router();
    this.router.get('/', this.list);
    this.router.post('/', this.createUser);
    this.router.get('/:id', this.getUserById);
    this.router.put('/:id', this.updateUser);
    this.router.post('/login', this.login);
    return this.router;
  }

  static async list(req, res, next) {
    const {
      query: { searchString, name, sortColumn, sortOrder, pageNumber = 1, pageSize = PAGE_SIZE },
    } = req;

    try {
      if (pageNumber <= 0) {
        return BadRequestError('Invalid page number', STATUS_CODES.INVALID_INPUT);
      }

      const query = listQuery({
        searchString,
        name,
        sortColumn,
        sortOrder,
        pageNumber,
        pageSize,
      });
      const users = await User.findAndCountAll(query);
      return SuccessResponse(res, users);
    } catch (e) {
      next(e);
    }
  }

  static async getUserById(req, res, next) {
    const {
      params: { id },
    } = req;

    try {
      if (!id) {
        BadRequestError(`User id is required`, STATUS_CODES.INVALID_INPUT);
      }
      const query = getUserByIdQuery({ id });
      const user = await User.findOne(query);
      if (!user) {
        BadRequestError(`User does not exist`, STATUS_CODES.NOTFOUND);
      }
      return SuccessResponse(res, user);
    } catch (e) {
      next(e);
    }
  }

  static async login(req, res, next) {
    const { body: user } = req;

    const result = userLoginSchema.validate(user, { abortEarly: true });
    if (result.error) {
      return next(new BadRequest(getErrorMessages(result), STATUS_CODES.INVALID_INPUT));
    }

    return passport.authenticate('local', { session: false }, async (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const userInfo = await User.findOne(getLoggedUserQuery(passportUser.id));
        const userObj = {
          id: passportUser.id,
          email: passportUser.email,
          name: passportUser.fullName,
          avatar: passportUser.avatar,
          isAdmin: passportUser.isAdmin,
          token: generateJWT(passportUser),
        };
        return SuccessResponse(res, userObj);
      }
      return next(new BadRequest(getPassportErrorMessage(info), STATUS_CODES.INVALID_INPUT));
    })(req, res, next);
  }

  static async createUser(req, res, next) {
    const { body: userPayload } = req;
    try {
      const result = Joi.validate(userPayload, userSignUpSchema);
      if (result.error) {
        return BadRequestError(getErrorMessages(result), STATUS_CODES.INVALID_INPUT);
      }

      const query = {
        where: {
          email: userPayload.email,
        },
      };

      const userExists = await User.findOne(query);
      if (!userExists) {
        userPayload.password = generateHash(userPayload.password);
        userPayload.status = 'active';
        const user = await User.create(userPayload);
        const userResponse = user.toJSON();
        delete userResponse.password;
        return SuccessResponse(res, userResponse);
      }
      BadRequestError(`User "${userPayload.email}" already exists`);
    } catch (e) {
      next(e);
    }
  }

  @RequestBodyValidator(userUpdateSchema)
  @Request
  static async updateUser(req, res) {
    const {
      body: userPayload,
      params: { id: userId },
    } = req;

    const userExists = await User.findOne(getByIdQuery({ id: userId }));

    if (userExists) {
      if (userPayload.password) {
        userPayload.password = generateHash(userPayload.password);
      }
      await User.update(userPayload, { where: { id: userId } });
      delete userPayload.password;
      return SuccessResponse(res, userPayload);
    }
    BadRequestError(`User does not exist`, STATUS_CODES.NOTFOUND);
  }
}

export default UserController;
