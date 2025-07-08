import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';

import { apiService } from '../services/api';

interface HistoricalEventImageProps {
  eventTitle: string;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  style?: any;
}

const placeholderUri = 'https://via.placeholder.com/600x400?text=Loading...';

export const HistoricalEventImage: React.FC<HistoricalEventImageProps> = ({
  eventTitle,
  width = '100%',
  height = 200,
  borderRadius = 8,
  resizeMode = 'cover',
  style = {},
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use our backend image service to get an image for this event
        const response = await apiService.getEventImage(eventTitle);

        if (isMounted) {
          setImageUri(response.url);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching image:', err);
        if (isMounted) {
          setError('Failed to load image');
          setLoading(false);
          // Use a placeholder with the event title as fallback
          setImageUri(`https://via.placeholder.com/600x400?text=${encodeURIComponent(eventTitle)}`);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [eventTitle]);

  return (
    <View style={[styles.container, { width, height }, style]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : error ? (
        <Image
          source={{ uri: placeholderUri }}
          style={[styles.image, { borderRadius }]}
          resizeMode={resizeMode}
        />
      ) : (
        <Image
          source={{ uri: imageUri || placeholderUri }}
          style={[styles.image, { borderRadius }]}
          resizeMode={resizeMode}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HistoricalEventImage;
