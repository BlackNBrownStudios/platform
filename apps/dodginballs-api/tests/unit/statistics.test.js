const mongoose = require('mongoose');
const { User, Team } = require('../../src/models');
const setupTestDB = require('../setup');

setupTestDB();

describe('Statistics field tests', () => {
  describe('User statistics', () => {
    test('should correctly create a user with statistics field', async () => {
      const userData = {
        name: 'Statistics Test User',
        email: 'stats-test@example.com',
        password: 'Password123',
        role: 'user',
        statistics: {
          gamesPlayed: 10,
          gamesWon: 5,
          totalScore: 500,
          highScore: 150,
          throws: 30,
          catches: 20,
          hits: 15,
          dodges: 10
        }
      };

      const user = await User.create(userData);
      
      // Verify the statistics field exists and has the correct values
      expect(user.statistics).toBeDefined();
      expect(user.statistics.gamesPlayed).toBe(10);
      expect(user.statistics.gamesWon).toBe(5);
      expect(user.statistics.totalScore).toBe(500);
      expect(user.statistics.highScore).toBe(150);
      expect(user.statistics.throws).toBe(30);
      expect(user.statistics.catches).toBe(20);
      expect(user.statistics.hits).toBe(15);
      expect(user.statistics.dodges).toBe(10);
    });
  });

  describe('Team statistics', () => {
    test('should correctly create a team with statistics field', async () => {
      const teamData = {
        name: 'Statistics Test Team',
        color: 'green',
        members: [new mongoose.Types.ObjectId()],
        captain: new mongoose.Types.ObjectId(),
        statistics: {
          wins: 8,
          losses: 2,
          totalMatches: 10,
          totalScore: 400,
          totalThrows: 100,
          totalCatches: 50,
          totalHits: 30,
          totalDodges: 20,
          highestStreak: 5,
          currentStreak: 3
        }
      };

      const team = await Team.create(teamData);
      
      // Verify the statistics field exists and has the correct values
      expect(team.statistics).toBeDefined();
      expect(team.statistics.wins).toBe(8);
      expect(team.statistics.losses).toBe(2);
      expect(team.statistics.totalMatches).toBe(10);
      expect(team.statistics.totalScore).toBe(400);
      expect(team.statistics.totalThrows).toBe(100);
      expect(team.statistics.totalCatches).toBe(50);
      expect(team.statistics.totalHits).toBe(30);
      expect(team.statistics.totalDodges).toBe(20);
      expect(team.statistics.highestStreak).toBe(5);
      expect(team.statistics.currentStreak).toBe(3);
    });

    test('should correctly update team statistics using updateStats method', async () => {
      const teamData = {
        name: 'Stats Update Team',
        color: 'blue',
        members: [new mongoose.Types.ObjectId()],
        captain: new mongoose.Types.ObjectId(),
        statistics: {
          wins: 3,
          losses: 1,
          totalMatches: 4,
          totalScore: 200,
          currentStreak: 2,
          highestStreak: 2
        }
      };

      const team = await Team.create(teamData);
      
      // Update stats with a win
      const matchResult = {
        matchId: new mongoose.Types.ObjectId(),
        result: 'win'
      };
      const opponentTeamId = new mongoose.Types.ObjectId();
      const score = 50;
      
      await team.updateStats(matchResult, opponentTeamId, score);
      
      // Verify the statistics were updated correctly
      expect(team.statistics.totalMatches).toBe(5);
      expect(team.statistics.totalScore).toBe(250);
      expect(team.statistics.wins).toBe(4);
      expect(team.statistics.currentStreak).toBe(3);
      expect(team.statistics.highestStreak).toBe(3);
      
      // Update stats with a loss
      matchResult.result = 'loss';
      await team.updateStats(matchResult, opponentTeamId, score);
      
      // Verify the statistics were updated correctly
      expect(team.statistics.totalMatches).toBe(6);
      expect(team.statistics.totalScore).toBe(300);
      expect(team.statistics.losses).toBe(2);
      expect(team.statistics.currentStreak).toBe(0);
      expect(team.statistics.highestStreak).toBe(3);
    });
  });
});
