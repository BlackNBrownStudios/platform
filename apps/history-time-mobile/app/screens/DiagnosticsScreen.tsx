import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';

import ErrorBoundary from '../components/ErrorBoundary';
import IconTest from '../components/IconTest';
import { useAppTheme } from '../themes/ThemeContext';
import '../typings/global.d.ts';

/**
 * Check if Hermes is enabled in a type-safe way
 */
const isHermesEnabled = (): boolean => {
  try {
    // @ts-ignore - Using dynamic check to avoid TypeScript errors
    return !!global.HermesInternal;
  } catch (e) {
    return false;
  }
};

/**
 * Screen for running diagnostics and debugging app components
 * Particularly focused on SVG rendering issues
 */
export const DiagnosticsScreen = () => {
  const { styles: themeStyles } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'icons' | 'system'>('icons');

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'icons' && styles.activeTab]}
          onPress={() => setActiveTab('icons')}
        >
          <Text style={[styles.tabText, activeTab === 'icons' && styles.activeTabText]}>
            Icon Tests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'system' && styles.activeTab]}
          onPress={() => setActiveTab('system')}
        >
          <Text style={[styles.tabText, activeTab === 'system' && styles.activeTabText]}>
            System Info
          </Text>
        </TouchableOpacity>
      </View>

      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Diagnostics error:', error);
          console.log('Component stack:', errorInfo.componentStack);
        }}
      >
        {activeTab === 'icons' ? (
          <IconTest />
        ) : (
          <ScrollView style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>System Information</Text>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Platform:</Text>
              <Text style={styles.infoValue}>{Platform.OS}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version:</Text>
              <Text style={styles.infoValue}>{Platform.Version}</Text>
            </View>

            {Platform.OS === 'web' && (
              <>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>User Agent:</Text>
                  <Text style={styles.infoValue} numberOfLines={2}>
                    {typeof navigator !== 'undefined' ? navigator.userAgent : 'Not available'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Window Size:</Text>
                  <Text style={styles.infoValue}>
                    {typeof window !== 'undefined'
                      ? `${window.innerWidth} x ${window.innerHeight}`
                      : 'Not available'}
                  </Text>
                </View>
              </>
            )}

            <Text style={styles.sectionTitle}>Rendering Configuration</Text>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>JS Engine:</Text>
              <Text style={styles.infoValue}>{isHermesEnabled() ? 'Hermes' : 'JSC'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Development Mode:</Text>
              <Text style={styles.infoValue}>{__DEV__ ? 'Yes' : 'No'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>React Native Version:</Text>
              <Text style={styles.infoValue}>
                {
                  // Access version info where available
                  Platform.constants?.reactNativeVersion
                    ? `${Platform.constants.reactNativeVersion.major}.${Platform.constants.reactNativeVersion.minor}.${Platform.constants.reactNativeVersion.patch}`
                    : 'Not available'
                }
              </Text>
            </View>
          </ScrollView>
        )}
      </ErrorBoundary>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#757575',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    flex: 2,
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  infoValue: {
    flex: 3,
    fontSize: 16,
    color: '#333',
  },
});

export default DiagnosticsScreen;
