import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Animated, Platform } from 'react-native';
import { Card as PaperCard, Text } from 'react-native-paper';

import { useAppTheme } from '../themes/ThemeContext';

export interface CardItemProps {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  isRevealed?: boolean;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  testID?: string;
}

export const CardItem: React.FC<CardItemProps> = ({
  id,
  title,
  date,
  description,
  imageUrl,
  isRevealed = false,
  onPress,
  backgroundColor,
  textColor,
  testID,
}) => {
  const { styles: themeStyles } = useAppTheme();
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const cardStyle = {
    backgroundColor: backgroundColor || themeStyles.surface,
  };

  const textStyle = {
    color: textColor || themeStyles.text,
  };

  // Handle press animations
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.container,
        // For web only - apply cursor styling directly to the TouchableOpacity
        Platform.OS === 'web' && onPress ? styles.webCursorPointer : {},
      ]}
      disabled={!onPress}
      testID={testID}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.animContainer]}>
        <PaperCard style={[styles.card, cardStyle]}>
          {imageUrl && <PaperCard.Cover source={{ uri: imageUrl }} style={styles.cardImage} />}
          <PaperCard.Content>
            <Text style={[styles.title, textStyle]} numberOfLines={2}>
              {title}
            </Text>

            {isRevealed && date && <Text style={[styles.date, textStyle]}>{date}</Text>}

            <Text style={[styles.description, textStyle]} numberOfLines={3}>
              {description}
            </Text>
          </PaperCard.Content>
        </PaperCard>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Legacy support for the old Card component name
export const Card = CardItem;

const styles = StyleSheet.create({
  container: {
    width: 160,
    minHeight: 200,
    margin: 8,
  },
  animContainer: {
    width: '100%',
    height: '100%',
  },
  card: {
    elevation: 4,
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    height: 100,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
  },
  hiddenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressedOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },

  // Special style for web platform only
  webCursorPointer: Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {},
});
