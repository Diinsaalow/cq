import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronRight } from 'lucide-react-native';

interface SeeMoreButtonProps {
  onPress: () => void;
}

export default function SeeMoreButton({ onPress }: SeeMoreButtonProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.primary, shadowColor: colors.primary },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, { color: colors.white }]}>See More</Text>
      <ChevronRight size={20} color={colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition:
          'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
        ':hover': {
          transform: 'translateY(-2px)',
          // backgroundColor: Colors.accent, // not theme-aware on hover
        },
      },
    }),
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
    // color: Colors.white, // replaced with theme-aware
  },
});
