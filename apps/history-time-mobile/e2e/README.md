# History Time Mobile E2E Testing

This directory contains end-to-end (E2E) tests for the History Time Mobile application using [Maestro](https://maestro.mobile.dev/), a mobile UI testing framework.

## Prerequisites

Before running the tests, ensure you have:

1. **Maestro** installed:

   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

   Then add Maestro to your PATH:

   ```bash
   export PATH="$PATH":"$HOME/.maestro/bin"
   ```

2. **Android Development Environment**:

   - Android SDK Tools
   - At least one emulator configured or a physical device connected

3. **Node.js and npm** installed (for running the test script)

## Project Structure

```
e2e/
├── maestro/
│   ├── common/         # Common test utilities and shared flows
│   │   ├── base-flow.yaml     # Base flow included by all tests
│   │   └── actions.yaml       # Reusable action flows
│   └── flows/          # Test flows
│       ├── card-placement-test.yaml
│       ├── game-flow-test.yaml
│       └── navigation-test.yaml
├── run-e2e-tests.js    # Script to run all tests
└── README.md           # This file
```

## Running Tests

### Start an Android Emulator

Before running tests, make sure you have an Android emulator running or a physical device connected:

```bash
# List available emulators
$ANDROID_HOME/emulator/emulator -list-avds

# Start an emulator
$ANDROID_HOME/emulator/emulator -avd <emulator_name>
```

### Run All Tests

To run all E2E tests:

```bash
npm run test:e2e
```

This script will:

1. Check if Maestro is installed
2. Start Metro bundler if not already running
3. Verify connected Android devices
4. Run all tests in the `flows` directory
5. Report results

### Run a Specific Test

To run a specific test directly using Maestro:

```bash
cd HistoryTimeMobile
maestro test e2e/maestro/flows/navigation-test.yaml
```

## Creating Tests

### Test Structure

Each test file should follow this structure:

```yaml
appId: com.historytime.mobile
---
- launchApp

# Your test commands go here
- assertVisible: 'Text on screen'
- tapOn: 'Button text'
```

### Common Commands

- `launchApp` - Launch the application
- `tapOn: "Text"` - Tap on an element containing text
- `assertVisible: "Text"` - Assert an element with text is visible
- `back` - Press the back button
- `inputText: "Text"` - Type text into a focused field

### Best Practices

1. Keep test files focused on testing one feature or flow
2. Use descriptive comments to explain test steps
3. Add proper assertions to validate the expected behavior
4. Handle edge cases and potential timing issues

## Troubleshooting

### No Devices Connected

If you see "No Android devices connected", ensure:

- An emulator is running or physical device is connected
- Device is properly recognized by ADB (`adb devices`)
- USB debugging is enabled on physical devices

### Test Failures

- Check error messages which identify the exact command that failed
- Verify element selectors (text might be different or elements might be missing)
- Adjust timing with `sleep` commands if needed

### Metro Bundler Issues

If the Metro bundler fails to start:

- Manually start it with `npm start` in a separate terminal
- Check for port conflicts (default is 8081)

## CI/CD Integration

These tests can be integrated into a CI/CD pipeline by:

1. Installing Maestro in the CI environment
2. Starting an emulator in headless mode
3. Running `npm run test:e2e`
4. Using the exit code to determine success/failure
