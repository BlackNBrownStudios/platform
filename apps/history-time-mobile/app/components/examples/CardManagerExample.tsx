import { CardManager, Card } from 'history-time-shared';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

import { useAppTheme } from '../../themes/ThemeContext';

interface CardManagerExampleProps {
  cards: Card[];
  onGameComplete?: (placedCards: { card: Card; position: number }[]) => void;
}

const CardManagerExample: React.FC<CardManagerExampleProps> = ({ cards, onGameComplete }) => {
  const { styles: themeStyles } = useAppTheme();

  const handleCardPlace = (card: Card, position: number) => {
    console.log(`Placed card "${card.title}" at position ${position}`);
  };

  const handleCardRemove = (card: Card, position: number) => {
    console.log(`Removed card "${card.title}" from position ${position}`);
  };

  const handleSelectionChange = (selectedCard: Card | null) => {
    console.log('Selection changed:', selectedCard?.title || 'none');
  };

  const validatePlacement = (card: Card, position: number, placedCards: any[]) => {
    // Example: Only allow placement in chronological order
    if (placedCards.length === 0) return true;

    const lastPlacedCard = placedCards[placedCards.length - 1];
    return card.year >= lastPlacedCard.card.year;
  };

  return (
    <CardManager
      cards={cards}
      maxPositions={cards.length}
      onCardPlace={handleCardPlace}
      onCardRemove={handleCardRemove}
      onSelectionChange={handleSelectionChange}
      validatePlacement={validatePlacement}
    >
      {({ state, actions }) => (
        <ScrollView style={styles.container}>
          {/* Game Status */}
          <View style={[styles.statusContainer, { backgroundColor: themeStyles.surface }]}>
            <Text style={[styles.statusTitle, { color: themeStyles.text }]}>Game Status</Text>
            <Text style={[styles.statusText, { color: themeStyles.text }]}>
              Selected: {state.selectedCard ? state.selectedCard.title : 'None'}
            </Text>
            <Text style={[styles.statusText, { color: themeStyles.text }]}>
              Placed: {state.placedCards.length} / {cards.length}
            </Text>
            <Text style={[styles.statusText, { color: themeStyles.text }]}>
              Available: {state.availableCards.length}
            </Text>
          </View>

          {/* Timeline Slots */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Timeline</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.timelineContainer}>
                {Array.from({ length: cards.length }, (_, index) => {
                  const placedCard = actions.getCardAtPosition(index);
                  const isOccupied = actions.isPositionOccupied(index);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timelineSlot,
                        isOccupied
                          ? { borderColor: '#4CAF50', backgroundColor: '#E8F5E8' }
                          : {
                              borderColor: themeStyles.timelineColor,
                              backgroundColor: themeStyles.surface,
                            },
                        state.selectedCard &&
                          !isOccupied && { borderWidth: 2, borderColor: '#2196F3' },
                      ]}
                      onPress={() => {
                        if (state.selectedCard && !isOccupied) {
                          actions.placeCard(index);
                        } else if (isOccupied) {
                          actions.removeCard(index);
                        }
                      }}
                      disabled={!state.selectedCard && !isOccupied}
                    >
                      {placedCard ? (
                        <View style={styles.placedCardContent}>
                          <Text
                            style={[styles.placedCardTitle, { color: themeStyles.text }]}
                            numberOfLines={2}
                          >
                            {placedCard.title}
                          </Text>
                          <Text style={[styles.placedCardYear, { color: themeStyles.primary }]}>
                            {placedCard.year}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.emptySlotContent}>
                          <Text style={[styles.positionText, { color: themeStyles.text }]}>
                            Position {index + 1}
                          </Text>
                          {state.selectedCard && (
                            <Text style={[styles.instructionText, { color: themeStyles.primary }]}>
                              Tap to place
                            </Text>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Available Cards */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Available Cards</Text>
            <View style={styles.cardsGrid}>
              {state.availableCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.cardItem,
                    { backgroundColor: themeStyles.surface },
                    state.selectedCard?.id === card.id && {
                      borderColor: '#2196F3',
                      borderWidth: 2,
                      backgroundColor: '#E3F2FD',
                    },
                  ]}
                  onPress={() => actions.selectCard(card)}
                >
                  <Text style={[styles.cardTitle, { color: themeStyles.text }]} numberOfLines={2}>
                    {card.title}
                  </Text>
                  <Text style={[styles.cardYear, { color: themeStyles.primary }]}>{card.year}</Text>
                  <Text
                    style={[styles.cardDescription, { color: themeStyles.text }]}
                    numberOfLines={3}
                  >
                    {card.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.clearButton,
                !state.selectedCard && styles.buttonDisabled,
              ]}
              onPress={actions.clearSelection}
              disabled={!state.selectedCard}
            >
              <Text style={styles.buttonText}>Clear Selection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={actions.resetCards}
            >
              <Text style={styles.buttonText}>Reset Game</Text>
            </TouchableOpacity>

            {state.placedCards.length === cards.length && (
              <TouchableOpacity
                style={[styles.button, styles.completeButton]}
                onPress={() => onGameComplete?.(state.placedCards)}
              >
                <Text style={styles.buttonText}>Complete Game</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </CardManager>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timelineContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  timelineSlot: {
    width: 120,
    height: 100,
    marginRight: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  placedCardContent: {
    alignItems: 'center',
  },
  placedCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  placedCardYear: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptySlotContent: {
    alignItems: 'center',
  },
  positionText: {
    fontSize: 12,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardYear: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 11,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#757575',
  },
  resetButton: {
    backgroundColor: '#F44336',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CardManagerExample;
