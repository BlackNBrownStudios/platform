const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../setup');
const { User, Lobby, Team } = require('../../src/models');
const { userOne, userTwo, userThree } = require('../fixtures/user.fixture');
const { teamOne, teamTwo } = require('../fixtures/team.fixture');
const { lobbyOne, lobbyTwo, lobbyThree } = require('../fixtures/lobby.fixture');

// Set up the test database
setupTestDB();

describe('Lobby routes', () => {
  let userOneAccessToken;
  let userTwoAccessToken;
  let userThreeAccessToken;

  beforeEach(async () => {
    // Create test users with known passwords
    const testUserOne = {
      _id: userOne._id,
      name: userOne.name,
      email: userOne.email,
      password: 'Password123',
      role: 'admin', // Use admin role for permissions
      statistics: userOne.statistics
    };

    const testUserTwo = {
      _id: userTwo._id,
      name: userTwo.name,
      email: userTwo.email,
      password: 'Password123',
      role: 'admin', // Use admin role for permissions
      statistics: userTwo.statistics
    };

    const testUserThree = {
      _id: userThree._id,
      name: userThree.name,
      email: userThree.email,
      password: 'Password123',
      role: 'user',
      statistics: userThree.statistics
    };

    await User.create(testUserOne);
    await User.create(testUserTwo);
    await User.create(testUserThree);
    await Team.create(teamOne);
    await Team.create(teamTwo);
    await Lobby.create(lobbyOne);
    await Lobby.create(lobbyTwo);
    
    // Get JWT tokens for testing authenticated routes
    const loginResponse1 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUserOne.email, password: 'Password123' });
    userOneAccessToken = loginResponse1.body.tokens.access.token;
    
    const loginResponse2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUserTwo.email, password: 'Password123' });
    userTwoAccessToken = loginResponse2.body.tokens.access.token;
    
    const loginResponse3 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUserThree.email, password: 'Password123' });
    userThreeAccessToken = loginResponse3.body.tokens.access.token;
  });

  describe('POST /api/v1/lobbies', () => {
    test('should return 201 and successfully create a new lobby if data is valid', async () => {
      const newLobby = {
        name: 'New Test Lobby',
        maxPlayers: 4,
        gameSettings: {
          gameMode: 'standard',
          teamSize: 2,
          duration: 300,
          court: 'standard'
        },
        isPrivate: false,
        region: 'us-west'
      };

      const res = await request(app)
        .post('/api/v1/lobbies')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newLobby)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newLobby.name);
      expect(res.body.host).toBe(userOne._id.toString());
      expect(res.body.players).toContain(userOne._id.toString());
      expect(res.body.maxPlayers).toBe(newLobby.maxPlayers);
      expect(res.body.status).toBe('waiting');
      expect(res.body.gameSettings.gameMode).toBe(newLobby.gameSettings.gameMode);
    });

    test('should return 400 error if lobby name is invalid', async () => {
      const newLobby = {
        name: 'AB', // Too short
        maxPlayers: 4,
        gameSettings: {
          gameMode: 'standard',
          teamSize: 2,
          duration: 300,
          court: 'standard'
        }
      };

      await request(app)
        .post('/api/v1/lobbies')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newLobby)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      const newLobby = {
        name: 'New Test Lobby',
        maxPlayers: 4,
        gameSettings: {
          gameMode: 'standard',
          teamSize: 2,
          duration: 300,
          court: 'standard'
        }
      };

      await request(app)
        .post('/api/v1/lobbies')
        .send(newLobby)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/lobbies', () => {
    test('should return 200 and apply the default query options', async () => {
      const res = await request(app)
        .get('/api/v1/lobbies')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalResults');
      
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.some(lobby => lobby.name === lobbyOne.name)).toBe(true);
      expect(res.body.results.some(lobby => lobby.name === lobbyTwo.name)).toBe(true);
    });

    test('should correctly apply filter on name field', async () => {
      const res = await request(app)
        .get('/api/v1/lobbies')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ name: lobbyOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.every(lobby => lobby.name === lobbyOne.name)).toBe(true);
    });

    test('should limit returned array if limit param is specified', async () => {
      const res = await request(app)
        .get('/api/v1/lobbies')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBe(1);
      expect(res.body.limit).toBe(1);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get('/api/v1/lobbies')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/lobbies/active', () => {
    test('should return 200 and active lobbies', async () => {
      const res = await request(app)
        .get('/api/v1/lobbies/active')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.every(lobby => lobby.status === 'waiting')).toBe(true);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get('/api/v1/lobbies/active')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/lobbies/:lobbyId', () => {
    test('should return 200 and the lobby object if data is valid', async () => {
      const res = await request(app)
        .get(`/api/v1/lobbies/${lobbyOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.id).toBe(lobbyOne._id.toString());
      expect(res.body.name).toBe(lobbyOne.name);
      expect(res.body.host).toBe(lobbyOne.host.toString());
      expect(res.body.status).toBe(lobbyOne.status);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .get(`/api/v1/lobbies/${lobbyOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if lobbyId is not a valid ObjectId', async () => {
      await request(app)
        .get('/api/v1/lobbies/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if lobby is not found', async () => {
      await request(app)
        .get(`/api/v1/lobbies/${lobbyOne._id.toString().replace(/\w/g, '5')}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/v1/lobbies/:lobbyId', () => {
    test('should return 200 and successfully update lobby if data is ok', async () => {
      const updateBody = {
        name: 'Updated Lobby Name',
        maxPlayers: 6,
        gameSettings: {
          gameMode: 'tournament',
          teamSize: 3
        }
      };

      const res = await request(app)
        .patch(`/api/v1/lobbies/${lobbyOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body.id).toBe(lobbyOne._id.toString());
      expect(res.body.name).toBe(updateBody.name);
      expect(res.body.maxPlayers).toBe(updateBody.maxPlayers);
      expect(res.body.gameSettings.gameMode).toBe(updateBody.gameSettings.gameMode);
      expect(res.body.gameSettings.teamSize).toBe(updateBody.gameSettings.teamSize);

      const dbLobby = await Lobby.findById(lobbyOne._id);
      expect(dbLobby).toBeDefined();
      expect(dbLobby.name).toBe(updateBody.name);
      expect(dbLobby.maxPlayers).toBe(updateBody.maxPlayers);
      expect(dbLobby.gameSettings.gameMode).toBe(updateBody.gameSettings.gameMode);
      expect(dbLobby.gameSettings.teamSize).toBe(updateBody.gameSettings.teamSize);
    });

    test('should return 401 error if access token is missing', async () => {
      const updateBody = { name: 'Updated Lobby Name' };

      await request(app)
        .patch(`/api/v1/lobbies/${lobbyOne._id}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is not admin or lobby host', async () => {
      const updateBody = { name: 'Updated Lobby Name' };

      await request(app)
        .patch(`/api/v1/lobbies/${lobbyTwo._id}`) // lobbyTwo is hosted by userThree
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if lobby is not found', async () => {
      const updateBody = { name: 'Updated Lobby Name' };

      await request(app)
        .patch(`/api/v1/lobbies/${lobbyOne._id.toString().replace(/\w/g, '5')}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /api/v1/lobbies/:lobbyId', () => {
    test('should return 200 and successfully delete lobby', async () => {
      await request(app)
        .delete(`/api/v1/lobbies/${lobbyOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      const dbLobby = await Lobby.findById(lobbyOne._id);
      expect(dbLobby).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete(`/api/v1/lobbies/${lobbyOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is not admin or lobby host', async () => {
      await request(app)
        .delete(`/api/v1/lobbies/${lobbyTwo._id}`) // lobbyTwo is hosted by userThree
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if lobby is not found', async () => {
      await request(app)
        .delete(`/api/v1/lobbies/${lobbyOne._id.toString().replace(/\w/g, '5')}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /api/v1/lobbies/:lobbyId/join', () => {
    test('should return 200 and successfully join a lobby', async () => {
      // First, create a new lobby for testing
      const newLobby = await Lobby.create({
        name: 'Join Test Lobby',
        host: userOne._id,
        players: [userOne._id],
        maxPlayers: 4,
        status: 'waiting',
        gameSettings: {
          gameMode: 'standard',
          teamSize: 2,
          duration: 300,
          court: 'standard'
        }
      });

      const res = await request(app)
        .post(`/api/v1/lobbies/${newLobby._id}/join`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.players).toContain(userTwo._id.toString());

      const dbLobby = await Lobby.findById(newLobby._id);
      expect(dbLobby.players).toContainEqual(userTwo._id);
    });

    test('should return 400 if lobby is full', async () => {
      // Create a full lobby
      const fullLobby = await Lobby.create({
        name: 'Full Lobby',
        host: userOne._id,
        players: [userOne._id, userTwo._id],
        maxPlayers: 2, // Already full
        status: 'waiting',
        gameSettings: {
          gameMode: 'standard',
          teamSize: 2,
          duration: 300,
          court: 'standard'
        }
      });

      await request(app)
        .post(`/api/v1/lobbies/${fullLobby._id}/join`)
        .set('Authorization', `Bearer ${userThreeAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if player is already in lobby', async () => {
      await request(app)
        .post(`/api/v1/lobbies/${lobbyOne._id}/join`)
        .set('Authorization', `Bearer ${userOneAccessToken}`) // userOne is already in lobbyOne
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .post(`/api/v1/lobbies/${lobbyOne._id}/join`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /api/v1/lobbies/:lobbyId/leave', () => {
    test('should return 200 and successfully leave a lobby', async () => {
      const res = await request(app)
        .post(`/api/v1/lobbies/${lobbyOne._id}/leave`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.players).not.toContain(userTwo._id.toString());

      const dbLobby = await Lobby.findById(lobbyOne._id);
      expect(dbLobby.players).not.toContainEqual(userTwo._id);
    });

    test('should return 400 if player is not in lobby', async () => {
      await request(app)
        .post(`/api/v1/lobbies/${lobbyTwo._id}/leave`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`) // userTwo is not in lobbyTwo
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .post(`/api/v1/lobbies/${lobbyOne._id}/leave`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /api/v1/lobbies/:lobbyId/start-match', () => {
    test('should return 200 and successfully start a match', async () => {
      const res = await request(app)
        .post(`/api/v1/lobbies/${lobbyOne._id}/start-match`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.status).toBe('in_progress');
      expect(res.body.matchId).toBeDefined();

      const dbLobby = await Lobby.findById(lobbyOne._id);
      expect(dbLobby.status).toBe('in_progress');
      expect(dbLobby.matchId).toBeDefined();
    });

    test('should return 403 if user is not admin or lobby host', async () => {
      await request(app)
        .post(`/api/v1/lobbies/${lobbyTwo._id}/start-match`) // lobbyTwo is hosted by userThree
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .post(`/api/v1/lobbies/${lobbyOne._id}/start-match`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /api/v1/lobbies/:lobbyId/end-match', () => {
    test('should return 200 and successfully end a match', async () => {
      // First, create a lobby with an in-progress match
      const inProgressLobby = await Lobby.create({
        ...lobbyThree,
        status: 'in_progress',
        matchId: new mongoose.Types.ObjectId()
      });

      const res = await request(app)
        .post(`/api/v1/lobbies/${inProgressLobby._id}/end-match`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`) // userTwo is the host
        .send()
        .expect(httpStatus.OK);

      expect(res.body.status).toBe('finished');

      const dbLobby = await Lobby.findById(inProgressLobby._id);
      expect(dbLobby.status).toBe('finished');
    });

    test('should return 400 if lobby is not in progress', async () => {
      await request(app)
        .post(`/api/v1/lobbies/${lobbyOne._id}/end-match`) // lobbyOne is in 'waiting' status
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 403 if user is not admin or lobby host', async () => {
      // First, create a lobby with an in-progress match
      const inProgressLobby = await Lobby.create({
        ...lobbyThree,
        status: 'in_progress',
        matchId: new mongoose.Types.ObjectId()
      });

      await request(app)
        .post(`/api/v1/lobbies/${inProgressLobby._id}/end-match`)
        .set('Authorization', `Bearer ${userThreeAccessToken}`) // userThree is not the host
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .post(`/api/v1/lobbies/${lobbyOne._id}/end-match`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
