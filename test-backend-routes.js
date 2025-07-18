const http = require('http');

async function testBackendRoutes() {
  console.log('🚀 Testing backend routes for both apps...\n');
  
  // Test History Time API
  console.log('📱 Testing History Time API (port 3001)...');
  
  const historyTimeTests = [
    { path: '/v1/docs', desc: 'API documentation' },
    { path: '/v1/auth/register', method: 'POST', desc: 'Auth register endpoint' },
    { path: '/v1/cards', desc: 'Cards endpoint (requires auth)' },
    { path: '/v1/games', desc: 'Games endpoint (requires auth)' },
    { path: '/v1/users', desc: 'Users endpoint (requires auth)' },
    { path: '/v1/leaderboards', desc: 'Leaderboards endpoint' },
  ];
  
  for (const test of historyTimeTests) {
    await testEndpoint('localhost', 3001, test.path, test.desc, test.method);
  }
  
  // Test DodginBalls API
  console.log('\n🎮 Testing DodginBalls API (port 3006)...');
  
  const dodginBallsTests = [
    { path: '/v1/docs', desc: 'API documentation' },
    { path: '/v1/auth/register', method: 'POST', desc: 'Auth register endpoint' },
    { path: '/v1/games', desc: 'Games endpoint (requires auth)' },
    { path: '/v1/teams', desc: 'Teams endpoint (requires auth)' },
    { path: '/v1/lobbies', desc: 'Lobbies endpoint (requires auth)' },
    { path: '/v1/player-stats', desc: 'Player stats endpoint (requires auth)' },
    { path: '/v1/leaderboards', desc: 'Leaderboards endpoint' },
  ];
  
  for (const test of dodginBallsTests) {
    await testEndpoint('localhost', 3006, test.path, test.desc, test.method);
  }
  
  console.log('\n✅ Backend route tests completed!');
}

function testEndpoint(host, port, path, description, method = 'GET') {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✓ ${description} - Status: ${res.statusCode} OK`);
        } else if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) {
          console.log(`↗️  ${description} - Status: ${res.statusCode} (Redirect to ${res.headers.location})`);
        } else if (res.statusCode === 401) {
          console.log(`🔒 ${description} - Status: ${res.statusCode} (Auth required - expected)`);
        } else if (res.statusCode === 404) {
          console.log(`❌ ${description} - Status: ${res.statusCode} (Not found)`);
        } else if (res.statusCode === 400 && method === 'POST') {
          console.log(`⚠️  ${description} - Status: ${res.statusCode} (Bad request - needs body)`);
        } else {
          console.log(`✗ ${description} - Status: ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${description} - Error: ${error.message}`);
      resolve();
    });
    
    // For POST requests, send empty body
    if (method === 'POST') {
      req.write('{}');
    }
    
    req.end();
  });
}

// Run the tests
testBackendRoutes().catch(console.error);