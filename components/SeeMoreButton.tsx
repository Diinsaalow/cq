import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { ChevronRight } from 'lucide-react-native';

interface SeeMoreButtonProps {
  onPress: () => void;
}

export default function SeeMoreButton({ onPress }: SeeMoreButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>See More</Text>
      <ChevronRight size={20} color={Colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
        ':hover': {
          transform: 'translateY(-2px)',
          backgroundColor: Colors.accent,
        },
      },
    }),
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
});