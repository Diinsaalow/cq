import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Music, X } from 'lucide-react-native';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';

interface UploadModalProps {
  visible: boolean;
  title: string;
  progress: number;
  onCancel: () => void;
  animation: Animated.Value;
}

export default function UploadModal({
  visible,
  title,
  progress,
  onCancel,
  animation,
}: UploadModalProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
        activeOpacity={1}
      />
      <Animated.View
        style={[
          styles.modal,
          {
            backgroundColor: colors.white,
            transform: [
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, -150],
                }),
              },
            ],
            opacity: animation,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Music size={32} color={colors.primary} />
              </View>
              <Text
                style={[styles.title, { color: colors.textDark }]}
                numberOfLines={1}
              >
                Uploading Audio
              </Text>
            </View>
          </View>

          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            {title}
          </Text>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: colors.lightGray },
              ]}
            >
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textLight }]}>
              {progress}%
            </Text>
          </View>

          <Text style={[styles.info, { color: colors.textLight }]}>
            Please keep the app open while uploading. You can cancel the upload
            at any time.
          </Text>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.error }]}
            onPress={onCancel}
          >
            <X size={20} color={colors.white} />
            <Text style={[styles.cancelText, { color: colors.white }]}>
              Cancel Upload
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modal: {
    position: 'absolute',
    top: '50%',
    left: 24,
    right: 24,
    transform: [{ translateY: -150 }],
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  content: {
    padding: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    padding: 14,
    borderRadius: 20,
    marginRight: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 17,
    fontWeight: '700',
    minWidth: 52,
    textAlign: 'right',
  },
  info: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    opacity: 0.85,
    fontWeight: '500',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 10,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
