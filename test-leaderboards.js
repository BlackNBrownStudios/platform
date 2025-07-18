const axios = require('axios');

// Configuration
const HISTORY_TIME_API = 'http://localhost:5001';
const DODGINBALLS_API = 'http://localhost:5002';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

// Helper to register and login
async function authenticateUser(apiUrl) {
  try {
    // Try to register first
    await axios.post(`${apiUrl}/v1/auth/register`, testUser);
    console.log(`✓ Registered user at ${apiUrl}`);
  } catch (error) {
    // User might already exist, that's ok
    if (error.response?.status !== 400) {
      console.error(`✗ Registration failed at ${apiUrl}:`, error.response?.data?.message || error.message);
    }
  }

  // Login
  try {
    const loginResponse = await axios.post(`${apiUrl}/v1/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const { token } = loginResponse.data;
    console.log(`✓ Logged in at ${apiUrl}`);
    return token;
  } catch (error) {
    console.error(`✗ Login failed at ${apiUrl}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

// Test History Time API Leaderboards
async function testHistoryTimeLeaderboards(token) {
  console.log('\n🎮 Testing History Time API Leaderboards...');
  
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Create a leaderboard
    const leaderboardData = {
      gameId: 'history-time',
      name: 'High Scores',
      description: 'All-time high scores for History Time',
      type: 'alltime',
      scoreType: 'highest'
    };
    
    const createResponse = await axios.post(
      `${HISTORY_TIME_API}/v1/leaderboards`,
      leaderboardData,
      { headers }
    );
    
    const leaderboard = createResponse.data;
    console.log(`✓ Created leaderboard: ${leaderboard.name} (${leaderboard._id})`);
    
    // Update score
    const scoreData = {
      score: 1500,
      metadata: { level: 10, cards: 15 }
    };
    
    const scoreResponse = await axios.post(
      `${HISTORY_TIME_API}/v1/leaderboards/${leaderboard._id}/scores`,
      scoreData,
      { headers }
    );
    
    console.log(`✓ Updated score: ${scoreResponse.data.score} (rank: ${scoreResponse.data.rank || 'calculating...'})`);
    
    // Get rankings
    const rankingsResponse = await axios.get(
      `${HISTORY_TIME_API}/v1/leaderboards/${leaderboard._id}/rankings`,
      { headers }
    );
    
    console.log(`✓ Retrieved rankings: ${rankingsResponse.data.results?.length || rankingsResponse.data.length} entries`);
    
    // Get all leaderboards
    const allLeaderboardsResponse = await axios.get(
      `${HISTORY_TIME_API}/v1/leaderboards?gameId=history-time`,
      { headers }
    );
    
    console.log(`✓ Total leaderboards for History Time: ${allLeaderboardsResponse.data.results?.length || allLeaderboardsResponse.data.length}`);
    
  } catch (error) {
    console.error('✗ History Time leaderboard test failed:', error.response?.data?.message || error.message);
  }
}

// Test DodginBalls API Leaderboards
async function testDodginBallsLeaderboards(token) {
  console.log('\n🏐 Testing DodginBalls API Leaderboards...');
  
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Create a leaderboard
    const leaderboardData = {
      gameId: 'dodginballs',
      name: 'Match Wins',
      description: 'Total match wins in DodginBalls',
      type: 'alltime',
      scoreType: 'cumulative'
    };
    
    const createResponse = await axios.post(
      `${DODGINBALLS_API}/v1/leaderboards`,
      leaderboardData,
      { headers }
    );
    
    const leaderboard = createResponse.data;
    console.log(`✓ Created leaderboard: ${leaderboard.name} (${leaderboard._id})`);
    
    // Update score (add a win)
    const scoreData = {
      score: 1,
      metadata: { matchId: '123', team: 'Red Team' }
    };
    
    const scoreResponse = await axios.post(
      `${DODGINBALLS_API}/v1/leaderboards/${leaderboard._id}/scores`,
      scoreData,
      { headers }
    );
    
    console.log(`✓ Updated score: ${scoreResponse.data.score} total wins`);
    
    // Test custom game leaderboard endpoints
    console.log('\n  Testing DodginBalls custom leaderboards...');
    
    const customLeaderboardResponse = await axios.get(
      `${DODGINBALLS_API}/v1/game-leaderboard/users`,
      { headers }
    );
    
    console.log(`  ✓ Custom user leaderboard: ${customLeaderboardResponse.data.results?.length || 0} entries`);
    
  } catch (error) {
    console.error('✗ DodginBalls leaderboard test failed:', error.response?.data?.message || error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Leaderboard API Tests...\n');
  
  try {
    // Test History Time API
    console.log('📚 Connecting to History Time API...');
    const historyToken = await authenticateUser(HISTORY_TIME_API);
    await testHistoryTimeLeaderboards(historyToken);
    
    // Test DodginBalls API
    console.log('\n🏐 Connecting to DodginBalls API...');
    const dodginToken = await authenticateUser(DODGINBALLS_API);
    await testDodginBallsLeaderboards(dodginToken);
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Check if APIs are ready
async function waitForAPIs() {
  console.log('⏳ Waiting for APIs to be ready...');
  
  const checkAPI = async (url, name) => {
    for (let i = 0; i < 30; i++) {
      try {
        await axios.get(`${url}/v1/docs/`);
        console.log(`✓ ${name} is ready`);
        return true;
      } catch (error) {
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    console.log(`\n✗ ${name} did not start in time`);
    return false;
  };
  
  const historyReady = await checkAPI(HISTORY_TIME_API, 'History Time API');
  const dodginReady = await checkAPI(DODGINBALLS_API, 'DodginBalls API');
  
  if (!historyReady || !dodginReady) {
    throw new Error('APIs are not ready');
  }
}

// Run the tests
(async () => {
  try {
    await waitForAPIs();
    await runTests();
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
})();