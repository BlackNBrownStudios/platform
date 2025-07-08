import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Appbar, List, Text, Chip, SegmentedButtons } from 'react-native-paper';

import { apiService, LeaderboardEntry } from '../services/api';
import { useAppTheme } from '../themes/ThemeContext';

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'all_time';

const LeaderboardScreen: React.FC = () => {
  const { styles: themeStyles } = useAppTheme();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all_time');
  const [loading, setLoading] = useState(false);

  const categories = ['History', 'Science', 'Arts', 'Sports', 'All'];

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory, timeFrame]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const category =
        selectedCategory === 'All' ? undefined : selectedCategory?.toLowerCase() || undefined;
      const data = await apiService.getLeaderboard(category, timeFrame);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rankStyle = [styles.rank];
    let rankColor = themeStyles.text;

    if (index === 0) rankColor = '#FFD700'; // Gold
    if (index === 1) rankColor = '#C0C0C0'; // Silver
    if (index === 2) rankColor = '#CD7F32'; // Bronze

    // Calculate accuracy percentage
    const accuracy =
      item.totalCards > 0 ? Math.round((item.correctPlacements / item.totalCards) * 100) : 0;

    // Format time
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <List.Item
        title={item.userId.name}
        description={`Score: ${item.score} | Accuracy: ${accuracy}% | Time: ${formatTime(
          item.totalTimeTaken
        )}`}
        left={() => (
          <View style={[styles.rankContainer, { backgroundColor: themeStyles.surface }]}>
            <Text style={[rankStyle, { color: rankColor }]}>{item.rank || index + 1}</Text>
          </View>
        )}
        style={{ backgroundColor: themeStyles.background }}
        titleStyle={{ color: themeStyles.text }}
        descriptionStyle={{ color: themeStyles.text + '99' }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <Appbar.Header style={{ backgroundColor: themeStyles.primary }}>
        <Appbar.Content title="Leaderboard" color="white" />
      </Appbar.Header>

      <View style={styles.filtersContainer}>
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === category ? themeStyles.primary : themeStyles.surface,
                  },
                ]}
                textStyle={{ color: selectedCategory === category ? 'white' : themeStyles.text }}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <SegmentedButtons
          value={timeFrame}
          onValueChange={(value) => setTimeFrame(value as TimeFrame)}
          buttons={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'all_time', label: 'All Time' },
          ]}
          style={styles.timeFrameButtons}
        />
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => `${item.userId._id}`}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: themeStyles.background + '20' }} />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchLeaderboard}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    padding: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  timeFrameButtons: {
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 10,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export { LeaderboardScreen };
