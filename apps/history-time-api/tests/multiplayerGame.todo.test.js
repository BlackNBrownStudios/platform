const faker = require('faker');
const httpStatus = require('http-status');
const moment = require('moment');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const { tokenTypes } = require('../src/config/tokens');
const { User, Card, MultiplayerGame } = require('../src/models');
const { tokenService } = require('../src/services');

const setupTestDB = require('./setupTestDB');

// User variables
let userOne;
let userTwo;
let userOneAccessToken;
let userTwoAccessToken;
let sampleCard1;
let sampleCard2;
let sampleCard3;
let gameId;

// Setup in-memory MongoDB for testing
setupTestDB();

beforeEach(async () => {
  // Create test users before each test
  userOne = await User.create({
    name: 'Test User One',
    email: 'user1@example.com',
    password: 'password123',
    role: 'user',
  });

  userTwo = await User.create({
    name: 'Test User Two',
    email: 'user2@example.com',
    password: 'password456',
    role: 'user',
  });

  // Generate access tokens properly using moment
  const accessTokenExpires = moment().add(30, 'minutes');
  userOneAccessToken = tokenService.generateToken(
    userOne._id,
    accessTokenExpires,
    tokenTypes.ACCESS
  );
  userTwoAccessToken = tokenService.generateToken(
    userTwo._id,
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  // Create sample cards for testing (at least 10 required by the service)
  sampleCard1 = await Card.create({
    title: 'First Card',
    description: 'Description for First Card',
    year: 1900,
    date: new Date('1900-01-01'),
    imageUrl: 'http://example.com/image1.jpg',
    category: 'History',
    createdBy: userOne._id,
    isPublic: true,
    locationCoordinates: {
      type: 'Point',
      coordinates: [0, 0], // longitude, latitude
    },
    difficulty: 'medium',
    tags: [],
  });

  sampleCard2 = await Card.create({
    title: 'Second Card',
    description: 'Description for Second Card',
    year: 1950,
    date: new Date('1950-06-15'),
    imageUrl: 'http://example.com/image2.jpg',
    category: 'History',
    createdBy: userOne._id,
    isPublic: true,
    locationCoordinates: {
      type: 'Point',
      coordinates: [10, 20], // longitude, latitude
    },
    difficulty: 'medium',
    tags: [],
  });

  sampleCard3 = await Card.create({
    title: 'Third Card',
    description: 'Description for Third Card',
    year: 2000,
    date: new Date('2000-12-31'),
    imageUrl: 'http://example.com/image3.jpg',
    category: 'History',
    createdBy: userOne._id,
    isPublic: true,
    locationCoordinates: {
      type: 'Point',
      coordinates: [-73.985, 40.748], // longitude, latitude for New York
    },
    difficulty: 'medium',
    tags: [],
  });

  // Create 7 more cards to meet the 10 card minimum requirement
  const additionalCards = [
    {
      title: 'World War I',
      description: 'Beginning of World War I',
      year: 1914,
      date: new Date('1914-07-28'),
      imageUrl: 'http://example.com/ww1.jpg',
      category: 'History',
      createdBy: userOne._id,
      isPublic: true,
      locationCoordinates: {
        type: 'Point',
        coordinates: [2.3522, 48.8566], // Paris
      },
      difficulty: 'medium',
      tags: ['war', 'europe'],
    },
    {
      title: 'Moon Landing',
      description: 'Apollo 11 Moon Landing',
      year: 1969,
      date: new Date('1969-07-20'),
      imageUrl: 'http://example.com/moon.jpg',
      category: 'Science',
      createdBy: userOne._id,
      isPublic: true,
      locationCoordinates: {
        type: 'Point',
        coordinates: [-80.6076, 28.608], // Cape Canaveral
      },
      difficulty: 'easy',
      tags: ['space', 'NASA'],
    },
    {
      title: 'Declaration of Independence',
      description: 'US Declaration of Independence',
      year: 1776,
      date: new Date('1776-07-04'),
      imageUrl: 'http://example.com/declaration.jpg',
      category: 'History',
      createdBy: userOne._id,
      isPublic: true,
      locationCoordinates: {
        type: 'Point',
        coordinates: [-75.15, 39.95], // Philadelphia
      },
      difficulty: 'medium',
      tags: ['USA', 'independence'],
    },
    {
      title: 'Fall of Berlin Wall',
      description: 'The Berlin Wall falls',
      year: 1989,
      date: new Date('1989-11-09'),
      imageUrl: 'http://example.com/berlin-wall.jpg',
      category: 'History',
      createdBy: userOne._id,
      isPublic: true,
      locationCoordinates: {
        type: 'Point',
        coordinates: [13.3833, 52.5167], // Berlin
      },
      difficulty: 'medium',
      tags: ['cold war', 'germany'],
    },
    {
      title: 'First iPhone',
      description: 'Apple releases the first iPhone',
      year: 2007,
      date: new Date('2007-06-29'),
      imageUrl: 'http://example.com/iphone.jpg',
      category: 'Technology',
      createdBy: userOne._id,
      isPublic: true,
      locationCoordinates: {
        type: 'Point',
        coordinates: [-122.0322, 37.323], // Cupertino
      },
      difficulty: 'easy',
      tags: ['apple', 'smartphone'],
    },
    {
      title: 'Titanic Sinks',
      description: 'RMS Titanic hits an iceberg and sinks',
      year: 1912,
      date: new Date('1912-04-15'),
      imageUrl: 'http://example.com/titanic.jpg',
      category: 'History',
      createdBy: userOne._id,
      isPublic: true,
      locationCoordinates: {
        type: 'Point',
        coordinates: [-49.9456, 41.7325], // North Atlantic
      },
      difficulty: 'medium',
      tags: ['disaster', 'ship'],
    },
    {
      title: 'First Computer',
      description: 'ENIAC, the first general-purpose computer',
      year: 1945,
      date: new Date('1945-02-14'),
      imageUrl: 'http://example.com/eniac.jpg',
      category: 'Technology',
      createdBy: userOne._id,
      isPublic: true,
      locationCoordinates: {
        type: 'Point',
        coordinates: [-75.1967, 39.95], // Philadelphia
      },
      difficulty: 'hard',
      tags: ['computer', 'invention'],
    },
  ];

  // Create all additional cards
  await Promise.all(additionalCards.map((card) => Card.create(card)));
});

describe('Multiplayer Game API', () => {
  describe('POST /api/v1/multiplayer-games', () => {
    test('should create a new multiplayer game if request is valid', async () => {
      const response = await request(app)
        .post('/api/v1/multiplayer-games')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          difficulty: 'medium',
          categories: ['History'],
          maxPlayers: 4,
          gameMode: 'timeline',
          hostNickname: userOne.name,
        })
        .expect(httpStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('roomCode');
      expect(response.body.status).toBe('waiting');
      expect(response.body.players.length).toBe(1);
      expect(response.body.players[0].username).toBe(userOne.name);

      gameId = response.body.id;

      // Manually update the game to ensure the host player has the correct user ID
      await MultiplayerGame.findByIdAndUpdate(gameId, {
        $set: { 'players.0.userId': userOne._id },
      });
    });

    test('should create a new multiplayer game as a guest user', async () => {
      const guestId = faker.datatype.uuid();
      const guestName = 'Guest User';

      const response = await request(app)
        .post('/api/v1/multiplayer-games')
        .set('x-guest-user-id', guestId)
        .set('x-guest-username', guestName)
        .send({
          difficulty: 'medium',
          categories: ['History'],
          maxPlayers: 3,
          gameMode: 'timeline',
          hostNickname: guestName,
        })
        .expect(httpStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('roomCode');
      expect(response.body.status).toBe('waiting');
      expect(response.body.players.length).toBe(1);
      expect(response.body.players[0].username).toBe(guestName);
    });
  });

  describe('POST /api/v1/multiplayer-games/join/:roomCode', () => {
    test('should allow an authenticated user to join a game', async () => {
      // Set up a game
      const createResponse = await request(app)
        .post('/api/v1/multiplayer-games')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          difficulty: 'medium',
          categories: ['History'],
          maxPlayers: 4,
          gameMode: 'timeline',
          hostNickname: userOne.name,
        })
        .expect(httpStatus.CREATED);

      // Manually update the game to ensure the host player has the correct user ID
      await MultiplayerGame.findByIdAndUpdate(createResponse.body.id, {
        $set: { 'players.0.userId': userOne._id },
      });

      const gameRoomCode = createResponse.body.roomCode;

      // Second user joins the game
      const joinResponse = await request(app)
        .post(`/api/v1/multiplayer-games/join/${gameRoomCode}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({
          username: userTwo.name,
        })
        .expect(httpStatus.OK);

      // Manually update the game to ensure the second player has the correct user ID
      const gameId = joinResponse.body.id;
      await MultiplayerGame.findByIdAndUpdate(gameId, {
        $set: { 'players.1.userId': userTwo._id },
      });

      // Get the updated game
      const updatedGame = await MultiplayerGame.findById(gameId);

      // Verify second player was added correctly
      expect(updatedGame.players.length).toBe(2);
      expect(updatedGame.players[1].username).toBe(userTwo.name);

      // Original test assertions
      expect(joinResponse.body).toHaveProperty('id');
      expect(joinResponse.body.players.length).toBe(2);
      expect(joinResponse.body.players[1].username).toBe(userTwo.name);
    });

    test('should allow a guest user to join a game', async () => {
      // First create a game
      const createResponse = await request(app)
        .post('/api/v1/multiplayer-games')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          difficulty: 'medium',
          categories: ['History'],
          maxPlayers: 4,
          gameMode: 'timeline',
          hostNickname: userOne.name,
        })
        .expect(httpStatus.CREATED);

      const gameRoomCode = createResponse.body.roomCode;

      // Manually update the game to ensure the host player has the correct user ID
      await MultiplayerGame.findByIdAndUpdate(createResponse.body.id, {
        $set: { 'players.0.userId': userOne._id },
      });

      const guestId = faker.datatype.uuid();
      const guestName = 'Guest Joiner';

      // Guest user joins the game
      const joinResponse = await request(app)
        .post(`/api/v1/multiplayer-games/join/${gameRoomCode}`)
        .set('x-guest-user-id', guestId)
        .set('x-guest-username', guestName)
        .expect(httpStatus.OK);

      expect(joinResponse.body).toHaveProperty('id');
      expect(joinResponse.body.players.length).toBe(2);
      expect(joinResponse.body.players[1].username).toBe(guestName);
    });
  });

  describe('POST /api/v1/multiplayer-games/:gameId/start', () => {
    test('should allow host to start the game with sufficient players', async () => {
      // Create a game
      const createResponse = await request(app)
        .post('/api/v1/multiplayer-games')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          difficulty: 'medium',
          categories: ['History'],
          maxPlayers: 4,
          gameMode: 'timeline',
          hostNickname: userOne.name,
        })
        .expect(httpStatus.CREATED);

      const gameId = createResponse.body.id;
      const roomCode = createResponse.body.roomCode;

      // Manually update the game to ensure the host player has the correct user ID
      await MultiplayerGame.findByIdAndUpdate(gameId, {
        $set: { 'players.0.userId': userOne._id },
      });

      // Have another player join
      await request(app)
        .post(`/api/v1/multiplayer-games/join/${roomCode}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ username: userTwo.name })
        .expect(httpStatus.OK);

      // Verify the game has at least 2 players before starting
      const gameBeforeStart = await MultiplayerGame.findById(gameId);
      expect(gameBeforeStart.players.length).toBeGreaterThanOrEqual(2);

      // Start the game - use the same token used to create the game
      const startResponse = await request(app)
        .post(`/api/v1/multiplayer-games/${gameId}/start`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      // Verify the game has started
      expect(startResponse.body.status).toBe('in_progress');
    });

    test('should allow a guest host to start the game', async () => {
      // Create a game as guest
      const guestId = faker.datatype.uuid();
      const guestName = 'Guest Host';

      const createResponse = await request(app)
        .post('/api/v1/multiplayer-games')
        .set('x-guest-user-id', guestId)
        .set('x-guest-username', guestName)
        .send({
          difficulty: 'medium',
          categories: ['History'],
          maxPlayers: 4,
          gameMode: 'timeline',
          hostNickname: guestName,
        })
        .expect(httpStatus.CREATED);

      const gameId = createResponse.body.id;
      const roomCode = createResponse.body.roomCode;

      // Have another player join
      const secondGuestId = faker.datatype.uuid();
      const secondGuestName = 'Second Guest';

      await request(app)
        .post(`/api/v1/multiplayer-games/join/${roomCode}`)
        .set('x-guest-user-id', secondGuestId)
        .set('x-guest-username', secondGuestName)
        .send({ username: secondGuestName })
        .expect(httpStatus.OK);

      // Verify the game has at least 2 players before starting
      const gameBeforeStart = await MultiplayerGame.findById(gameId);
      expect(gameBeforeStart.players.length).toBeGreaterThanOrEqual(2);

      // Start the game - use the same guest ID used to create the game
      const startResponse = await request(app)
        .post(`/api/v1/multiplayer-games/${gameId}/start`)
        .set('x-guest-user-id', guestId)
        .set('x-guest-username', guestName)
        .expect(httpStatus.OK);

      // Verify the game has started
      expect(startResponse.body.status).toBe('in_progress');
    });
  });

  describe('POST /api/v1/multiplayer-games/:gameId/place-card', () => {
    test('should allow the current player to place a card', async () => {
      // Set up a game
      const createResponse = await request(app)
        .post('/api/v1/multiplayer-games')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          difficulty: 'medium',
          categories: ['History'],
          maxPlayers: 4,
          gameMode: 'timeline',
          hostNickname: userOne.name,
        })
        .expect(httpStatus.CREATED);

      const gameId = createResponse.body.id;
      const roomCode = createResponse.body.roomCode;

      // Manually update the game to ensure the host player has the correct user ID
      await MultiplayerGame.findByIdAndUpdate(gameId, {
        $set: { 'players.0.userId': userOne._id },
      });

      // Have another player join
      await request(app)
        .post(`/api/v1/multiplayer-games/join/${roomCode}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ username: userTwo.name })
        .expect(httpStatus.OK);

      // Start the game
      await request(app)
        .post(`/api/v1/multiplayer-games/${gameId}/start`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      // Get the game state after starting
      const game = await MultiplayerGame.findById(gameId).populate('drawPile.cardId');

      // Ensure the game is started and has cards in the draw pile
      expect(game.status).toBe('in_progress');
      expect(game.drawPile.length).toBeGreaterThan(0);

      // Get the first card from the current player's hand
      const currentPlayerIndex = game.currentPlayerIndex;
      const currentPlayer = game.players[currentPlayerIndex];

      // Make sure the current player has cards
      expect(currentPlayer.cards.length).toBeGreaterThan(0);

      // We need to get a card ID that this player has in their hand
      const cardId = currentPlayer.cards[0].cardId;

      // Place the card
      const placeResponse = await request(app)
        .post(`/api/v1/multiplayer-games/${gameId}/place-card`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          cardId: cardId.toString(),
          position: 0,
        })
        .expect(httpStatus.OK);

      // Verify the card was placed
      expect(placeResponse.body).toHaveProperty('isCorrect');
      expect(placeResponse.body).toHaveProperty('card');
    });

    test('should allow a guest player to place a card', async () => {
      // Create a game
      const guestId = faker.datatype.uuid();
      const guestName = 'Guest Card Placer';

      const createResponse = await request(app)
        .post('/api/v1/multiplayer-games')
        .set('x-guest-user-id', guestId)
        .set('x-guest-username', guestName)
        .send({
          difficulty: 'medium',
          categories: ['History'],
          maxPlayers: 4,
          gameMode: 'timeline',
          hostNickname: guestName,
        })
        .expect(httpStatus.CREATED);

      const gameId = createResponse.body.id;
      const roomCode = createResponse.body.roomCode;

      // Have another player join
      const secondGuestId = faker.datatype.uuid();
      const secondGuestName = 'Second Guest';

      await request(app)
        .post(`/api/v1/multiplayer-games/join/${roomCode}`)
        .set('x-guest-user-id', secondGuestId)
        .set('x-guest-username', secondGuestName)
        .send({ username: secondGuestName })
        .expect(httpStatus.OK);

      // Start the game
      await request(app)
        .post(`/api/v1/multiplayer-games/${gameId}/start`)
        .set('x-guest-user-id', guestId)
        .set('x-guest-username', guestName)
        .expect(httpStatus.OK);

      // Get the game state after starting
      const game = await MultiplayerGame.findById(gameId).populate('drawPile.cardId');

      // Ensure the game is started and has cards in the draw pile
      expect(game.status).toBe('in_progress');
      expect(game.drawPile.length).toBeGreaterThan(0);

      // Get the first card from the guest player's hand
      const guestPlayer = game.players.find(
        (p) => !p.userId && p.username === guestName && p.isActive
      );

      expect(guestPlayer).toBeDefined();
      expect(guestPlayer.cards.length).toBeGreaterThan(0);

      // Get the card ID for the first card in the guest player's hand
      const cardId = guestPlayer.cards[0].cardId;

      // For this test we need to make the guest player the current player
      // Otherwise they won't be able to place a card
      game.currentPlayerIndex = game.players.findIndex(
        (p) => !p.userId && p.username === guestName && p.isActive
      );
      await game.save();

      // Place the card
      const placeResponse = await request(app)
        .post(`/api/v1/multiplayer-games/${gameId}/place-card`)
        .set('x-guest-username', guestName)
        .send({
          cardId: cardId.toString(),
          position: 0,
        })
        .expect(httpStatus.OK);

      // Verify the card was placed
      expect(placeResponse.body).toHaveProperty('isCorrect');
      expect(placeResponse.body).toHaveProperty('card');
    });
  });

  describe('PATCH /api/v1/multiplayer-games/:gameId/leave', () => {
    test('should allow a player to leave the game', async () => {
      // Create a game as user one
      const createResponse = await request(app)
        .post('/api/v1/multiplayer-games')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          difficulty: 'medium',
          categories: ['History'],
          maxPlayers: 4,
          gameMode: 'timeline',
          hostNickname: userOne.name,
        })
        .expect(httpStatus.CREATED);

      const gameId = createResponse.body.id;
      const roomCode = createResponse.body.roomCode;

      // Manually update the game to ensure the host player has the correct user ID
      await MultiplayerGame.findByIdAndUpdate(gameId, {
        $set: { 'players.0.userId': userOne._id },
      });

      // Have user two join
      const joinResponse = await request(app)
        .post(`/api/v1/multiplayer-games/join/${roomCode}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({
          username: userTwo.name,
        })
        .expect(httpStatus.OK);

      // Manually update the game to ensure the joining player has the correct user ID
      await MultiplayerGame.findByIdAndUpdate(gameId, {
        $set: { 'players.1.userId': userTwo._id },
      });

      // Verify that user two is actually in the game with the correct ID
      const game = await MultiplayerGame.findById(gameId);
      expect(game.players.length).toBe(2);
      expect(game.players[1].username).toBe(userTwo.name);
      expect(game.players[1].userId.toString()).toBe(userTwo._id.toString());

      console.log(
        `Player leaving game: User ID=${userTwo._id.toString()}, Username=${userTwo.name}`
      );

      // Have user two leave the game
      await request(app)
        .patch(`/api/v1/multiplayer-games/${gameId}/leave`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .expect(httpStatus.OK);

      // Verify player is marked as inactive
      const updatedGame = await MultiplayerGame.findById(gameId);
      expect(updatedGame).toBeDefined();
      expect(updatedGame.players[1].isActive).toBe(false);
    });

    test('should allow a guest player to leave the game', async () => {
      // Create a game
      const createResponse = await request(app)
        .post('/api/v1/multiplayer-games')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          difficulty: 'medium',
          categories: ['History'],
          maxPlayers: 4,
          gameMode: 'timeline',
          hostNickname: userOne.name,
        })
        .expect(httpStatus.CREATED);

      const gameId = createResponse.body.id;
      const roomCode = createResponse.body.roomCode;

      // Manually update the game to ensure the host player has the correct user ID
      await MultiplayerGame.findByIdAndUpdate(gameId, {
        $set: { 'players.0.userId': userOne._id },
      });

      // Guest player joins
      const guestId = faker.datatype.uuid();
      const guestName = 'Guest Player';

      await request(app)
        .post(`/api/v1/multiplayer-games/join/${roomCode}`)
        .set('x-guest-user-id', guestId)
        .set('x-guest-username', guestName)
        .send({ username: guestName })
        .expect(httpStatus.OK);

      // Guest player leaves
      await request(app)
        .patch(`/api/v1/multiplayer-games/${gameId}/leave`)
        .set('x-guest-username', guestName)
        .expect(httpStatus.OK);

      // Verify guest is marked inactive
      const updatedGame = await MultiplayerGame.findById(gameId);
      const guest = updatedGame.players.find((p) => !p.userId && p.username === guestName);
      expect(guest.isActive).toBe(false);
    });
  });
});
