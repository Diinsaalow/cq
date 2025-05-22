import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const SkeletonCategorySection = ({ colors }: { colors: any }) => {
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={[styles.skeletonContainer, { backgroundColor: colors.background }]}
    >
      <View style={styles.skeletonHeaderContainer}>
        <Animated.View
          style={[
            styles.skeletonTitle,
            { backgroundColor: colors.shadow, opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            { backgroundColor: colors.shadow, opacity: fadeAnim },
          ]}
        />
      </View>

      <View style={styles.skeletonSectionsContainer}>
        {[1, 2, 3].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.skeletonSection,
              { backgroundColor: colors.shadow, opacity: fadeAnim },
            ]}
          >
            <Animated.View
              style={[
                styles.skeletonImage,
                { backgroundColor: colors.shadow, opacity: fadeAnim },
              ]}
            />
            <View style={styles.skeletonContent}>
              <Animated.View
                style={[
                  styles.skeletonSectionTitle,
                  { backgroundColor: colors.shadow, opacity: fadeAnim },
                ]}
              />
              <Animated.View
                style={[
                  styles.skeletonSectionSubtitle,
                  { backgroundColor: colors.shadow, opacity: fadeAnim },
                ]}
              />
            </View>
          </Animated.View>
        ))}
      </View>

      <Animated.View
        style={[
          styles.skeletonSeeMore,
          { backgroundColor: colors.shadow, opacity: fadeAnim },
        ]}
      />
    </View>
  );
};

export default SkeletonCategorySection;
const styles = StyleSheet.create({
  skeletonContainer: {
    borderRadius: 16,
    marginBottom: 32,
  },
  skeletonHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonTitle: {
    width: 150,
    height: 28,
    borderRadius: 4,
    marginRight: 12,
  },
  skeletonLine: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  skeletonSectionsContainer: {
    gap: 16,
    marginBottom: 12,
  },
  skeletonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  skeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonSectionTitle: {
    height: 20,
    width: '70%',
    borderRadius: 4,
  },
  skeletonSectionSubtitle: {
    height: 16,
    width: '40%',
    borderRadius: 4,
  },
  skeletonSeeMore: {
    height: 40,
    width: '100%',
    borderRadius: 8,
  },
});
