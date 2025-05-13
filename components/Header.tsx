import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Music2 } from 'lucide-react-native';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* <Music2 size={32} color={Colors.primary} style={styles.icon} /> */}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.decorativeBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: Colors.shadow,
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
    color: Colors.textDark,
    textAlign: 'center',
  },
  decorativeBar: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    opacity: 0.2,
  },
});