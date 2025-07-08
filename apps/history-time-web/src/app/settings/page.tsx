'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme, ThemeType, themeStyles } from '../contexts/ThemeContext';
import HistoricalEventsToggle from '../components/HistoricalEventsToggle';
import GameDataToggle from '../components/GameDataToggle';

const SettingsPage = () => {
  const { theme, setTheme, styles } = useTheme();

  const themes: { id: ThemeType; name: string; description: string }[] = [
    {
      id: 'light',
      name: 'Light',
      description: 'A clean, bright theme for daytime use',
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Easy on the eyes in low-light environments',
    },
    {
      id: 'sepia',
      name: 'Sepia',
      description: 'A warm, paper-like theme for comfortable reading',
    },
    {
      id: 'historical',
      name: 'Historical',
      description: 'An aged parchment-inspired theme for history enthusiasts',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Appearance
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {themes.map((themeOption) => (
                    <div
                      key={themeOption.id}
                      className={`
                        border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                        ${
                          theme === themeOption.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }
                      `}
                      onClick={() => setTheme(themeOption.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="flex space-x-1 mb-2">
                            {Object.values(themeStyles[themeOption.id])
                              .slice(0, 3)
                              .map((color, index) => (
                                <div
                                  key={index}
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {themeOption.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {themeOption.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Developer Options Section */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Developer Options
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Source Options
                </h3>
                <HistoricalEventsToggle />
                <GameDataToggle />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Preview</h2>
            <div className="p-4 rounded-lg" style={{ backgroundColor: styles.background }}>
              <h3 className="text-lg font-medium mb-2" style={{ color: styles.text }}>
                Sample Card
              </h3>
              <div className="rounded-md p-3 mb-3" style={{ backgroundColor: styles.surface }}>
                <p style={{ color: styles.text }}>
                  This is how your cards will look with this theme.
                </p>
              </div>
              <div
                className="h-2 rounded-full w-full mb-4"
                style={{ backgroundColor: styles.timelineColor }}
              />
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 rounded-md text-white"
                  style={{ backgroundColor: styles.primary }}
                >
                  Primary Button
                </button>
                <button
                  className="px-3 py-1 rounded-md text-white"
                  style={{ backgroundColor: styles.secondary }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
