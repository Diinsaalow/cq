import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SectionCard from './SectionCard';
import SeeMoreButton from './SeeMoreButton';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { CategoryData } from '../types';

interface CategorySectionProps {
  data: CategoryData;
  onSectionPress: (id: string) => void;
  onSeeMorePress: (categoryId: string) => void;
  home?: boolean;
}

export default function CategorySection({
  data,
  onSectionPress,
  onSeeMorePress,
  home = false,
}: CategorySectionProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.textDark }]}>
          {data.title}
        </Text>
        <View
          style={[styles.decorativeLine, { backgroundColor: colors.primary }]}
        />
      </View>

      <View style={styles.sectionsContainer}>
        {home
          ? data.sections
              .slice(0, 3)
              .map((item, index) => (
                <SectionCard
                  key={item.id}
                  item={item}
                  onPress={onSectionPress}
                  index={index}
                />
              ))
          : data.sections.map((item, index) => (
              <SectionCard
                key={item.id}
                item={item}
                onPress={onSectionPress}
                index={index}
              />
            ))}
      </View>

      <SeeMoreButton onPress={() => onSeeMorePress(data.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 12,
  },
  decorativeLine: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    opacity: 0.15,
  },
  sectionsContainer: {
    gap: 16,
    marginBottom: 12,
  },
});
