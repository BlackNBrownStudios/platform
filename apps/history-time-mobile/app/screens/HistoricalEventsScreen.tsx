/**
 * HistoricalEventsScreen
 * Demonstrates fetching and displaying historical events with toggle between mock/API data
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';

import { HistoricalEvent, EventFilters } from '../../../../shared/src/types';
import HistoricalEventsToggle from '../components/HistoricalEventsToggle';
import { useSharedAdapter } from '../services/sharedAdapter';

// Time period options
const TIME_PERIODS = [
  { label: 'All Time', startYear: undefined, endYear: undefined },
  { label: 'Ancient', startYear: -3000, endYear: 500 },
  { label: 'Medieval', startYear: 500, endYear: 1500 },
  { label: 'Early Modern', startYear: 1500, endYear: 1800 },
  { label: 'Modern', startYear: 1800, endYear: 1945 },
  { label: 'Contemporary', startYear: 1945, endYear: new Date().getFullYear() },
];

// Category chips
const CategoryChip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, selected, onPress }) => (
  <TouchableOpacity style={[styles.chip, selected && styles.selectedChip]} onPress={onPress}>
    <Text style={[styles.chipText, selected && styles.selectedChipText]}>{label}</Text>
  </TouchableOpacity>
);

// Event card component
const EventCard: React.FC<{ event: HistoricalEvent }> = ({ event }) => (
  <View style={styles.card}>
    {event.imageUrl && <Image source={{ uri: event.imageUrl }} style={styles.cardImage} />}
    <View style={styles.cardContent}>
      <Text style={styles.cardYear}>{event.year}</Text>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.cardDescription} numberOfLines={3}>
        {event.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardCategory}>{event.category}</Text>
        <View style={styles.significanceContainer}>
          <Text style={styles.significanceLabel}>Significance:</Text>
          <Text
            style={[
              styles.significanceBadge,
              event.significance === 'low' && styles.significanceLow,
              event.significance === 'medium' && styles.significanceMedium,
              event.significance === 'high' && styles.significanceHigh,
              event.significance === 'pivotal' && styles.significancePivotal,
            ]}
          >
            {event.significance}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const HistoricalEventsScreen: React.FC = () => {
  const adapter = useSharedAdapter();
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(TIME_PERIODS[0]);
  const [error, setError] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
    loadEvents();
  }, []);

  // Load events when filters change
  useEffect(() => {
    loadEvents();
  }, [selectedCategory, selectedTimePeriod]);

  // Load historical event categories
  const loadCategories = async () => {
    try {
      const result = await adapter.getHistoricalEventCategories();
      setCategories(result);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    }
  };

  // Load historical events with current filters
  const loadEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: EventFilters = {
        startYear: selectedTimePeriod.startYear,
        endYear: selectedTimePeriod.endYear,
        category: selectedCategory,
        limit: 20,
        page: 1,
      };

      const result = await adapter.getHistoricalEvents(filters);
      setEvents(result.results);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load historical events');
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(undefined);
    } else {
      setSelectedCategory(category);
    }
  };

  // Set time period
  const selectTimePeriod = (timePeriod: (typeof TIME_PERIODS)[0]) => {
    setSelectedTimePeriod(timePeriod);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historical Events</Text>
      </View>

      {/* Toggle between mock and API data */}
      <HistoricalEventsToggle />

      {/* Time period selector */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Time Period:</Text>
        <FlatList
          horizontal
          data={TIME_PERIODS}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <CategoryChip
              label={item.label}
              selected={selectedTimePeriod.label === item.label}
              onPress={() => selectTimePeriod(item)}
            />
          )}
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
        />
      </View>

      {/* Categories */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Categories:</Text>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CategoryChip
              label={item}
              selected={selectedCategory === item}
              onPress={() => toggleCategory(item)}
            />
          )}
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
        />
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Events list */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={styles.eventsList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events found for the selected filters.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EA',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  filtersContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2D3748',
  },
  filterList: {
    paddingBottom: 8,
  },
  chip: {
    backgroundColor: '#EDF2F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#4A90E2',
  },
  chipText: {
    fontSize: 14,
    color: '#4A5568',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4A5568',
  },
  eventsList: {
    padding: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    height: 160,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    padding: 16,
  },
  cardYear: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: {
    fontSize: 14,
    color: '#718096',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  significanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  significanceLabel: {
    fontSize: 12,
    color: '#718096',
    marginRight: 4,
  },
  significanceBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  significanceLow: {
    backgroundColor: '#E2E8F0',
    color: '#718096',
  },
  significanceMedium: {
    backgroundColor: '#EBF4FF',
    color: '#3182CE',
  },
  significanceHigh: {
    backgroundColor: '#FEFCBF',
    color: '#D69E2E',
  },
  significancePivotal: {
    backgroundColor: '#FED7D7',
    color: '#E53E3E',
  },
  errorContainer: {
    backgroundColor: '#FED7D7',
    padding: 12,
    margin: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#C53030',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
});

export default HistoricalEventsScreen;
