import React from 'react';
import {
  Platform,
  View,
  Image,
  StyleProp,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
} from 'react-native';

import ErrorBoundary from './ErrorBoundary';

interface SVGIconProps {
  source: any; // This can be imported SVG component or require/import path
  width?: number;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Cross-platform SVG icon component that handles differences between web and native
 * Wrapped in an ErrorBoundary to prevent app crashes due to SVG rendering issues
 */
const SVGIcon: React.FC<SVGIconProps> = ({
  source,
  width = 24,
  height = 24,
  color,
  style,
  testID,
}) => {
  // Create a fallback component in case of errors
  const FallbackIcon = () => (
    <View
      style={[
        { width, height, backgroundColor: '#ddd', borderRadius: 4 },
        style as StyleProp<ViewStyle>,
      ]}
      testID={`${testID}-fallback`}
    />
  );

  // Handle rendering differently based on platform and source type
  const renderIcon = () => {
    try {
      // If source is a function/component (imported SVG component)
      if (typeof source === 'function') {
        const SvgComponent = source;
        return (
          <SvgComponent width={width} height={height} color={color} style={style} testID={testID} />
        );
      }

      // If source is a string/number (require path)
      if (typeof source === 'number' || typeof source === 'string') {
        const imageStyle: StyleProp<ImageStyle> = {
          width,
          height,
          // Add any other image-specific styles here
        };

        if (Platform.OS === 'web') {
          // For web, use Image with source as is
          return (
            <Image
              // Cast source to the appropriate type for Image
              source={source as ImageSourcePropType}
              style={imageStyle}
              testID={testID}
            />
          );
        } else {
          // For native, use Image with require
          return (
            <Image
              source={typeof source === 'number' ? source : { uri: source }}
              style={imageStyle}
              testID={testID}
            />
          );
        }
      }

      // If we can't determine the type, return fallback
      return <FallbackIcon />;
    } catch (error) {
      console.error('SVG rendering error:', error);
      return <FallbackIcon />;
    }
  };

  return <ErrorBoundary fallback={<FallbackIcon />}>{renderIcon()}</ErrorBoundary>;
};

export default SVGIcon;
