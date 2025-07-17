const { User } = require('@platform/auth-backend');
module.exports.User = User;
module.exports.Card = require('./card.model');
module.exports.Game = require('./game.model');
module.exports.MultiplayerGame = require('./multiplayerGame.model');
// Token model is now provided by @platform/auth-backend
module.exports.HistoricalEvent = require('./historicalEvent.model');
module.exports.DailyChallenge = require('./dailyChallenge.model');
module.exports.StoreItem = require('./storeItem.model');
