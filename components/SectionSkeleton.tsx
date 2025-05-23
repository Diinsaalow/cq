import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

export default function SectionSkeleton() {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Skeleton */}
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <Animated.View
          style={[
            styles.skeleton,
            {
              width: 40,
              height: 40,
              borderRadius: 12,
              opacity,
              backgroundColor: colors.textLight,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.skeleton,
            {
              width: 200,
              height: 24,
              borderRadius: 6,
              opacity,
              backgroundColor: colors.textLight,
            },
          ]}
        />
      </View>

      {/* Audio List Skeletons */}
      <View style={styles.audioList}>
        {[1, 2, 3, 4, 5].map((_, index) => (
          <Animated.View key={index} style={styles.audioItemContainer}>
            <View
              style={[
                styles.audioItem,
                { backgroundColor: colors.white, shadowColor: colors.shadow },
              ]}
            >
              <View style={styles.audioInfo}>
                <Animated.View
                  style={[
                    styles.skeleton,
                    {
                      width: '80%',
                      height: 20,
                      borderRadius: 4,
                      opacity,
                      backgroundColor: colors.textLight,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.skeleton,
                    {
                      width: '40%',
                      height: 16,
                      borderRadius: 4,
                      marginTop: 8,
                      opacity,
                      backgroundColor: colors.textLight,
                    },
                  ]}
                />
              </View>
              <View style={styles.playButton}>
                <Animated.View
                  style={[
                    styles.skeleton,
                    {
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      opacity,
                      backgroundColor: colors.white,
                    },
                  ]}
                />
              </View>
            </View>
          </Animated.View>
        ))}
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
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  audioList: {
    flex: 1,
    padding: 20,
  },
  audioItemContainer: {
    marginBottom: 12,
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  audioInfo: {
    flex: 1,
    marginRight: 12,
  },
  skeleton: {
    overflow: 'hidden',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
