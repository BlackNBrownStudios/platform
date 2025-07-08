/**
 * Custom validation functions for request data
 */

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('{{#label}} must be a valid ObjectId');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('password must contain at least 1 letter and 1 number');
  }
  return value;
};

const colorHex = (value, helpers) => {
  if (!value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
    return helpers.message('{{#label}} must be a valid hex color code');
  }
  return value;
};

module.exports = {
  objectId,
  password,
  colorHex,
};
