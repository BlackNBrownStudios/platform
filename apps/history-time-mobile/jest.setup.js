// Set up Jest environment for React Native testing
import 'react-native-gesture-handler/jestSetup';

// Mock dependencies for all tests
// Add any global mocks here

// Mock react-native modules that might cause issues
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation');

// Mock Animated module
jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  reactNative.Animated = {
    ...reactNative.Animated,
    timing: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb({ finished: true })),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb({ finished: true })),
    })),
    loop: jest.fn(() => ({
      start: jest.fn(),
    })),
    Value: jest.fn(() => ({
      interpolate: jest.fn(() => 1),
      setValue: jest.fn(),
    })),
    View: reactNative.View,
    createAnimatedComponent: jest.fn((component) => component),
  };
  return reactNative;
});

// Mock SVG components
jest.mock('react-native-svg', () => {
  const reactNativeSvg = jest.requireActual('react-native-svg');
  return {
    ...reactNativeSvg,
    Svg: 'Svg',
    Path: 'Path',
    Circle: 'Circle',
    Rect: 'Rect',
    G: 'G',
  };
});

// Add proper mocks for Web environment compatibility
global.window = global.window || {};
global.document = global.document || {
  createElement: jest.fn(),
};

// Polyfill for setImmediate and clearImmediate which are not available in JSDOM
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => global.setTimeout(callback, 0, ...args);
}

if (typeof clearImmediate === 'undefined') {
  global.clearImmediate = (id) => global.clearTimeout(id);
}

// Mock the expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: jest.fn().mockImplementation(() => null),
  setStatusBarStyle: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {
        category: 'World History',
        difficulty: 'Easy',
      },
    }),
    useIsFocused: jest.fn(() => true),
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Mock Paper components
jest.mock('react-native-paper', () => {
  const React = require('react');
  const original = jest.requireActual('react-native-paper');

  return {
    ...original,
    Button: ({ onPress, children, mode, style, testID }) =>
      React.createElement('button', { onClick: onPress, testID, style }, children),
    Card: ({ children, style }) => React.createElement('div', { style }, children),
    TouchableRipple: ({ onPress, children, style }) =>
      React.createElement('div', { onClick: onPress, style }, children),
    ActivityIndicator: (props) => React.createElement('div', props, 'loading'),
  };
});

// Mock our ThemeContext
jest.mock('./app/themes/ThemeContext', () => ({
  useAppTheme: () => ({
    styles: {
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#000000',
      primary: '#007bff',
      accent: '#ff9800',
      timelineColor: '#007bff',
    },
  }),
}));

// Global error handling
global.console = {
  ...global.console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Polyfill for requestAnimationFrame
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = (callback) => {
    setTimeout(callback, 0);
    return 0;
  };
}
