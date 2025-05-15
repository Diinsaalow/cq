import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import CategorySection from '../../components/CategorySection';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { MOCK_DATA } from '../../data/mockData';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const handleSectionPress = useCallback(
    (id: string) => {
      router.push(`/section/${id}`);
    },
    [router]
  );

  const handleSeeMorePress = useCallback(
    (categoryId: string) => {
      router.push(`/category/${categoryId}`);
    },
    [router]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Diinsaalow" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_DATA.map((category) => (
          <CategorySection
            key={category.id}
            data={category}
            onSectionPress={handleSectionPress}
            onSeeMorePress={handleSeeMorePress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
});
