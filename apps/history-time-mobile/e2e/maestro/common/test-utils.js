/**
 * Test utilities for Maestro tests
 * These functions can be used to prepare test data and handle common test setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Run all Maestro tests in a directory
 * @param {string} directory - Directory containing test files
 */
function runAllTests(directory) {
  const files = fs.readdirSync(directory).filter((file) => file.endsWith('.yaml'));

  const failedTests = [];

  files.forEach((file) => {
    const testPath = path.join(directory, file);
    console.log(`Running test: ${file}`);

    try {
      execSync(`maestro test ${testPath}`, { stdio: 'inherit' });
      console.log(`✅ Test passed: ${file}`);
    } catch (error) {
      console.error(`❌ Test failed: ${file}`);
      failedTests.push(file);
    }
  });

  if (failedTests.length > 0) {
    console.error('The following tests failed:');
    failedTests.forEach((test) => console.error(` - ${test}`));
    process.exit(1);
  } else {
    console.log('All tests passed!');
  }
}

/**
 * Generate test report
 * @param {string} outputDir - Directory to save the report
 */
function generateReport(outputDir) {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate timestamp for report name
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const reportPath = path.join(outputDir, `test-report-${timestamp}.html`);

  // Command assumes maestro has a report generation feature (placeholder)
  execSync(`maestro studio --report ${reportPath}`, { stdio: 'inherit' });

  console.log(`Report generated at: ${reportPath}`);
  return reportPath;
}

module.exports = {
  runAllTests,
  generateReport,
};
