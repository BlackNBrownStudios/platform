'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import HistoricalEventsToggle from '../components/HistoricalEventsToggle';
import {
  getMockHistoricalEvents,
  getMockHistoricalEventCategories,
} from '../services/mockHistoricalEvents';
import { HistoricalEvent, EventFilters } from '@history-time/data-access';
import Image from 'next/image';

// Time period options
const TIME_PERIODS = [
  { label: 'All Time', startYear: undefined, endYear: undefined },
  { label: 'Ancient', startYear: -3000, endYear: 500 },
  { label: 'Medieval', startYear: 500, endYear: 1500 },
  { label: 'Early Modern', startYear: 1500, endYear: 1800 },
  { label: 'Modern', startYear: 1800, endYear: 1945 },
  { label: 'Contemporary', startYear: 1945, endYear: new Date().getFullYear() },
];

// Event card component
const EventCard: React.FC<{ event: HistoricalEvent }> = ({ event }) => {
  const { styles } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
      {event.imageUrl && (
        <div className="relative h-48 w-full">
          <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-1">
          {event.year > 0 ? event.year + ' CE' : Math.abs(event.year) + ' BCE'}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{event.description}</p>
        <div className="flex justify-between items-center">
          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
            {event.category}
          </span>
          <div className="flex items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">Significance:</span>
            <span
              className={`
              text-xs px-2 py-1 rounded-full
              ${
                event.significance === 'low' &&
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }
              ${
                event.significance === 'medium' &&
                'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              }
              ${
                event.significance === 'high' &&
                'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
              }
              ${
                event.significance === 'pivotal' &&
                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }
            `}
            >
              {event.significance}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Category chip component
const CategoryChip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, selected, onPress }) => (
  <button
    className={`
      mr-2 mb-2 px-3 py-1 rounded-full text-sm transition-colors
      ${
        selected
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
      }
    `}
    onClick={onPress}
  >
    {label}
  </button>
);

const HistoricalEventsPage: React.FC = () => {
  const { styles } = useTheme();
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(TIME_PERIODS[0]);
  const [error, setError] = useState<string | null>(null);

  // Load historical event categories
  const loadCategories = async () => {
    try {
      // For now, using the mock data directly
      const result = getMockHistoricalEventCategories();
      setCategories(result);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    }
  };

  // Load historical events with current filters
  const loadEvents = useCallback(async () => {
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

      // For now, using the mock data directly
      const result = getMockHistoricalEvents(filters);
      setEvents(result.events);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load historical events');
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedTimePeriod]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
    loadEvents();
  }, [loadEvents]);

  // Load events when filters change
  useEffect(() => {
    loadEvents();
  }, [selectedCategory, selectedTimePeriod, loadEvents]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historical Events</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Toggle between mock and API data */}
        <div className="mb-6">
          <HistoricalEventsToggle />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Filters</h2>

          {/* Time period selector */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </h3>
            <div className="flex flex-wrap">
              {TIME_PERIODS.map((timePeriod) => (
                <CategoryChip
                  key={timePeriod.label}
                  label={timePeriod.label}
                  selected={selectedTimePeriod.label === timePeriod.label}
                  onPress={() => selectTimePeriod(timePeriod)}
                />
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories
            </h3>
            <div className="flex flex-wrap">
              {categories.map((category) => (
                <CategoryChip
                  key={category}
                  label={category}
                  selected={selectedCategory === category}
                  onPress={() => toggleCategory(category)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
              {error}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mb-6">
              No events found for the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {!loading && events.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricalEventsPage;
