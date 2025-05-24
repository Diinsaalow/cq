import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

const SkeletonItem = ({
  width,
  height,
  style,
}: {
  width: number | string;
  height: number;
  style?: any;
}) => {
  const translateX = useSharedValue(0);
  const itemWidth = typeof width === 'string' ? screenWidth : width;

  React.useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(-itemWidth, { duration: 1000 }),
        withTiming(itemWidth, { duration: 1000 })
      ),
      -1
    );
  }, [itemWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          overflow: 'hidden',
          backgroundColor: '#E1E9EE',
          borderRadius: 4,
        },
        style,
      ]}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

export default function PlayerSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonItem width={40} height={40} style={styles.backButton} />
        <View style={styles.headerText}>
          <SkeletonItem width={100} height={16} style={styles.headerTitle} />
          <SkeletonItem width={150} height={18} style={styles.headerSubtitle} />
        </View>
      </View>

      {/* Album Art Skeleton */}
      <View style={styles.albumArtContainer}>
        <SkeletonItem
          width={screenWidth - 80}
          height={screenWidth - 80}
          style={styles.albumArt}
        />
      </View>

      {/* Track Info Skeleton */}
      <View style={styles.trackInfo}>
        <SkeletonItem width={200} height={24} style={styles.trackTitle} />
        <SkeletonItem width={150} height={16} style={styles.trackSubtitle} />
      </View>

      {/* Progress Bar Skeleton */}
      <View style={styles.progressContainer}>
        <SkeletonItem width="100%" height={6} style={styles.progressBar} />
        <View style={styles.timeContainer}>
          <SkeletonItem width={40} height={12} />
          <SkeletonItem width={40} height={12} />
        </View>
      </View>

      {/* Controls Skeleton */}
      <View style={styles.controls}>
        <SkeletonItem width={32} height={32} style={styles.controlButton} />
        <SkeletonItem width={64} height={64} style={styles.playButton} />
        <SkeletonItem width={32} height={32} style={styles.controlButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 12,
    borderRadius: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: 8,
  },
  headerSubtitle: {
    marginTop: 4,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  albumArt: {
    borderRadius: 20,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  trackTitle: {
    marginBottom: 8,
  },
  trackSubtitle: {
    marginTop: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  controlButton: {
    margin: 20,
  },
  playButton: {
    marginHorizontal: 20,
    borderRadius: 40,
  },
});
