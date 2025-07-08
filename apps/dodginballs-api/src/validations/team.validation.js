const Joi = require('joi');
const { objectId, colorHex } = require('./custom.validation');

const createTeam = {
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(20),
    color: Joi.string().required().custom(colorHex),
    members: Joi.array().items(Joi.string().custom(objectId)),
    captain: Joi.string().custom(objectId),
    logo: Joi.string(),
    isPublic: Joi.boolean(),
    customizations: Joi.object()
  }),
};

const getTeams = {
  query: Joi.object().keys({
    name: Joi.string(),
    captain: Joi.string().custom(objectId),
    isActive: Joi.boolean(),
    isPublic: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};

const updateTeam = {
  params: Joi.object().keys({
    teamId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(2).max(20),
      color: Joi.string().custom(colorHex),
      captain: Joi.string().custom(objectId),
      logo: Joi.string(),
      isActive: Joi.boolean(),
      isPublic: Joi.boolean(),
      customizations: Joi.object()
    })
    .min(1),
};

const deleteTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};

const addTeamMember = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const removeTeamMember = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
};
