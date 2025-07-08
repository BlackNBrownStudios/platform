const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../../../src/models');
const setupTestDB = require('../../setup');

setupTestDB();

describe('User model', () => {
  describe('User validation', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      };
    });

    test('should correctly validate a valid user', async () => {
      await expect(new User(newUser).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if email is invalid', async () => {
      newUser.email = 'invalidEmail';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password is too short', async () => {
      newUser.password = 'pass1';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain numbers', async () => {
      newUser.password = 'password';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain letters', async () => {
      newUser.password = '12345678';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if role is invalid', async () => {
      newUser.role = 'invalid';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });
  });

  describe('User password methods', () => {
    test('should hash password before saving to database', async () => {
      const password = 'Password123';
      const user = await User.create({
        name: 'Password Test User',
        email: 'password-test@example.com',
        password: password,
        role: 'user',
      });

      // Verify the password was hashed
      expect(user.password).not.toBe(password);
      expect(await bcrypt.compare(password, user.password)).toBe(true);
    });

    test('should correctly verify matching passwords', async () => {
      const password = 'Password123';
      const user = await User.create({
        name: 'Password Match Test User',
        email: 'password-match@example.com',
        password: password,
        role: 'user',
      });

      // Directly test the isPasswordMatch method
      const isMatch = await user.isPasswordMatch(password);
      expect(isMatch).toBe(true);
      
      // Verify non-matching password fails
      const isMatchWrong = await user.isPasswordMatch('wrongPassword');
      expect(isMatchWrong).toBe(false);
    });
  });
});
