import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SectionCard from './SectionCard';
import SeeMoreButton from './SeeMoreButton';
import Colors from '../constants/Colors';
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
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{data.title}</Text>
        <View style={styles.decorativeLine} />
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
    marginBottom: 32,
  },
  headerContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginRight: 12,
  },
  decorativeLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    borderRadius: 1,
  },
  sectionsContainer: {
    marginBottom: 16,
  },
});
