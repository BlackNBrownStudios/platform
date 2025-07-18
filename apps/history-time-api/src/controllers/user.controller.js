const fs = require('fs');
const path = require('path');

const httpStatus = require('http-status');
const multer = require('multer');

const { userService, gameService } = require('../services');
const { ApiError } = require('@platform/backend-core');
const { catchAsync } = require('@platform/backend-core');
const { pick } = require('@platform/backend-core');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/profile-pictures');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .jpeg, .jpg and .png files are allowed!'), false);
    }
    cb(null, true);
  },
}).single('profilePicture');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getUserStats = catchAsync(async (req, res) => {
  const stats = await userService.getUserStats(req.params.userId);
  res.send(stats);
});

const updateUserPreferences = catchAsync(async (req, res) => {
  const user = await userService.updateUserPreferences(req.params.userId, req.body);
  res.send(user.preferences);
});

/**
 * Get current user's profile
 * Used by both web and mobile platforms
 */
const getUserProfile = catchAsync(async (req, res) => {
  // req.user comes from the auth middleware
  const userId = req.user.id;
  const user = await userService.getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get user stats for the profile
  const stats = await userService.getUserStats(userId);

  // Return user profile with stats
  res.send({
    id: user.id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
    bio: user.bio,
    preferredCategory: user.preferredCategory,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    stats,
  });
});

/**
 * Update current user's profile
 * Used by both web and mobile platforms
 */
const updateUserProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const updateData = pick(req.body, ['name', 'email', 'bio', 'preferredCategory']);

  const user = await userService.updateUserById(userId, updateData);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  res.send({
    id: user.id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
    bio: user.bio,
    preferredCategory: user.preferredCategory,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

/**
 * Upload a profile picture
 * Supports both web (File) and mobile (base64) uploads
 */
const uploadProfilePicture = catchAsync(async (req, res) => {
  // Use multer middleware for handling multipart/form-data
  upload(req, res, async (err) => {
    if (err) {
      return res.status(httpStatus.BAD_REQUEST).send({ message: err.message });
    }

    if (!req.file) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Please upload a file');
    }

    const userId = req.user.id;

    // Generate the URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = `/uploads/profile-pictures/${req.file.filename}`;
    const fileUrl = `${baseUrl}/public${relativePath}`;

    // Update user profile with the new picture URL
    const user = await userService.updateUserById(userId, { profilePicture: fileUrl });

    res.send({ url: fileUrl });
  });
});

/**
 * Get user's game statistics
 * Used by both web and mobile platforms for profile display
 */
const getUserGameStats = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const stats = await userService.getUserStats(userId);

  // Get additional statistics
  const { totalGames, completedGames, abandonedGames } =
    await gameService.getUserGameCounts(userId);
  const bestScore = await gameService.getUserBestScore(userId);
  const averageScore = await gameService.getUserAverageScore(userId);
  const totalTimePlayed = await gameService.getUserTotalPlayTime(userId);
  const favoriteCategory = await gameService.getUserFavoriteCategory(userId);

  res.send({
    totalGames,
    completedGames,
    abandonedGames,
    bestScore,
    averageScore,
    totalTimePlayed,
    favoriteCategory,
    ...stats,
  });
});

/**
 * Get user's recent games
 * Used by both web and mobile platforms for profile display
 */
const getUserRecentGames = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const limit = parseInt(req.query.limit) || 10;

  const recentGames = await gameService.getUserRecentGames(userId, limit);

  res.send(recentGames);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  updateUserPreferences,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  getUserGameStats,
  getUserRecentGames,
};
