import Joi from 'joi';

export const userLoginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const userSignUpSchema = Joi.object()
  .keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    contactNo: Joi.string().allow(null, ''),
    extension: Joi.string().allow(null, ''),
    joiningDate: Joi.date().allow(''),
    dob: Joi.date().allow(''),
    role: Joi.string().valid('admin', 'user'),
    status: Joi.string().valid('active', 'inactive'),
  })
  .unknown(true);

export const userUpdateSchema = Joi.object()
  .keys({
    password: Joi.string().min(6),
    firstName: Joi.string().min(2).max(100),
    lastName: Joi.string().min(2).max(100),
    contactNo: Joi.string().allow(null, ''),
    extension: Joi.string().allow(null, ''),
    joiningDate: Joi.date().allow(''),
    dob: Joi.date().allow(''),
    role: Joi.string().valid('admin', 'user'),
    status: Joi.string().valid('active', 'inactive'),
  })
  .unknown(true);
