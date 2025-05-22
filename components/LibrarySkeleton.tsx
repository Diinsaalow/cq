import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, SafeAreaView } from 'react-native';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

const SkeletonView = ({
  width,
  height,
  style,
}: {
  width?: number | string;
  height?: number | string;
  style?: any;
}) => {
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

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor:
            theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          opacity: fadeAnim,
          borderRadius: 8,
        },
        style,
      ]}
    />
  );
};

export default function LibrarySkeleton() {
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header Skeleton */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.white, borderBottomColor: colors.shadow },
        ]}
      >
        <SkeletonView width={150} height={32} />
      </View>

      {/* Search Bar Skeleton */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.white, borderColor: colors.shadow },
        ]}
      >
        <SkeletonView width="100%" height={40} />
      </View>

      {/* Section Cards Skeleton */}
      <View style={styles.listContent}>
        {[1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.sectionCard,
              { backgroundColor: colors.white, shadowColor: colors.shadow },
            ]}
          >
            {/* Image Skeleton */}
            <SkeletonView width={70} height={70} style={styles.sectionImage} />

            {/* Content Skeleton */}
            <View style={styles.sectionInfo}>
              <SkeletonView
                width="80%"
                height={20}
                style={{ marginBottom: 8 }}
              />
              <SkeletonView
                width="60%"
                height={16}
                style={{ marginBottom: 8 }}
              />
              <SkeletonView width="40%" height={16} />
            </View>

            {/* Play Button Skeleton */}
            <SkeletonView width={36} height={36} style={styles.playButton} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  sectionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 12,
  },
});
