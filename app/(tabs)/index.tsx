import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import CategorySection from '../../components/CategorySection';
import Colors from '../../constants/Colors';
import { MOCK_DATA } from '../../data/mockData';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSectionPress = useCallback((id: string) => {
    router.push(`/section/${id}`);
  }, [router]);

  const handleSeeMorePress = useCallback((categoryId: string) => {
    router.push(`/category/${categoryId}`);
  }, [router]);

  return (
    <View style={styles.container}>
      <Header title="NAME OF THE APP" />
      
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
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
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
});