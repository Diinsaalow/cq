import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

export default function CategorySkeleton() {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const getSkeletonColor = () => {
    return theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Skeleton */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.white,
            borderBottomColor: colors.shadow,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.backButton,
            {
              backgroundColor: getSkeletonColor(),
              opacity: fadeAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.headerTitle,
            {
              backgroundColor: getSkeletonColor(),
              opacity: fadeAnim,
            },
          ]}
        />
      </View>

      {/* Content Skeleton */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.title,
            {
              backgroundColor: getSkeletonColor(),
              opacity: fadeAnim,
            },
          ]}
        />

        {/* Section Cards Skeleton */}
        <View style={styles.sectionsContainer}>
          {[1, 2, 3, 4].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.sectionCard,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.sectionImage,
                  {
                    backgroundColor: getSkeletonColor(),
                    opacity: fadeAnim,
                  },
                ]}
              />
              <View style={styles.sectionContent}>
                <Animated.View
                  style={[
                    styles.sectionTitle,
                    {
                      backgroundColor: getSkeletonColor(),
                      opacity: fadeAnim,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.sectionSubtitle,
                    {
                      backgroundColor: getSkeletonColor(),
                      opacity: fadeAnim,
                    },
                  ]}
                />
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    width: 150,
    height: 24,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    width: 200,
    height: 36,
    borderRadius: 4,
    marginBottom: 24,
  },
  sectionsContainer: {
    gap: 16,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  sectionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  sectionContent: {
    flex: 1,
    gap: 8,
  },
  sectionTitle: {
    height: 20,
    width: '70%',
    borderRadius: 4,
  },
  sectionSubtitle: {
    height: 16,
    width: '40%',
    borderRadius: 4,
  },
});
