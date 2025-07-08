import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SvgProps } from 'react-native-svg';

// Import SVG assets
import GameSvg from '../assets/icons/game.svg';
import HomeSvg from '../assets/icons/home.svg';
import LeaderboardSvg from '../assets/icons/leaderboard.svg';
import SettingsSvg from '../assets/icons/settings.svg';
// Temporarily use settings icon for event until we have a proper event icon
import EventSvg from '../assets/icons/settings.svg';

import ErrorBoundary from './ErrorBoundary';
import SVGIcon from './SVGIcon';

// Define available icon names
export type IconName = 'home' | 'game' | 'leaderboard' | 'settings' | 'event';

// Map icon names to their SVG components
const icons: Record<IconName, any> = {
  home: HomeSvg,
  game: GameSvg,
  leaderboard: LeaderboardSvg,
  settings: SettingsSvg,
  event: EventSvg, // Using settings icon temporarily
};

// Props for the Icon component
export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: object;
  testID?: string;
}

/**
 * Icon component that renders SVG icons with proper cross-platform support
 * @param name - Name of the icon to render
 * @param size - Size of the icon (width and height)
 * @param color - Color of the icon
 * @param style - Additional styles to apply
 * @param testID - Test ID for testing
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000',
  style,
  testID = `icon-${name}`,
}) => {
  // Handle case where icon doesn't exist
  if (!icons[name]) {
    console.warn(`Icon "${name}" not found`);
    return (
      <View
        style={[styles.placeholder, { width: size, height: size }]}
        testID={`${testID}-missing`}
      />
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <View
          style={[styles.placeholder, { width: size, height: size }]}
          testID={`${testID}-error`}
        />
      }
    >
      <View style={[styles.container, style]} testID={testID}>
        <SVGIcon
          source={icons[name]}
          width={size}
          height={size}
          color={color}
          testID={`${testID}-svg`}
        />
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
});
