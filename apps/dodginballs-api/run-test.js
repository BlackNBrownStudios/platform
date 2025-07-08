const { spawnSync } = require('child_process');

// Run the test
const result = spawnSync('npx', ['jest', 'tests/unit/statistics.test.js', '--no-cache'], {
  env: { ...process.env, JWT_SECRET: 'test_jwt_secret' },
  stdio: 'inherit'
});

// Log the exit code
console.log(`Test exited with code: ${result.status}`);
