import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  RadioButton,
  Chip,
  Text,
  Switch,
} from 'react-native-paper';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppTheme } from '../themes/ThemeContext';
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;
type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const DIFFICULTIES = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
  { label: 'Expert', value: 'expert' },
];

const CATEGORIES = [
  'Science',
  'Art',
  'Politics',
  'Sports',
  'Technology',
  'Literature',
  'Military',
  'Music',
  'Film',
  'Ancient History',
  'Modern History',
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { styles: themeStyles } = useAppTheme();

  const [difficulty, setDifficulty] = useState<string>('medium');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [devModeVisible, setDevModeVisible] = useState<boolean>(false);
  const [devMode, setDevMode] = useState<boolean>(false);

  // Counter for triple tap detection
  const [tapCount, setTapCount] = useState<number>(0);

  const handleTitlePress = () => {
    // Increment tap count
    const newCount = tapCount + 1;
    setTapCount(newCount);

    // Reset tap count after a short delay
    setTimeout(() => {
      if (tapCount === 2) {
        // After 3 taps (0, 1, 2), show dev mode options
        setDevModeVisible((prev) => !prev);
      }
      setTapCount(0);
    }, 500);
  };

  // Toggle category selection (multiple categories allowed)
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const startGame = () => {
    navigation.navigate('GameBoard', {
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      difficulty,
      devMode,
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeStyles.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity onPress={handleTitlePress} activeOpacity={1}>
        <Title style={[styles.title, { color: themeStyles.text }]}>History Time</Title>
      </TouchableOpacity>
      <Paragraph style={[styles.subtitle, { color: themeStyles.text }]}>
        Test your knowledge of historical events
      </Paragraph>

      <Card style={[styles.card, { backgroundColor: themeStyles.surface }]}>
        <Card.Content>
          <Title style={{ color: themeStyles.text }}>Game Settings</Title>

          {devModeVisible && (
            <View style={styles.devModeContainer}>
              <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Developer Mode</Text>
              <View style={styles.devModeRow}>
                <Text style={{ color: themeStyles.text }}>Show all card dates (for testing)</Text>
                <Switch value={devMode} onValueChange={setDevMode} color={themeStyles.primary} />
              </View>
              <Text style={[styles.devModeNote, { color: themeStyles.text }]}>
                Developer mode enabled. This shows all card dates for testing purposes.
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Difficulty</Text>
            <RadioButton.Group onValueChange={(value) => setDifficulty(value)} value={difficulty}>
              <View style={styles.radioGroup}>
                {DIFFICULTIES.map((option) => (
                  <RadioButton.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    labelStyle={{ color: themeStyles.text }}
                    color={themeStyles.primary}
                  />
                ))}
              </View>
            </RadioButton.Group>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
              Categories (Optional)
            </Text>
            <Text style={[styles.sectionSubtitle, { color: themeStyles.text }]}>
              Select one or more categories for your game, or leave empty for all categories
            </Text>
            <View style={styles.categoryGroup}>
              {CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  selected={selectedCategories.includes(category)}
                  onPress={() => toggleCategory(category)}
                  style={[
                    styles.categoryChip,
                    selectedCategories.includes(category)
                      ? { backgroundColor: themeStyles.primary }
                      : { backgroundColor: themeStyles.surface },
                  ]}
                  textStyle={{
                    color: selectedCategories.includes(category) ? '#fff' : themeStyles.text,
                  }}
                >
                  {category}
                </Chip>
              ))}
            </View>

            {selectedCategories.length > 0 && (
              <View style={styles.selectedCategoriesContainer}>
                <Text style={[styles.selectedCategoriesLabel, { color: themeStyles.text }]}>
                  Selected: {selectedCategories.join(', ')}
                </Text>
              </View>
            )}
          </View>

          <Button
            mode="contained"
            onPress={startGame}
            style={[styles.startButton, { backgroundColor: themeStyles.primary }]}
            labelStyle={styles.startButtonLabel}
          >
            Start Game
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    elevation: 4,
    marginBottom: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    margin: 4,
  },
  devModeContainer: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ff9800',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  devModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  devModeNote: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  startButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  startButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedCategoriesContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ff9800',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  selectedCategoriesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
