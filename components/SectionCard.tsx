import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { SectionItem } from '../types';
import { Play } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface SectionCardProps {
  item: SectionItem;
  onPress: (id: string) => void;
  index: number;
}

export default function SectionCard({ item, onPress, index }: SectionCardProps) {
  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100)}
      style={styles.animatedContainer}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress(item.id)}
        activeOpacity={0.95}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
          </View>
          
          <View style={styles.rightContainer}>
            <Text style={styles.count}>{item.count}</Text>
            <TouchableOpacity style={styles.playButton}>
              <Play size={16} color={Colors.white} style={styles.playIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    marginBottom: 16,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...Platform.select({
      web: {
        transition: 'all 0.3s ease-in-out',
        ':hover': {
          transform: 'translateY(-2px)',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.2,
        },
      },
    }),
  },
  imageContainer: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    opacity: 0.8,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  count: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 6,
  },
  playButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playIcon: {
    marginLeft: 2,
  },
});