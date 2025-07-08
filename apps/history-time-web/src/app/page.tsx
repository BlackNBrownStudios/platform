'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categoriesService, CategoriesResult } from './services/categoriesService';
import { healthService } from './services/healthService';
import Header from './components/Header';
import { useTheme } from './contexts/ThemeContext';

export default function Home() {
  const router = useRouter();
  const { styles } = useTheme();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading categories...');
  const [isOffline, setIsOffline] = useState(false);

  // Game settings
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [cardCount, setCardCount] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    // Start health monitoring
    healthService.startHealthMonitoring();

    // Load available categories with enhanced service
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const result: CategoriesResult = await categoriesService.getCategoriesWithProgress(
          (message: string, attempt: number) => {
            setLoadingMessage(message);
          }
        );

        setCategories(result.categories);
        setIsOffline(result.isOffline);

        if (result.error) {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load categories. Using fallback categories.');
        setCategories(categoriesService.getFallbackCategories());
        setIsOffline(true);
        console.error('Category loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();

    // Cleanup function
    return () => {
      healthService.stopHealthMonitoring();
    };
  }, []);

  // Handle start game
  const handleStartGame = () => {
    const params = new URLSearchParams();

    params.append('difficulty', difficulty);
    params.append('cards', cardCount.toString());

    if (selectedCategories.length > 0) {
      params.append('categories', selectedCategories.join(','));
    }

    router.push(`/game?${params.toString()}`);
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <div style={{ backgroundColor: styles.background, color: styles.text }}>
      <Header />
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: styles.text }}>
              History Time
            </h1>
            <p className="text-xl" style={{ color: styles.text, opacity: 0.8 }}>
              Test your knowledge of historical events by arranging them in chronological order
            </p>
          </div>

          <div
            className="rounded-lg shadow-lg p-6 mb-8"
            style={{ backgroundColor: styles.surface }}
          >
            <h2 className="text-2xl font-semibold mb-6" style={{ color: styles.text }}>
              Game Settings
            </h2>

            {/* Difficulty Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: styles.text }}>
                Difficulty
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['easy', 'medium', 'hard', 'expert'] as const).map((level) => (
                  <button
                    key={level}
                    className="py-2 px-4 rounded-md transition"
                    style={{
                      backgroundColor: difficulty === level ? styles.primary : 'rgba(0,0,0,0.1)',
                      color: difficulty === level ? '#ffffff' : styles.text,
                    }}
                    onClick={() => setDifficulty(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Count */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: styles.text }}>
                Number of Cards: {cardCount}
              </label>
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={cardCount}
                onChange={(e) => setCardCount(parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
              />
              <div
                className="flex justify-between text-xs mt-1"
                style={{ color: styles.text, opacity: 0.6 }}
              >
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2" style={{ color: styles.text }}>
                Categories (Optional)
                {isOffline && (
                  <span
                    className="ml-2 text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: '#F59E0B', color: '#ffffff' }}
                  >
                    Offline
                  </span>
                )}
              </label>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: styles.primary }}
                  ></div>
                  <p style={{ color: styles.text, opacity: 0.8 }}>{loadingMessage}</p>
                </div>
              ) : error ? (
                <div
                  className="p-3 rounded-md mb-4"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderLeft: '3px solid #EF4444',
                  }}
                >
                  <p style={{ color: '#EF4444' }}>{error}</p>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const result = await categoriesService.refreshCategories();
                        setCategories(result.categories);
                        setIsOffline(result.isOffline);
                        setError(result.error || null);
                      } catch (err) {
                        setError('Refresh failed. Using cached categories.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="mt-2 text-sm underline"
                    style={{ color: '#EF4444' }}
                  >
                    Try Again
                  </button>
                </div>
              ) : null}

              {categories.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className="py-2 px-3 text-sm rounded-md transition hover:opacity-80"
                      style={{
                        backgroundColor: selectedCategories.includes(category)
                          ? styles.secondary
                          : 'rgba(0,0,0,0.1)',
                        color: selectedCategories.includes(category) ? '#ffffff' : styles.text,
                      }}
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {selectedCategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-sm" style={{ color: styles.text, opacity: 0.7 }}>
                    Selected:
                  </span>
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-full"
                      style={{ backgroundColor: styles.secondary, color: '#ffffff' }}
                    >
                      {category}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Start Game Button */}
            <div className="text-center">
              <button
                onClick={handleStartGame}
                className="font-semibold py-3 px-8 rounded-lg transition shadow-md mr-4"
                style={{ backgroundColor: styles.primary, color: '#ffffff' }}
              >
                Start Solo Game
              </button>

              <button
                onClick={() => router.push('/local-game')}
                className="font-semibold py-3 px-8 rounded-lg transition shadow-md mr-4"
                style={{ backgroundColor: '#4caf50', color: '#ffffff' }}
              >
                Local 2-Player Mode
              </button>

              <button
                onClick={() => router.push('/multiplayer')}
                className="font-semibold py-3 px-8 rounded-lg transition shadow-md"
                style={{ backgroundColor: styles.secondary, color: '#ffffff' }}
              >
                Multiplayer Mode
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => router.push('/leaderboard')}
              className="transition"
              style={{ color: styles.primary }}
            >
              View Leaderboard
            </button>
            <span style={{ color: styles.text, opacity: 0.5 }}>|</span>
            <button
              onClick={() => router.push('/about')}
              className="transition"
              style={{ color: styles.primary }}
            >
              About
            </button>
            <span style={{ color: styles.text, opacity: 0.5 }}>|</span>
            <button
              onClick={() => router.push('/settings')}
              className="transition"
              style={{ color: styles.primary }}
            >
              Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
