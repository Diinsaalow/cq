import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

export default function StatsSkeleton() {
  return (
    <View style={styles.statsContainer}>
      {[0, 1, 2].map((_, idx) => (
        <View key={idx} style={styles.statCard}>
          <ShimmerPlaceHolder
            style={styles.shimmerNumber}
            shimmerStyle={styles.shimmerNumber}
          />
          <ShimmerPlaceHolder
            style={styles.shimmerLabel}
            shimmerStyle={styles.shimmerLabel}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flex: 1,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  shimmerNumber: {
    width: 32,
    height: 28,
    borderRadius: 6,
    marginBottom: 8,
  },
  shimmerLabel: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
});
