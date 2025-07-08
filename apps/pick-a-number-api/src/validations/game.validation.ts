import Joi from 'joi';

export const gameValidation = {
  makeGuess: {
    params: Joi.object().keys({
      gameId: Joi.string().required(),
    }),
    body: Joi.object().keys({
      guess: Joi.number().integer().min(1).max(100).required(),
    }),
  },
};