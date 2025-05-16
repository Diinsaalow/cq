import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { MOCK_DATA } from '../../data/mockData';
import SectionCard from '../../components/SectionCard';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  // Find the category data
  const category = MOCK_DATA.find((cat) => cat.id === id);

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textDark }}>Category not found</Text>
      </View>
    );
  }

  const handleSectionPress = (sectionId: string) => {
    router.push(`/section/${sectionId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.white,
            borderBottomColor: colors.shadow,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor:
                theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          ]}
          onPress={() => router.back()}
        >
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>
          {category.title}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: colors.textDark }]}>
          All Sections
        </Text>
        {category.sections.map((section, index) => (
          <SectionCard
            key={section.id}
            item={section}
            onPress={handleSectionPress}
            index={index}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },
});
