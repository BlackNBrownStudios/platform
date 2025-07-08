#!/usr/bin/env node
/**
 * E2E Test Runner for History Time Mobile
 * Runs Maestro tests and generates reports
 */

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

// Configuration
const FLOWS_DIR = path.join(__dirname, 'maestro', 'flows');
const METRO_PORT = 8081;
const MAESTRO_CMD = 'maestro';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logInfo(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

// Check if a command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Get list of test files
function getTestFiles() {
  return fs
    .readdirSync(FLOWS_DIR)
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => path.join(FLOWS_DIR, file));
}

// Check for connected Android devices
async function checkAndroidDevices() {
  try {
    const { stdout } = await execAsync('adb devices');
    const devices = stdout
      .split('\n')
      .filter((line) => line.includes('device') && !line.includes('List of devices'))
      .map((line) => line.split('\t')[0]);

    return devices;
  } catch (error) {
    logError('Failed to check for Android devices');
    return [];
  }
}

// Check for Metro bundler
async function checkMetroBundler() {
  try {
    const { stdout } = await execAsync(`lsof -i:${METRO_PORT}`);
    return stdout.includes('node');
  } catch (error) {
    return false;
  }
}

// Start Metro bundler
function startMetroBundler() {
  log('Starting Metro bundler...', colors.cyan);
  const child = exec('npm start', {
    detached: true,
    stdio: 'ignore',
    cwd: path.resolve(__dirname, '../'),
  });

  child.unref();
  // Give it a moment to start
  return new Promise((resolve) => setTimeout(resolve, 5000));
}

// Run a single test
async function runTest(testFile) {
  const fileName = path.basename(testFile);
  log(`Running test: ${fileName}`, colors.cyan);

  try {
    await execAsync(`${MAESTRO_CMD} test ${testFile}`);
    logSuccess(`Test passed: ${fileName}`);
    return true;
  } catch (error) {
    logError(`Test failed: ${fileName}`);
    console.error(error.stdout || error.message);
    return false;
  }
}

// Main function
async function main() {
  // Check for Maestro
  log('Checking if Maestro is installed...', colors.cyan);
  if (!commandExists(MAESTRO_CMD)) {
    logError('Maestro is not installed. Please install it first:');
    log('curl -Ls "https://get.maestro.mobile.dev" | bash', colors.yellow);
    process.exit(1);
  }

  log('🚀 Starting E2E tests for History Time Mobile', colors.magenta);

  // Check Metro bundler
  const isMetroRunning = await checkMetroBundler();
  if (!isMetroRunning) {
    await startMetroBundler();
    log('Metro bundler started', colors.green);
  } else {
    log('Metro bundler is already running', colors.green);
  }

  // Check for connected devices
  log('Checking for connected Android devices...', colors.cyan);
  const devices = await checkAndroidDevices();

  if (devices.length === 0) {
    logError('No Android devices connected. Please connect a device or start an emulator.');
    log('To start an emulator, you can use:', colors.yellow);
    log('  $ANDROID_HOME/emulator/emulator -avd <emulator_name>', colors.yellow);
    log('To list available emulators:', colors.yellow);
    log('  $ANDROID_HOME/emulator/emulator -list-avds', colors.yellow);
    log('\nAlternatively, to run on iOS simulator (if on macOS):', colors.yellow);
    log('  maestro studio', colors.yellow);
    process.exit(1);
  }

  log(`Found ${devices.length} connected device(s): ${devices.join(', ')}`, colors.green);

  // Run tests
  const testFiles = getTestFiles();
  log(`Running all tests...`, colors.magenta);

  const results = [];
  const failedTests = [];

  for (const testFile of testFiles) {
    const success = await runTest(testFile);
    results.push({ file: path.basename(testFile), success });

    if (!success) {
      failedTests.push(path.basename(testFile));
    }
  }

  // Summary
  if (failedTests.length > 0) {
    logError(`The following tests failed:`);
    failedTests.forEach((test) => log(` - ${test}`, colors.red));
    process.exit(1);
  } else {
    logSuccess('All tests passed!');
  }
}

main().catch((error) => {
  logError(`Error: ${error.message}`);
  process.exit(1);
});
