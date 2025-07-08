import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '../themes/ThemeContext';

import { CardItem, CardItemProps } from './Card';

export interface TimelineProps {
  cards: (CardItemProps & { position?: number | null; isCorrect?: boolean })[];
  onCardPress?: (card: CardItemProps) => void;
  onPositionPress?: (position: number) => void;
  theme?: {
    timelineColor: string;
    cardBackground: string;
    textColor: string;
  };
}

export const Timeline: React.FC<TimelineProps> = ({
  cards,
  onCardPress,
  onPositionPress,
  theme: customTheme,
}) => {
  const { styles: themeStyles } = useAppTheme();
  const [activePosition, setActivePosition] = useState<number | null>(null);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const timelineColor = customTheme?.timelineColor || themeStyles.timelineColor;
  const cardBackground = customTheme?.cardBackground || themeStyles.surface;
  const textColor = customTheme?.textColor || themeStyles.text;

  // Sort cards by position if available
  const sortedCards = [...cards].sort((a, b) => {
    if (a.position === null && b.position === null) return 0;
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    return (a.position || 0) - (b.position || 0);
  });

  // Start pulsing animation when a card can be placed
  React.useEffect(() => {
    if (onPositionPress) {
      // Create a pulsing effect for the empty card position
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animation when not needed
      pulseAnim.setValue(1);
    }
  }, [onPositionPress, pulseAnim]);

  const handlePositionPress = (position: number) => {
    console.log(`Timeline: Position ${position} pressed`);

    // Visual feedback
    setActivePosition(position);

    // If no handler is provided, do nothing
    if (!onPositionPress) {
      console.log('No position press handler provided');
      setActivePosition(null);
      return;
    }

    // Wait a tiny bit to give visual feedback before calling the handler
    setTimeout(() => {
      onPositionPress(position);
      setActivePosition(null);
    }, 150);
  };

  return (
    <View style={styles.container}>
      {/* Timeline line */}
      <View style={[styles.timelineLine, { backgroundColor: timelineColor }]} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Placement spot at the beginning of the timeline */}
        {cards.length > 0 && (
          <View style={styles.emptyCardContainer}>
            <View style={[styles.timelineNode, { backgroundColor: timelineColor }]} />
            <Animated.View
              style={{
                transform: [{ scale: onPositionPress ? pulseAnim : 1 }],
                opacity: activePosition === 0 ? 0.7 : 1,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.emptyCard,
                  {
                    borderColor: timelineColor,
                    backgroundColor: cardBackground + '20', // 20% opacity
                    borderWidth: onPositionPress ? 2 : 1, // Emphasize border when placeable
                  },
                ]}
                activeOpacity={0.6}
                disabled={!onPositionPress}
                onPress={() => handlePositionPress(0)}
              >
                <Text
                  style={[
                    styles.placeholderText,
                    {
                      color: onPositionPress ? timelineColor : textColor,
                      opacity: onPositionPress ? 1 : 0.6,
                    },
                  ]}
                >
                  {onPositionPress ? 'Place\nFirst' : 'Start'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <Text style={[styles.positionLabel, { color: textColor }]}>0</Text>
          </View>
        )}

        {/* Render cards interspersed with placement spots */}
        {sortedCards.map((card, index) => (
          <React.Fragment key={`card-block-${card.id}`}>
            {/* The actual card */}
            <View key={card.id} style={styles.cardContainer}>
              <View
                style={[
                  styles.timelineNode,
                  {
                    backgroundColor:
                      card.isCorrect === undefined
                        ? timelineColor
                        : card.isCorrect
                          ? '#4CAF50' // Green for correct
                          : '#F44336', // Red for incorrect
                  },
                ]}
              />

              <CardItem
                id={card.id}
                title={card.title}
                date={card.date}
                description={card.description}
                imageUrl={card.imageUrl}
                isRevealed={true}
                onPress={onCardPress ? () => onCardPress(card) : undefined}
                backgroundColor={cardBackground}
                textColor={textColor}
              />

              <Text style={[styles.positionLabel, { color: textColor }]}>
                {card.position !== null && card.position !== undefined ? card.position : index + 1}
              </Text>
            </View>

            {/* Placement spot after this card */}
            <View style={styles.emptyCardContainer}>
              <View style={[styles.timelineNode, { backgroundColor: timelineColor }]} />
              <Animated.View
                style={{
                  transform: [{ scale: onPositionPress ? pulseAnim : 1 }],
                  opacity:
                    activePosition ===
                    (card.position !== null && card.position !== undefined
                      ? card.position + 1
                      : index + 2)
                      ? 0.7
                      : 1,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.emptyCard,
                    {
                      borderColor: timelineColor,
                      backgroundColor: cardBackground + '20', // 20% opacity
                      borderWidth: onPositionPress ? 2 : 1, // Emphasize border when placeable
                    },
                  ]}
                  activeOpacity={0.6}
                  disabled={!onPositionPress}
                  onPress={() =>
                    handlePositionPress(
                      card.position !== null && card.position !== undefined
                        ? card.position + 1
                        : index + 2
                    )
                  }
                >
                  <Text
                    style={[
                      styles.placeholderText,
                      {
                        color: onPositionPress ? timelineColor : textColor,
                        opacity: onPositionPress ? 1 : 0.6,
                      },
                    ]}
                  >
                    {onPositionPress ? 'Place\nHere' : '+'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
              <Text style={[styles.positionLabel, { color: textColor }]}>
                {card.position !== null && card.position !== undefined
                  ? card.position + 1
                  : index + 2}
              </Text>
            </View>
          </React.Fragment>
        ))}

        {/* Main empty placeholder that's always visible at the end (this is for the tests) */}
        <View style={styles.emptyCardContainer} testID="timeline-placeholder">
          <View style={[styles.timelineNode, { backgroundColor: timelineColor }]} />
          <Animated.View
            style={{
              transform: [{ scale: onPositionPress ? pulseAnim : 1 }],
              opacity: activePosition === cards.length ? 0.7 : 1,
            }}
          >
            <TouchableOpacity
              style={[
                styles.emptyCard,
                {
                  borderColor: timelineColor,
                  backgroundColor: cardBackground + '20', // 20% opacity
                  borderWidth: onPositionPress ? 2 : 1, // Emphasize border when placeable
                },
              ]}
              activeOpacity={0.6}
              disabled={!onPositionPress}
              onPress={() => handlePositionPress(cards.length)}
            >
              <Text
                style={[
                  styles.placeholderText,
                  {
                    color: onPositionPress ? timelineColor : textColor,
                    opacity: onPositionPress ? 1 : 0.6,
                  },
                ]}
              >
                {onPositionPress ? 'Tap to place card' : 'Select a card first'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Text style={[styles.positionLabel, { color: textColor }]}>{cards.length + 1}</Text>
        </View>

        {/* Add additional empty placeholders if there are no cards */}
        {cards.length === 0 &&
          Array.from({ length: 5 }).map((_, i) => (
            <View key={`empty-start-${i}`} style={styles.emptyCardContainer}>
              <View style={[styles.timelineNode, { backgroundColor: timelineColor }]} />
              <Animated.View
                style={{
                  transform: [{ scale: onPositionPress ? pulseAnim : 1 }],
                  opacity: activePosition === i ? 0.7 : 1,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.emptyCard,
                    {
                      borderColor: timelineColor,
                      backgroundColor: cardBackground + '20', // 20% opacity
                      borderWidth: onPositionPress ? 2 : 1, // Emphasize border when placeable
                    },
                  ]}
                  activeOpacity={0.6}
                  disabled={!onPositionPress}
                  onPress={() => handlePositionPress(i)}
                >
                  <Text
                    style={[
                      styles.placeholderText,
                      {
                        color: onPositionPress ? timelineColor : textColor,
                        opacity: onPositionPress ? 1 : 0.6,
                      },
                    ]}
                  >
                    {onPositionPress ? 'Place\nHere' : 'Position'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
              <Text style={[styles.positionLabel, { color: textColor }]}>{i}</Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
    marginVertical: 16,
  },
  timelineLine: {
    position: 'absolute',
    height: 4,
    left: 0,
    right: 0,
    top: 120,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  timelineNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
    zIndex: 2,
  },
  positionLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyCardContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  emptyCard: {
    width: 160,
    height: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
  },
});
