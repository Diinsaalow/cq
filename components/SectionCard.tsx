import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { SectionItem } from '../types';
import { Play } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import OptimizedImage from './OptimizedImage';
import { getImageUrl } from '../utils/utils';

interface SectionCardProps {
  item: SectionItem;
  onPress: (id: string) => void;
  index: number;
}

export default function SectionCard({
  item,
  onPress,
  index,
}: SectionCardProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100)}
      style={styles.animatedContainer}
    >
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: colors.white,
            shadowColor: colors.shadow,
            borderColor: colors.shadow,
          },
        ]}
        onPress={() => onPress(item.id)}
        activeOpacity={0.95}
      >
        <View style={[styles.imageContainer, { shadowColor: colors.shadow }]}>
          {/* <Image source={{ uri: item.imageUrl }} style={styles.image} /> */}
          <OptimizedImage
            source={{
              uri: getImageUrl(item.imageUrl),
            }}
            style={styles.image}
            resizeMode='cover'
          />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: colors.textDark }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.textLight }]}
              numberOfLines={1}
            >
              {item.subtitle}
            </Text>
          </View>
          <View style={styles.rightContainer}>
            <Text style={[styles.count, { color: colors.primary }]}>
              {item.count}
            </Text>
            {/* <TouchableOpacity
              style={[
                styles.playButton,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
            >
              <Play size={16} color={colors.white} style={styles.playIcon} />
            </TouchableOpacity> */}
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
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  count: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  playButton: {
    borderRadius: 10,
    padding: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playIcon: {
    marginLeft: 2,
  },
});
