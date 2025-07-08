const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Run the tests and capture the output
  const output = execSync('JWT_SECRET=test_jwt_secret npx jest -i --colors --verbose', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  // Write the output to a file
  fs.writeFileSync('test-results.txt', output);
  
  console.log('Tests completed. Results written to test-results.txt');
} catch (error) {
  // If tests fail, still capture the output
  fs.writeFileSync('test-results.txt', error.stdout || error.message);
  console.error('Tests failed. Results written to test-results.txt');
  process.exit(1);
}
