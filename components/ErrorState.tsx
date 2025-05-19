import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorState({
  message,
  onRetry,
  retryText = 'Retry',
}: ErrorStateProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <View style={styles.container}>
      <AlertCircle size={48} color={colors.error} />
      <Text style={[styles.message, { color: colors.textDark }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { color: colors.white }]}>
            {retryText}
          </Text>
        </TouchableOpacity>
      )}
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
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
