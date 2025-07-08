import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StatusBar, SafeAreaView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ErrorBoundary from './app/components/ErrorBoundary';
import AppNavigator from './app/navigation/AppNavigator';
import { ApiProvider } from './app/services/sharedAdapter';
import { ThemeProvider, useAppTheme } from './app/themes/ThemeContext';
import { initSvgDebug, DebugLevel } from './app/utils/svg-debug';
import './app/typings/global.d.ts';

// Initialize SVG debugging
if (__DEV__) {
  initSvgDebug(DebugLevel.VERBOSE);
}

const AppContent = () => {
  const { styles } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.background }}>
      <StatusBar
        barStyle={styles.background === '#ffffff' ? 'dark-content' : 'light-content'}
        backgroundColor={styles.background}
      />
      <NavigationContainer>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Navigation error caught by ErrorBoundary:', error);
            console.info('Component stack:', errorInfo.componentStack);
          }}
        >
          <AppNavigator />
        </ErrorBoundary>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const App = () => {
  // Setup global error handlers for debugging
  useEffect(() => {
    if (__DEV__) {
      // Additional web-specific error handlers for SVG issues
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Log unhandled promise rejections
        window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
          console.error('Unhandled promise rejection:', event.reason);
        });
      }
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary
          onError={(error) => {
            console.error('Root app error caught by ErrorBoundary:', error);
          }}
        >
          <ThemeProvider>
            <PaperProvider>
              <ApiProvider>
                <AppContent />
              </ApiProvider>
            </PaperProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
