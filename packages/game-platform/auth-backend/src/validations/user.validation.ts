import Joi from 'joi';
import { password, objectId } from './custom.validation';

export const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    username: Joi.string().alphanum().min(3).max(30),
    role: Joi.string().valid('user', 'admin'),
  }),
};

export const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string(),
    username: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      username: Joi.string().alphanum().min(3).max(30),
      preferences: Joi.object().keys({
        notifications: Joi.boolean(),
        theme: Joi.string(),
        language: Joi.string(),
      }),
    })
    .min(1),
};

export const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const updateGameData = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    gameId: Joi.string().required(),
  }),
  body: Joi.object().pattern(Joi.string(), Joi.any()),
};