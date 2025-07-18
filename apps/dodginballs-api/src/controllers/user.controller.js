const httpStatus = require('http-status');
const { catchAsync } = require('@platform/backend-core');
const { teamService } = require('../services');
const { User } = require('../models');

// DodginBalls-specific user controller methods

const getUserTeams = catchAsync(async (req, res) => {
  const teams = await teamService.getUserTeams(req.params.userId);
  res.send(teams);
});

const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.send(user);
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');
  res.send(user);
});

const getUserStats = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('stats')
    .populate('stats');
  
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).send({
      message: 'User not found'
    });
  }
  
  res.send(user.stats || {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalEliminations: 0,
    totalHits: 0
  });
});

const updateUserStats = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { stats: req.body },
    { new: true, runValidators: true }
  ).select('stats');
  
  res.send(user.stats);
});

module.exports = {
  getUserTeams,
  getProfile,
  updateProfile,
  getUserStats,
  updateUserStats
};