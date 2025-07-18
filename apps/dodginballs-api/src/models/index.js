// Import models from auth-backend
const { User, Token } = require('@platform/auth-backend');
module.exports.User = User;
module.exports.Token = Token;

// Game-specific models
module.exports.Match = require('./match.model');
module.exports.Team = require('./team.model');
module.exports.Lobby = require('./lobby.model');
module.exports.PlayerStats = require('./playerStats.model');