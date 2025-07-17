// Auth services are now provided by @platform/auth-backend
module.exports.userService = require('./user.service');
module.exports.cardService = require('./card.service');
module.exports.gameService = require('./game.service');
module.exports.multiplayerGameService = require('./multiplayerGame.service');
// imageService, enhancedImageService, and cardValidationService removed - replaced by new image services architecture
module.exports.historicalEventService = require('./historicalEvent.service');
module.exports.dailyChallengeService = require('./dailyChallenge.service');
module.exports.storeService = require('./store.service');
// tempImageCacheService removed - replaced by new image services architecture
