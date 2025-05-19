import React, { useState } from 'react';
import {
  Image,
  ImageStyle,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { Image as ImageIcon } from 'lucide-react-native';

interface OptimizedImageProps {
  source: { uri: string };
  style?: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

export default function OptimizedImage({
  source,
  style,
  resizeMode = 'cover',
}: OptimizedImageProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <View style={[styles.container, style]}>
      {!error ? (
        <Image
          source={source}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      ) : (
        <View style={[styles.errorContainer, style]}>
          <ImageIcon size={32} color={colors.textLight} />
        </View>
      )}
      {loading && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
