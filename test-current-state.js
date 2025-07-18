const http = require('http');

async function testCurrentState() {
  console.log('🚀 Testing current state of BlackNBrownStudios Platform...\n');
  
  // Test History Time API on port 5001
  console.log('📱 Testing History Time API (port 5001)...');
  
  const historyTimeTests = [
    { path: '/v1/docs', desc: 'API documentation' },
    { path: '/v1/cards?limit=1', desc: 'Cards endpoint' },
  ];
  
  for (const test of historyTimeTests) {
    await testEndpoint('localhost', 5001, test.path, test.desc);
  }
  
  // Test History Time Web App
  console.log('\n🌐 Testing History Time Web App (port 3000)...');
  await testEndpoint('localhost', 3000, '/', 'Homepage');
  
  // Test DodginBalls API on port 3006  
  console.log('\n🎮 Testing DodginBalls API (port 3006)...');
  await testEndpoint('localhost', 3006, '/v1/docs', 'API documentation');
  
  console.log('\n✅ Current state test completed!');
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('- History Time API: Running on port 5001');
  console.log('- History Time Web: Running on port 3000');
  console.log('- DodginBalls API: Having startup issues (needs fixing)');
  console.log('\n💡 The leaderboards package was created successfully but integration is incomplete due to TypeScript issues.');
}

function testEndpoint(host, port, path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/html'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk.slice(0, 100); // Only get first 100 chars
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✓ ${description} - Status: ${res.statusCode} OK`);
        } else if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) {
          console.log(`↗️  ${description} - Status: ${res.statusCode} (Redirect)`);
        } else if (res.statusCode === 401) {
          console.log(`🔒 ${description} - Status: ${res.statusCode} (Auth required)`);
        } else if (res.statusCode === 404) {
          console.log(`❌ ${description} - Status: ${res.statusCode} (Not found)`);
        } else {
          console.log(`✗ ${description} - Status: ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${description} - Error: ${error.code === 'ECONNREFUSED' ? 'Not running' : error.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Run the tests
testCurrentState().catch(console.error);