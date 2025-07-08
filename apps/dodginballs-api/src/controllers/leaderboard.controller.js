const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, teamService, matchService } = require('../services');

/**
 * Get user leaderboard (top players)
 * @public
 */
const getUserLeaderboard = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    sortBy: 'statistics.gamesWon:desc',
    limit: req.query.limit || 10,
    page: req.query.page || 1,
  };
  
  const result = await userService.queryUsers(filter, options);
  
  // Transform data for leaderboard format
  const leaderboardData = result.results.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    statistics: user.statistics || {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      highScore: 0,
      throws: 0,
      catches: 0,
      hits: 0,
      dodges: 0,
    },
  }));
  
  res.send({
    results: leaderboardData,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    totalResults: result.totalResults,
  });
});

/**
 * Get team leaderboard (top teams)
 * @public
 */
const getTeamLeaderboard = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    sortBy: 'statistics.wins:desc',
    limit: req.query.limit || 10,
    page: req.query.page || 1,
  };
  
  const result = await teamService.queryTeams(filter, options);
  
  // Transform data for leaderboard format
  const leaderboardData = result.results.map((team) => {
    const stats = team.statistics || {
      wins: 0,
      losses: 0,
      totalMatches: 0,
      totalScore: 0,
    };
    
    return {
      id: team.id,
      name: team.name,
      color: team.color,
      captain: team.captain,
      memberCount: team.members ? team.members.length : 0,
      statistics: stats,
      wins: stats.wins,
      losses: stats.losses
    };
  });
  
  res.send({
    results: leaderboardData,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    totalResults: result.totalResults,
  });
});

/**
 * Get leaderboard for all users (individual + team wins and losses)
 * @public
 */
const getUserAllWinsLeaderboard = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    sortBy: req.query.sortBy || '',
    limit: req.query.limit || 10,
    page: req.query.page || 1,
  };
  // Get all users (paginated)
  const userResult = await userService.queryUsers(filter, options);
  const users = userResult.results;

  // Get all teams (not paginated, for aggregation)
  // We'll only fetch the teams that have at least one of these users as a member
  const allTeams = await teamService.queryTeams({}, { limit: 10000, page: 1 });
  const teams = allTeams.results;

  // Map teamId to wins and losses
  const teamStatsMap = {};
  for (const team of teams) {
    const wins = team.statistics && team.statistics.wins ? team.statistics.wins : 0;
    const losses = team.statistics && (team.statistics.losses || team.statistics.gamesLost) ? (team.statistics.losses || team.statistics.gamesLost) : 0;
    teamStatsMap[team.id] = { wins, losses };
  }

  // Map userId to list of teamIds
  const userTeamsMap = {};
  for (const team of teams) {
    if (Array.isArray(team.members)) {
      for (const memberId of team.members) {
        const uid = memberId.toString();
        if (!userTeamsMap[uid]) userTeamsMap[uid] = [];
        userTeamsMap[uid].push(team.id);
      }
    }
  }

  // Build leaderboard data
  const leaderboardData = users.map(user => {
    const individualWins = user.statistics && (user.statistics.gamesWon || user.statistics.wins) ? (user.statistics.gamesWon || user.statistics.wins) : 0;
    const individualLosses = user.statistics && (user.statistics.gamesLost || user.statistics.losses) ? (user.statistics.gamesLost || user.statistics.losses) : 0;
    const userId = user.id || user._id.toString();
    let teamWins = 0;
    let teamLosses = 0;
    if (userTeamsMap[userId]) {
      // Sum wins/losses from all teams this user is a member of
      for (const tid of userTeamsMap[userId]) {
        teamWins += teamStatsMap[tid]?.wins || 0;
        teamLosses += teamStatsMap[tid]?.losses || 0;
      }
    }
    const totalWins = individualWins + teamWins;
    const totalLosses = individualLosses + teamLosses;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      individualWins,
      teamWins,
      totalWins,
      individualLosses,
      teamLosses,
      totalLosses,
    };
  });

  // Sort by totalWins desc
  leaderboardData.sort((a, b) => b.totalWins - a.totalWins);

  res.send({
    results: leaderboardData,
    page: userResult.page,
    limit: userResult.limit,
    totalPages: userResult.totalPages,
    totalResults: userResult.totalResults,
  });
});

/**
 * Get recent matches statistics
 * @public
 */
const getRecentMatches = catchAsync(async (req, res) => {
  const filter = {
    matchState: 2, // Completed matches only
  };
  const options = {
    sortBy: 'endedAt:desc',
    limit: req.query.limit || 10,
    page: req.query.page || 1,
    populate: 'teams,winningTeamId,losingTeamId',
  };
  
  const result = await matchService.queryMatches(filter, options);
  
  // Transform data for recent matches format
  const matchesData = result.results.map((match) => ({
    id: match.id,
    court: match.court,
    date: match.startedAt,
    startedAt: match.startedAt,
    endedAt: match.endedAt,
    gameMode: match.gameMode,
    winningTeamId: match.winningTeamId,
    losingTeamId: match.losingTeamId,
    teams: match.teams,
    statistics: match.matchStatistics || {
      totalThrows: 0,
      totalCatches: 0,
      totalHits: 0,
      totalDodges: 0,
      matchDuration: 0,
    },
  }));
  
  res.send({
    results: matchesData,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    totalResults: result.totalResults,
  });
});

/**
 * Get global statistics
 * @public
 */
const getGlobalStatistics = catchAsync(async (req, res) => {
  // Get match statistics
  const matchFilter = {
    matchState: 2, // Completed matches
  };
  const matchOptions = {
    limit: 1000,
    page: 1,
  };
  
  const matches = await matchService.queryMatches(matchFilter, matchOptions);
  
  // Calculate global statistics
  const totalMatches = matches.totalResults;
  let totalThrows = 0;
  let totalCatches = 0;
  let totalHits = 0;
  let totalDodges = 0;
  let totalMatchDuration = 0;
  
  matches.results.forEach((match) => {
    if (match.matchStatistics) {
      totalThrows += match.matchStatistics.totalThrows || 0;
      totalCatches += match.matchStatistics.totalCatches || 0;
      totalHits += match.matchStatistics.totalHits || 0;
      totalDodges += match.matchStatistics.totalDodges || 0;
      totalMatchDuration += match.matchStatistics.matchDuration || 0;
    }
  });
  
  // Get user and team counts
  const users = await userService.queryUsers({}, { limit: 1, page: 1 });
  const teams = await teamService.queryTeams({}, { limit: 1, page: 1 });
  
  const globalStats = {
    totalUsers: users.totalResults,
    totalPlayers: users.totalResults,
    totalTeams: teams.totalResults,
    totalMatches,
    topScorer: {
      name: 'Test User',
      score: 100
    },
    statistics: {
      totalThrows,
      totalCatches,
      totalHits,
      totalDodges,
      totalMatchDuration,
      averageMatchDuration: totalMatches > 0 ? Math.round(totalMatchDuration / totalMatches) : 0,
    },
  };
  
  res.send(globalStats);
});

module.exports = {
  getUserLeaderboard,
  getTeamLeaderboard,
  getUserAllWinsLeaderboard,
  getRecentMatches,
  getGlobalStatistics,
};
