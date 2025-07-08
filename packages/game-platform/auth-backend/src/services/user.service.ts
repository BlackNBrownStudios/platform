import httpStatus from 'http-status';
import { ApiError } from '@platform/backend-core';
import { User, IUser } from '../models/user.model';

export class UserService {
  /**
   * Create a user
   */
  async createUser(userBody: any): Promise<IUser> {
    if (await User.isEmailTaken(userBody.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    
    if (userBody.username && await User.isUsernameTaken(userBody.username)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
    }
    
    return User.create(userBody);
  }

  /**
   * Query for users
   */
  async queryUsers(filter: any, options: any): Promise<any> {
    const users = await User.paginate(filter, options);
    return users;
  }

  /**
   * Get user by id
   */
  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username });
  }

  /**
   * Update user by id
   */
  async updateUserById(
    userId: string,
    updateBody: any
  ): Promise<IUser | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    
    if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    
    if (updateBody.username && (await User.isUsernameTaken(updateBody.username, userId))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
    }
    
    Object.assign(user, updateBody);
    await user.save();
    return user;
  }

  /**
   * Delete user by id
   */
  async deleteUserById(userId: string): Promise<IUser | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await user.deleteOne();
    return user;
  }

  /**
   * Update user game-specific data
   */
  async updateGameData(
    userId: string,
    gameId: string,
    data: any
  ): Promise<IUser | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    
    if (!user.gameSpecificData) {
      user.gameSpecificData = {};
    }
    
    user.gameSpecificData[gameId] = {
      ...user.gameSpecificData[gameId],
      ...data,
      updatedAt: new Date(),
    };
    
    await user.save();
    return user;
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'user' | 'admin'): Promise<IUser[]> {
    return User.find({ role, isActive: true });
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId: string): Promise<IUser | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    
    user.isActive = !user.isActive;
    await user.save();
    return user;
  }
}