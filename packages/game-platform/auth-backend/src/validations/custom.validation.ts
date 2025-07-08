import { CustomHelpers } from 'joi';

export const password = (value: string, helpers: CustomHelpers) => {
  if (value.length < 8) {
    return helpers.error('string.min', { limit: 8 });
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const objectId = (value: string, helpers: CustomHelpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.error('any.invalid');
  }
  return value;
};