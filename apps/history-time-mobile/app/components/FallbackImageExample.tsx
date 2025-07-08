/**
 * Example usage of shared fallback SVG components in React Native
 * This shows how the same SVG components can be used across web and mobile
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

// Import shared SVG components (when available)
// import { AncientHistorySVG, HistoryDefaultSVG } from 'history-time-shared';

interface FallbackImageExampleProps {
  category?: string;
  width?: number;
  height?: number;
}

export const FallbackImageExample: React.FC<FallbackImageExampleProps> = ({
  category = 'history-default',
  width = 200,
  height = 150,
}) => {
  // For now, create a simple placeholder until the shared package is properly integrated
  const renderFallbackSVG = () => {
    // This would eventually use the shared SVG components:
    // switch(category) {
    //   case 'ancient-history':
    //     return <AncientHistorySVG width={width} height={height} />;
    //   default:
    //     return <HistoryDefaultSVG width={width} height={height} />;
    // }

    // Temporary placeholder
    return (
      <View style={[styles.placeholder, { width, height }]}>
        {/* This would be replaced with actual SVG component */}
      </View>
    );
  };

  return <View style={styles.container}>{renderFallbackSVG()}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FallbackImageExample;
