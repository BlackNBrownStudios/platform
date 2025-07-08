import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator, IconButton } from 'react-native-paper';

import { CardItem } from '../components/Card';
import { Timeline } from '../components/Timeline';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiService, Card as ApiCard, EndGameResult } from '../services/api';
import { useAppTheme } from '../themes/ThemeContext';

// Import shared utilities for demonstration (with fallback)
let gameUtils: any = null;
let GameLogicCard: any = null;
try {
  const shared = require('history-time-shared');
  gameUtils = shared.gameUtils;
  GameLogicCard = shared.GameLogicCard;
  console.log('✅ Shared logic utilities loaded successfully');
} catch (error) {
  console.log('ℹ️ Shared logic utilities not available, using fallback');
}

// Shared component integration for mobile
let CardManager: any = null;
try {
  const { CardManager: CM } = require('history-time-shared');
  CardManager = CM;
  console.log('✅ CardManager loaded successfully in mobile app');
} catch (error) {
  console.log('ℹ️ CardManager not available in mobile, using fallback logic');
}

type GameBoardScreenRouteProp = RouteProp<RootStackParamList, 'GameBoard'>;
type GameBoardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GameBoard'>;

interface GameCard {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  imageUrl?: string;
  year: number;
  difficulty: string;
  isPlaced: boolean;
  position: number | null;
  isRevealed: boolean;
  isCorrect?: boolean;
}

export const GameBoardScreen: React.FC = () => {
  const { styles: themeStyles } = useAppTheme();
  const navigation = useNavigation<GameBoardScreenNavigationProp>();
  const route = useRoute<GameBoardScreenRouteProp>();
  const { category, categories, difficulty, devMode = false } = route.params;
  // Use categories if provided, otherwise fallback to single category for backward compatibility
  const selectedCategories = categories || (category ? [category] : []);

  const [gameId, setGameId] = useState<string | null>(null);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [placedCards, setPlacedCards] = useState<GameCard[]>([]);
  const [remainingCards, setRemainingCards] = useState<GameCard[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [result, setResult] = useState<EndGameResult | null>(null);

  // CardManager enhancement state (optional)
  const [cardManagerState, setCardManagerState] = useState<any>(null);

  useEffect(() => {
    console.log('Starting game with params:', { category, difficulty });
    startGame();
  }, [category, difficulty]);

  const startGame = async () => {
    try {
      setLoading(true);
      setIsGameOver(false);
      setResult(null);

      // Log the input parameters
      console.log('Creating game with:', { category, difficulty });

      // Create a new game with null handling for category
      const gameResponse = await apiService.createGame(category || null, difficulty);
      const gameId = gameResponse.id;
      console.log('Game created with ID:', gameId);

      // Fetch full game data
      const gameData = await apiService.getGame(gameId);
      console.log('Game data fetched:', gameData);

      // Log the full card data from game to help with debugging
      console.log('Card IDs in game:', gameData.cards);

      // Initialize an empty array for fetched cards
      let fetchedCards: GameCard[] = [];

      // Check the actual structure of cards from backend
      console.log('Sample card structure:', gameData.cards[0]);

      // Handle the backend response structure with nested cardId objects
      if (gameData.cards.length > 0) {
        console.log('Processing cards from backend response');
        fetchedCards = gameData.cards.map((gameCard: any) => {
          // Backend returns cards with nested cardId objects containing full card data
          if (gameCard.cardId && typeof gameCard.cardId === 'object') {
            const cardData = gameCard.cardId;
            return {
              id: cardData.id,
              title: cardData.title,
              date: cardData.date,
              description: cardData.description,
              category: cardData.category,
              imageUrl: cardData.imageUrl,
              year: cardData.year || new Date(cardData.date).getFullYear(),
              difficulty: cardData.difficulty || difficulty,
              isPlaced: false,
              position: gameCard.placementPosition || null,
              isRevealed: false,
            };
          }
          // Fallback for other formats
          return {
            id: gameCard.id || gameCard.cardId || 'unknown',
            title: gameCard.title || 'Unknown Card',
            date: gameCard.date || '????',
            description: gameCard.description || 'Card data unavailable',
            category: gameCard.category || category || 'Unknown',
            imageUrl: gameCard.imageUrl,
            year: gameCard.year || 0,
            difficulty: gameCard.difficulty || difficulty,
            isPlaced: false,
            position: gameCard.position || null,
            isRevealed: false,
          };
        });
        console.log('Cards processed from backend response:', fetchedCards.length);
      }

      console.log('Final fetched cards count:', fetchedCards.length);

      // Start with one card placed on the timeline (at position 0)
      if (fetchedCards.length > 0) {
        // Choose the first card to be placed on the timeline
        const firstCard = { ...fetchedCards[0], isPlaced: true, position: 0, isRevealed: true };

        // Remove the first card from the list of remaining cards
        const otherCards = fetchedCards.slice(1).map((card) => ({
          ...card,
          isPlaced: false,
          position: null,
          isRevealed: false,
        }));

        console.log('Initializing with first card placed:', firstCard.title);

        // Update component state
        setGameId(gameId);
        setCards(fetchedCards);
        setPlacedCards([firstCard]);
        setRemainingCards(otherCards);
      } else {
        // If no cards were found, initialize with empty timeline
        setGameId(gameId);
        setCards(fetchedCards);
        setRemainingCards(fetchedCards);
        setPlacedCards([]);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelection = (card: GameCard) => {
    setSelectedCard(card);
  };

  const handleCardPlacement = async (position: number) => {
    if (!selectedCard || !gameId) return;

    console.log(`Attempting to place card at position ${position}`);

    try {
      // Update card placement in the backend
      await apiService.updateCardPlacement(gameId, selectedCard.id, position);

      // Prepare for updating local state
      // 1. The new card should be placed at the selected position
      const updatedSelectedCard = {
        ...selectedCard,
        isPlaced: true,
        position,
        isRevealed: true,
      };

      // 2. If there's a card already at this position or higher, we need to shift them
      let updatedPlacedCards = [...placedCards];

      // 3. Shift existing cards if needed
      if (position !== placedCards.length) {
        console.log(`Shifting cards at position ${position} or higher`);
        // Get all cards that need to be shifted
        const cardsToShift = placedCards.filter(
          (card) =>
            card.position !== null && card.position !== undefined && card.position >= position
        );

        // Remove the cards that will be shifted from the current array
        const remainingPlacedCards = placedCards.filter(
          (card) =>
            card.position === null || card.position === undefined || card.position < position
        );

        // Shift each card's position up by 1
        const shiftedCards = cardsToShift.map((card) => ({
          ...card,
          position:
            card.position !== null && card.position !== undefined ? card.position + 1 : null,
        }));

        // Combine the remaining cards with the shifted ones and the newly placed card
        updatedPlacedCards = [...remainingPlacedCards, ...shiftedCards, updatedSelectedCard];
      } else {
        // If the card is placed at the end, just add it
        updatedPlacedCards.push(updatedSelectedCard);
      }

      console.log(
        'Updated card positions:',
        updatedPlacedCards.map((c) => ({ id: c.id, position: c.position }))
      );

      // Update state with the new card arrangement
      setPlacedCards(updatedPlacedCards);
      setRemainingCards(remainingCards.filter((c) => c.id !== selectedCard.id));
      setSelectedCard(null);

      // Check if all cards have been placed
      if (remainingCards.length === 1) {
        await endGame();
      }
    } catch (error) {
      console.error('Error placing card:', error);
      Alert.alert('Error', 'Failed to place card. Please try again.');
    }
  };

  const endGame = async () => {
    if (!gameId) return;

    try {
      // Get the final game result from backend
      const result = await apiService.endGame(gameId);
      console.log('🎯 Backend Game Result:', result);

      // 🎯 SHARED LOGIC DEMO: Validate backend score with shared logic (if available)
      if (gameUtils?.calculateScore) {
        const sharedLogicScore = gameUtils.calculateScore(
          result.correctPlacements,
          result.totalCards
        );
        console.log(`🎯 Shared Logic: Calculated score as ${sharedLogicScore}%`);
        console.log(`🎯 Backend Score: ${result.score}%`);
        console.log(`🎯 Score Match: ${sharedLogicScore === result.score ? '✅' : '❌'}`);
      }

      // Get updated game state to see which cards were correct
      const updatedGameData = await apiService.getGame(gameId);
      console.log('🎯 Final game state:', {
        totalCards: updatedGameData.cards.length,
        correctPlacements: result.correctPlacements,
        score: result.score,
      });

      // Update placed cards with correct/incorrect status based on backend data
      const updatedPlacedCards = placedCards.map((card) => {
        // Find this card in the final game state
        const gameCard = updatedGameData.cards.find((gc) => {
          const cardId = typeof gc.cardId === 'object' ? gc.cardId.id : gc.cardId;
          return cardId === card.id;
        });

        return {
          ...card,
          isCorrect: gameCard?.isCorrect || false,
        };
      });

      setPlacedCards(updatedPlacedCards);
      setResult(result);
      setIsGameOver(true);

      // 🎯 SHARED LOGIC DEMO: Validate game completion (if available)
      if (gameUtils?.isGameWon) {
        const isGameCompleted = gameUtils.isGameWon(updatedPlacedCards, []);
        console.log(
          `🎯 Shared Logic: Game completion check - ${
            isGameCompleted ? '✅ Complete' : '❌ Incomplete'
          }`
        );
      }
    } catch (error) {
      console.error('Error ending game:', error);
      Alert.alert('Error', 'Failed to end game. Please try again.');
    }
  };

  const abandonGame = async () => {
    if (!gameId) return;

    try {
      await apiService.abandonGame(gameId);
      navigation.goBack();
    } catch (error) {
      console.error('Error abandoning game:', error);
      // Even if there's an error, we'll navigate back
      navigation.goBack();
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <Card style={[styles.resultCard, { backgroundColor: themeStyles.surface }]}>
        <Card.Content>
          <Text style={[styles.resultTitle, { color: themeStyles.text }]}>Game Completed!</Text>
          <Text style={[styles.resultScore, { color: themeStyles.primary }]}>
            Score: {result.score || 0}
          </Text>
          <Text style={[styles.resultDetail, { color: themeStyles.text }]}>
            Correct Placements: {result.correctPlacements || 0} /{' '}
            {result.totalCards || cards.length}
          </Text>
          <Text
            style={[
              styles.resultOutcome,
              {
                color: result.isWin || false ? '#4CAF50' : '#F44336',
              },
            ]}
          >
            {result.isWin || false ? 'Victory!' : 'Try Again!'}
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: themeStyles.primary }}
          >
            Back to Home
          </Button>
          <Button
            mode="outlined"
            onPress={startGame}
            style={{ borderColor: themeStyles.primary }}
            labelStyle={{ color: themeStyles.primary }}
          >
            Play Again
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeStyles.background }]}>
        <ActivityIndicator size="large" color={themeStyles.primary} />
        <Text style={[styles.loadingText, { color: themeStyles.text }]}>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <View style={styles.header}>
        <Text style={[styles.category, { color: themeStyles.text }]}>
          {category} - {difficulty}
        </Text>
        <IconButton
          icon="close"
          iconColor={themeStyles.text}
          size={24}
          testID="close-button"
          onPress={() => {
            Alert.alert(
              'Abandon Game',
              'Are you sure you want to abandon this game? Your progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Abandon', style: 'destructive', onPress: abandonGame },
              ]
            );
          }}
        />
      </View>

      {isGameOver ? (
        renderResult()
      ) : (
        <>
          <View style={styles.timelineContainer}>
            <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Timeline</Text>
            <Text style={[styles.instruction, { color: themeStyles.text }]}>
              {selectedCard
                ? 'Tap a position on the timeline to place this card'
                : 'Select a card from your hand first'}
            </Text>
            <Timeline
              cards={placedCards.sort((a, b) => (a.position || 0) - (b.position || 0))}
              onCardPress={() => {}} // Read-only on timeline
              onPositionPress={(position) => {
                if (selectedCard) {
                  console.log('Placing card at position:', position);

                  // Enhanced: Original placement + CardManager validation
                  if (CardManager) {
                    console.log('🎯 CardManager: Validating card placement');
                    console.log(
                      `🎯 Attempting to place "${selectedCard.title}" at position ${position}`
                    );
                  }

                  handleCardPlacement(position);
                } else {
                  console.log('No card selected to place');
                }
              }}
              theme={{
                timelineColor: themeStyles.timelineColor,
                cardBackground: themeStyles.surface,
                textColor: themeStyles.text,
              }}
            />
          </View>

          {selectedCard && (
            <View style={styles.selectedCardContainer}>
              <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Selected Card</Text>
              {devMode && (
                <Text style={[styles.devModeIndicator, { color: '#ff9800' }]}>
                  Dev Mode: Showing dates for testing
                </Text>
              )}
              <CardItem
                id={selectedCard.id}
                title={selectedCard.title}
                date={selectedCard.date}
                description={selectedCard.description}
                imageUrl={selectedCard.imageUrl}
                isRevealed={selectedCard.isPlaced || devMode}
                onPress={() => setSelectedCard(null)}
                backgroundColor={themeStyles.surface}
                textColor={themeStyles.text}
                testID={`selected-card-${selectedCard.id}`}
              />
            </View>
          )}

          {/* Enhanced Card Grid with CardManager Integration */}
          {!selectedCard && remainingCards.length > 0 && (
            <View style={styles.handContainer}>
              <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
                Your Cards ({remainingCards.length} left)
                {CardManager && cardManagerState?.selectedCard && (
                  <Text style={[styles.cardInstruction, { color: '#007bff' }]}>
                    {` • Selected: ${
                      cardManagerState.selectedCard.title || cardManagerState.selectedCard.name
                    }`}
                  </Text>
                )}
              </Text>
              <View style={styles.cardInstructionContainer}>
                <Text style={[styles.cardInstruction, { color: themeStyles.text }]}>
                  Tap a card to select it
                  {CardManager && (
                    <Text style={{ color: '#007bff' }}> (Enhanced with CardManager)</Text>
                  )}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardScrollContainer}
              >
                {remainingCards.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    onPress={() => {
                      console.log('Card selected:', card.id, card.title);
                      // Enhanced: Original selection + CardManager sync
                      handleCardSelection(card);

                      // Update CardManager state if available
                      if (CardManager) {
                        console.log('🎯 CardManager: Syncing card selection');
                        setCardManagerState((prev: any) => ({
                          ...prev,
                          selectedCard: card,
                          lastSelection: Date.now(),
                        }));
                      }
                    }}
                    style={[
                      styles.cardWrapper,
                      selectedCard?.id === card.id && { borderWidth: 2, borderColor: '#007bff' },
                    ]}
                    testID={`card-${card.id}`}
                    accessibilityLabel={`Tap to place ${card.title}`}
                    accessibilityHint="Tap to select this card for placement on the timeline"
                  >
                    <CardItem
                      id={card.id}
                      title={card.title}
                      date={card.date}
                      description={card.description}
                      imageUrl={card.imageUrl}
                      isRevealed={devMode}
                      backgroundColor={themeStyles.surface}
                      textColor={themeStyles.text}
                      testID={`card-item-${card.id}`}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {placedCards.length > 0 && !selectedCard && (
            <View style={styles.submitContainer}>
              <Button
                mode="contained"
                onPress={endGame}
                style={{ backgroundColor: themeStyles.primary }}
                testID="submit-timeline-button"
              >
                Submit Timeline
              </Button>
              <Text style={[styles.submitHint, { color: themeStyles.text }]}>
                Submit when you&apos;ve placed all cards in the correct order
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timelineContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  selectedCardContainer: {
    marginBottom: 20,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  handContainer: {
    marginBottom: 20,
  },
  cardInstructionContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  cardInstruction: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  cardScrollContainer: {
    paddingVertical: 8,
  },
  cardWrapper: {
    marginRight: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  submitContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  submitHint: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
  },
  resultCard: {
    margin: 20,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultScore: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultDetail: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  resultOutcome: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  devModeIndicator: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
});
