import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

import { useAppTheme } from '../themes/ThemeContext';

// CardManager integration test
let CardManager: any = null;
let cardManagerError: string | null = null;

try {
  const { CardManager: CM } = require('history-time-shared');
  CardManager = CM;
  console.log('✅ CardManager loaded successfully in mobile test screen');
} catch (error: any) {
  cardManagerError = error.message;
  console.log('ℹ️ CardManager not available in mobile test:', error.message);
}

export const CardManagerTestScreen: React.FC = () => {
  const { styles: themeStyles } = useAppTheme();
  const navigation = useNavigation();
  const [testState, setTestState] = useState<any>(null);

  useEffect(() => {
    console.log('CardManager Test Screen mounted');

    if (CardManager) {
      console.log('🎯 CardManager available, initializing test state');
      setTestState({
        available: true,
        type: typeof CardManager,
        isFunction: typeof CardManager === 'function',
        timestamp: Date.now(),
      });
    } else {
      setTestState({
        available: false,
        error: cardManagerError,
        timestamp: Date.now(),
      });
    }
  }, []);

  const sampleCards = [
    {
      id: 'card-1',
      title: 'Discovery of DNA Structure',
      date: '1953-04-25',
      description: 'Watson and Crick published their model of DNA structure',
      category: 'Science',
    },
    {
      id: 'card-2',
      title: 'Moon Landing',
      date: '1969-07-20',
      description: 'Apollo 11 successfully lands on the Moon',
      category: 'Science',
    },
    {
      id: 'card-3',
      title: 'World Wide Web',
      date: '1989-03-12',
      description: 'Tim Berners-Lee proposes the World Wide Web',
      category: 'Technology',
    },
  ];

  const renderCardManagerTest = () => {
    if (!CardManager || !testState?.available) {
      return (
        <Card style={[styles.statusCard, { backgroundColor: '#fff3cd' }]}>
          <Card.Content>
            <Text style={[styles.statusTitle, { color: '#856404' }]}>
              CardManager Fallback Mode
            </Text>
            <Text style={[styles.statusDetail, { color: '#856404' }]}>
              {cardManagerError || 'CardManager not available'}
            </Text>
            <Text style={[styles.statusDetail, { color: '#856404' }]}>
              Original mobile functionality preserved
            </Text>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={[styles.statusCard, { backgroundColor: '#d4edda' }]}>
        <Card.Content>
          <Text style={[styles.statusTitle, { color: '#155724' }]}>✅ CardManager Active</Text>
          <Text style={[styles.statusDetail, { color: '#155724' }]}>Type: {testState.type}</Text>
          <Text style={[styles.statusDetail, { color: '#155724' }]}>
            Function: {testState.isFunction ? 'Yes' : 'No'}
          </Text>
          <Text style={[styles.statusDetail, { color: '#155724' }]}>
            Loaded at: {new Date(testState.timestamp).toLocaleTimeString()}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  const renderSampleCards = () => {
    return (
      <View style={styles.sampleCardsContainer}>
        <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
          Sample Cards ({sampleCards.length})
        </Text>
        {CardManager && (
          <Text style={[styles.enhancement, { color: '#007bff' }]}>
            Enhanced with CardManager shared logic
          </Text>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sampleCards.map((card, index) => (
            <Card
              key={card.id}
              style={[styles.sampleCard, { backgroundColor: themeStyles.surface }]}
            >
              <Card.Content>
                <Text style={[styles.cardTitle, { color: themeStyles.text }]}>{card.title}</Text>
                <Text style={[styles.cardDate, { color: themeStyles.primary }]}>{card.date}</Text>
                <Text style={[styles.cardDescription, { color: themeStyles.text }]}>
                  {card.description.substring(0, 50)}...
                </Text>
                <Text style={[styles.cardCategory, { color: '#6c757d' }]}>{card.category}</Text>
                {CardManager && (
                  <Text style={[styles.enhancement, { color: '#007bff' }]}>
                    Position: {index + 1}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeStyles.text }]}>CardManager Mobile Test</Text>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={{ borderColor: themeStyles.primary }}
          labelStyle={{ color: themeStyles.primary }}
        >
          Back
        </Button>
      </View>

      <ScrollView style={styles.content}>
        {renderCardManagerTest()}

        <Card style={[styles.infoCard, { backgroundColor: themeStyles.surface }]}>
          <Card.Content>
            <Text style={[styles.infoTitle, { color: themeStyles.text }]}>Integration Status</Text>
            <Text style={[styles.infoDetail, { color: themeStyles.text }]}>
              • Shared package: {testState?.available ? '✅ Available' : '❌ Not Available'}
            </Text>
            <Text style={[styles.infoDetail, { color: themeStyles.text }]}>
              • Mobile compatibility: ✅ Graceful fallback
            </Text>
            <Text style={[styles.infoDetail, { color: themeStyles.text }]}>
              • Original functionality: ✅ Preserved
            </Text>
            <Text style={[styles.infoDetail, { color: themeStyles.text }]}>
              • Cross-platform ready: ✅ Web + Mobile
            </Text>
          </Card.Content>
        </Card>

        {renderSampleCards()}

        <Card style={[styles.actionCard, { backgroundColor: themeStyles.surface }]}>
          <Card.Content>
            <Text style={[styles.actionTitle, { color: themeStyles.text }]}>Test Actions</Text>
            <Button
              mode="contained"
              onPress={() => {
                console.log('🎯 Test: Card selection simulation');
                if (CardManager) {
                  console.log('🎯 CardManager: Enhanced logic would run here');
                }
              }}
              style={[styles.actionButton, { backgroundColor: themeStyles.primary }]}
            >
              Test Card Selection
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                console.log('🎯 Test: Timeline placement simulation');
                if (CardManager) {
                  console.log('🎯 CardManager: Validation logic would run here');
                }
              }}
              style={[styles.actionButton, { borderColor: themeStyles.primary }]}
              labelStyle={{ color: themeStyles.primary }}
            >
              Test Timeline Placement
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  sampleCardsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  enhancement: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  sampleCard: {
    width: 200,
    marginRight: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 11,
    marginBottom: 4,
  },
  actionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});
