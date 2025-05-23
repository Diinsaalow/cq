import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
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

export default function UploadSkeleton() {
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.white, borderBottomColor: colors.shadow },
        ]}
      >
        <SkeletonView width={40} height={40} style={styles.backButton} />
        <SkeletonView width={120} height={24} />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Instructions */}
        <View
          style={[
            styles.instructionContainer,
            { backgroundColor: colors.white, borderColor: colors.shadow },
          ]}
        >
          <SkeletonView width={180} height={24} style={{ marginBottom: 8 }} />
          <SkeletonView width="100%" height={60} />
        </View>

        {/* Title Input */}
        <View style={styles.inputContainer}>
          <SkeletonView width={100} height={20} style={{ marginBottom: 8 }} />
          <SkeletonView width="100%" height={56} />
        </View>

        {/* Category Selection */}
        <View style={styles.inputContainer}>
          <SkeletonView width={100} height={20} style={{ marginBottom: 8 }} />
          <SkeletonView width="100%" height={56} />
        </View>

        {/* Section Selection */}
        <View style={styles.inputContainer}>
          <SkeletonView width={100} height={20} style={{ marginBottom: 8 }} />
          <SkeletonView width="100%" height={56} />
        </View>

        {/* File Upload Area */}
        <View style={styles.inputContainer}>
          <SkeletonView width={100} height={20} style={{ marginBottom: 8 }} />
          <View
            style={[
              styles.uploadArea,
              {
                backgroundColor: colors.white,
                borderColor: colors.primary,
              },
            ]}
          >
            <SkeletonView width={80} height={80} style={{ marginBottom: 12 }} />
            <SkeletonView width={200} height={24} style={{ marginBottom: 4 }} />
            <SkeletonView width={150} height={20} />
          </View>
        </View>

        {/* Upload Button */}
        <SkeletonView width="100%" height={56} style={styles.uploadButton} />
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
    marginRight: 12,
  },
  contentContainer: {
    padding: 20,
  },
  instructionContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  uploadArea: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    borderRadius: 12,
  },
});
