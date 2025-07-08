/**
 * HistoricalEventsToggle Component
 * Allows switching between mock data and API data for historical events
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';

import { useSharedAdapter } from '../services/sharedAdapter';

export const HistoricalEventsToggle: React.FC = () => {
  const adapter = useSharedAdapter();
  const [useMock, setUseMock] = useState(false);
  const [loadingState, setLoadingState] = useState('');

  // Load initial toggle state from config service
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const mockEnabled = await adapter.useMockHistoricalEvents();
        setUseMock(mockEnabled);
      } catch (error) {
        console.error('Failed to load mock data configuration:', error);
      }
    };

    loadConfig();
  }, []);

  // Handle toggling between mock and API data
  const handleToggleChange = async (value: boolean) => {
    try {
      // Update the toggle via the adapter
      const newValue = await adapter.toggleMockHistoricalEvents();
      setUseMock(newValue);

      // Show source in UI
      setLoadingState(`Using ${newValue ? 'mock' : 'API'} data`);

      // Clear message after a delay
      setTimeout(() => {
        setLoadingState('');
      }, 2000);
    } catch (error) {
      console.error('Failed to toggle data source:', error);
      setLoadingState('Error changing data source');

      setTimeout(() => {
        setLoadingState('');
      }, 2000);
    }
  };

  // Test loading events from the current data source
  const testDataSource = async () => {
    try {
      setLoadingState('Loading events...');

      // Fetch some events from the current data source
      const result = await adapter.getHistoricalEvents({
        limit: 3,
        page: 1,
      });

      setLoadingState(`Loaded ${result.results.length} events successfully`);

      setTimeout(() => {
        setLoadingState('');
      }, 2000);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoadingState('Error loading events');

      setTimeout(() => {
        setLoadingState('');
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data Source</Text>

      <View style={styles.row}>
        <Text style={styles.label}>{useMock ? 'Using Mock Data' : 'Using API Data'}</Text>
        <Switch
          value={useMock}
          onValueChange={handleToggleChange}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={useMock ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {loadingState ? <Text style={styles.statusText}>{loadingState}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={testDataSource}>
        <Text style={styles.buttonText}>Test Current Data Source</Text>
      </TouchableOpacity>

      <Text style={styles.infoText}>
        Toggle between mock data for development and the real API data. Mock data works offline and
        doesn&apos;t require a server connection.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
  },
  statusText: {
    marginVertical: 8,
    fontStyle: 'italic',
    color: '#666',
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    lineHeight: 20,
  },
});

export default HistoricalEventsToggle;
