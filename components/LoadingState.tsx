import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function LoadingState({
  message = 'Loading...',
  size = 'large',
}: LoadingStateProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      <Text style={[styles.message, { color: colors.textLight }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});
