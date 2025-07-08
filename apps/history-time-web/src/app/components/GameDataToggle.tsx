'use client';

/**
 * GameDataToggle Component
 * Allows switching between mock data and API data for games
 */
import React, { useState, useEffect } from 'react';
import { sharedApiService } from '../../services/sharedAdapter';

export const GameDataToggle: React.FC = () => {
  const [useMock, setUseMock] = useState(false);
  const [loadingState, setLoadingState] = useState('');

  // Load initial toggle state from config service
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const mockEnabled = await sharedApiService.useMockGames();
        setUseMock(mockEnabled);
      } catch (error) {
        console.error('Failed to load mock game data configuration:', error);
      }
    };

    loadConfig();
  }, []);

  // Handle toggling between mock and API data
  const handleToggleChange = async () => {
    try {
      // Update the toggle via the shared adapter
      const newValue = await sharedApiService.toggleMockGames();
      setUseMock(newValue);

      // Show source in UI
      setLoadingState(`Using ${newValue ? 'mock' : 'API'} game data`);

      // Clear message after a delay
      setTimeout(() => {
        setLoadingState('');
      }, 2000);
    } catch (error) {
      console.error('Failed to toggle game data source:', error);
      setLoadingState('Error changing data source');

      setTimeout(() => {
        setLoadingState('');
      }, 2000);
    }
  };

  // Test loading games from the current data source
  const testDataSource = async () => {
    try {
      setLoadingState('Loading game data...');

      // Actually test by getting a list of games through the adapter
      // const games = await sharedApiService.createGame(null, 'medium');
      const games = null; // Temporarily disabled during migration

      if (games) {
        setLoadingState('Game data loaded successfully');
      } else {
        setLoadingState('No games found');
      }

      setTimeout(() => {
        setLoadingState('');
      }, 2000);
    } catch (error) {
      console.error('Error fetching game data:', error);
      setLoadingState('Error loading game data');

      setTimeout(() => {
        setLoadingState('');
      }, 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 my-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Game Data Source
      </h3>

      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-700 dark:text-gray-300">
          {useMock ? 'Using Mock Game Data' : 'Using API Game Data'}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={useMock}
            onChange={handleToggleChange}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {loadingState && (
        <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-4">{loadingState}</p>
      )}

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-full"
        onClick={testDataSource}
      >
        Test Current Game Data Source
      </button>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Toggle between mock data for development and the real API data. Mock game data works offline
        and doesn&apos;t require a server connection.
      </p>
    </div>
  );
};

export default GameDataToggle;
