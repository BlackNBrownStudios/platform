const http = require('http');

async function testAPIs() {
  console.log('🚀 Testing backend APIs directly...\n');
  
  // Test History Time API
  console.log('📱 Testing History Time API...');
  
  const historyTimeTests = [
    { path: '/v1/docs/', desc: 'API documentation' },
    { path: '/v1/cards?limit=1', desc: 'Cards endpoint' },
    { path: '/v1/games', desc: 'Games endpoint' },
  ];
  
  for (const test of historyTimeTests) {
    await testEndpoint('localhost', 3001, test.path, test.desc);
  }
  
  // Test DodginBalls API
  console.log('\n🎮 Testing DodginBalls API...');
  
  const dodginBallsTests = [
    { path: '/v1/docs/', desc: 'API documentation' },
    { path: '/v1/games', desc: 'Games endpoint' },
    { path: '/v1/teams', desc: 'Teams endpoint' },
  ];
  
  for (const test of dodginBallsTests) {
    await testEndpoint('localhost', 3002, test.path, test.desc);
  }
  
  console.log('\n✅ API tests completed!');
}

function testEndpoint(host, port, path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✓ ${description} - Status: ${res.statusCode}`);
        } else if (res.statusCode === 401) {
          console.log(`⚠️  ${description} - Status: ${res.statusCode} (Authentication required)`);
        } else {
          console.log(`✗ ${description} - Status: ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`✗ ${description} - Error: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Run the tests
testAPIs().catch(console.error);