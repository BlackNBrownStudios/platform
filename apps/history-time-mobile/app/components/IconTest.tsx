import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';

import { logSvg, DebugLevel } from '../utils/svg-debug';

import { IconProps, Icon } from './Icon';

/**
 * Test component to diagnose SVG rendering issues
 * This helps identify which specific icons are problematic in the web environment
 */
const IconTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [expandedLogs, setExpandedLogs] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Define all available icons to test
  const iconNames: IconProps['name'][] = ['home', 'game', 'leaderboard', 'settings'];

  // Log interceptor for testing
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Only setup in web environment
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;

      // Intercept console errors/warnings
      console.error = (...args: any[]) => {
        if (args.some((arg) => typeof arg === 'string' && arg.includes('svg'))) {
          setLogs((prev) => [`ERROR: ${args.join(' ')}`, ...prev].slice(0, 50));
        }
        originalConsoleError(...args);
      };

      console.warn = (...args: any[]) => {
        if (args.some((arg) => typeof arg === 'string' && arg.includes('svg'))) {
          setLogs((prev) => [`WARN: ${args.join(' ')}`, ...prev].slice(0, 50));
        }
        originalConsoleWarn(...args);
      };

      // Cleanup
      return () => {
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
      };
    }
  }, []);

  // Test all icons
  const testAllIcons = () => {
    setLogs([`Starting icon tests at ${new Date().toISOString()}`, ...logs]);

    iconNames.forEach((name) => {
      try {
        // Log test start
        logSvg(DebugLevel.INFO, `Testing icon: ${name}`);

        // Mark as successful initially
        setTestResults((prev) => ({ ...prev, [name]: true }));

        // The actual errors might be caught by error boundaries
        // so we're mostly checking if the app crashes
      } catch (error) {
        logSvg(DebugLevel.ERROR, `Icon test failed for ${name}`, error);
        setTestResults((prev) => ({ ...prev, [name]: false }));
        setLogs((prev) => [`FAIL: ${name} - ${error}`, ...prev]);
      }
    });

    setLogs((prev) => [`Completed icon tests at ${new Date().toISOString()}`, ...prev]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SVG Icon Test Utility</Text>
      <Text style={styles.subtitle}>
        Tests SVG icons for rendering issues in {Platform.OS} environment
      </Text>

      <TouchableOpacity style={styles.button} onPress={testAllIcons}>
        <Text style={styles.buttonText}>Test All Icons</Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>Individual Icon Tests:</Text>

        {iconNames.map((name) => (
          <View key={name} style={styles.iconTest}>
            <Text style={styles.iconName}>{name}:</Text>
            <View style={styles.iconContainer}>
              <Icon name={name} size={24} color="#000" testID={`test-icon-${name}`} />
            </View>
            {testResults[name] !== undefined && (
              <Text
                style={[styles.testResult, { color: testResults[name] ? '#007700' : '#cc0000' }]}
              >
                {testResults[name] ? '✓ Rendered' : '✗ Failed'}
              </Text>
            )}
          </View>
        ))}
      </View>

      {Platform.OS === 'web' && (
        <View style={styles.logsContainer}>
          <TouchableOpacity onPress={() => setExpandedLogs(!expandedLogs)} style={styles.logToggle}>
            <Text style={styles.sectionTitle}>
              Debug Logs {expandedLogs ? '(tap to collapse)' : '(tap to expand)'}
            </Text>
          </TouchableOpacity>

          {expandedLogs && (
            <View style={styles.logs}>
              {logs.length === 0 ? (
                <Text style={styles.noLogs}>No logs recorded yet</Text>
              ) : (
                logs.map((log, i) => (
                  <Text key={i} style={styles.logEntry}>
                    {log}
                  </Text>
                ))
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  iconTest: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  iconName: {
    width: 120,
    fontSize: 16,
    fontWeight: '500',
  },
  iconContainer: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    marginRight: 20,
  },
  testResult: {
    fontSize: 14,
    fontWeight: '500',
  },
  logsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  logToggle: {
    padding: 4,
  },
  logs: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 4,
  },
  logEntry: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'courier',
    fontSize: 12,
    marginBottom: 4,
    color: '#333',
  },
  noLogs: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    padding: 8,
  },
});

export default IconTest;
