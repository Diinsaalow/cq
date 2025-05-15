import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Music2 } from 'lucide-react-native';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.white,
          shadowColor: colors.shadow,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.content}>
        {/* <Music2 size={32} color={colors.primary} style={styles.icon} /> */}
        <Text style={[styles.title, { color: colors.textDark }]}>{title}</Text>
      </View>
      <View
        style={[styles.decorativeBar, { backgroundColor: colors.primary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  decorativeBar: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 3,
    borderRadius: 1,
    opacity: 0.2,
  },
});
